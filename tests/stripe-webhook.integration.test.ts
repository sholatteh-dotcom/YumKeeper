import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import express from "express";
import type { Server } from "node:http";

import {
  handleStripeEvent,
  registerStripeWebhook,
  type StripeWebhookDependencies,
} from "../server/stripe-webhook";
import { STRIPE_PRICES } from "../lib/stripe-prices";

let server: Server | undefined;
let dependencies: {
  [K in keyof StripeWebhookDependencies]: ReturnType<typeof vi.fn>;
};
let originalStripeKey: string | undefined;
let originalWebhookSecret: string | undefined;

function subscriptionFixture(overrides: Record<string, unknown> = {}) {
  return {
    id: "sub_123",
    customer: "cus_123",
    status: "active",
    cancel_at_period_end: false,
    current_period_end: 1_800_000_000,
    items: {
      data: [
        {
          price: {
            id: STRIPE_PRICES.freshMonthly,
            recurring: { interval: "month" },
          },
        },
      ],
    },
    ...overrides,
  } as any;
}

function event(type: string, object: Record<string, unknown>) {
  return {
    id: "evt_123",
    type,
    data: { object },
  } as any;
}

async function startWebhookServer() {
  const app = express();
  registerStripeWebhook(app, dependencies);
  server = await new Promise<Server>((resolve) => {
    const httpServer = app.listen(0, "127.0.0.1", () => resolve(httpServer));
  });

  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Webhook server did not bind to TCP");
  return `http://127.0.0.1:${address.port}`;
}

beforeEach(() => {
  originalStripeKey = process.env.STRIPE_SECRET_KEY;
  originalWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  process.env.STRIPE_SECRET_KEY = "sk_test_yumkeeper";
  delete process.env.STRIPE_WEBHOOK_SECRET;
  dependencies = {
    retrieveSubscription: vi.fn().mockResolvedValue(subscriptionFixture()),
    upsertSubscription: vi.fn().mockResolvedValue(undefined),
    updateSubscriptionByCustomerId: vi.fn().mockResolvedValue(undefined),
  };
});

afterEach(async () => {
  if (originalStripeKey === undefined) delete process.env.STRIPE_SECRET_KEY;
  else process.env.STRIPE_SECRET_KEY = originalStripeKey;
  if (originalWebhookSecret === undefined) delete process.env.STRIPE_WEBHOOK_SECRET;
  else process.env.STRIPE_WEBHOOK_SECRET = originalWebhookSecret;

  if (!server) return;
  await new Promise<void>((resolve, reject) => {
    server?.close((error) => (error ? reject(error) : resolve()));
  });
  server = undefined;
});

describe("Stripe webhook integration", () => {
  it("accepts a checkout completion over HTTP and persists the activated subscription", async () => {
    const baseUrl = await startWebhookServer();
    const response = await fetch(`${baseUrl}/api/stripe/webhook`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(
        event("checkout.session.completed", {
          mode: "subscription",
          metadata: { userId: "42" },
          customer: "cus_123",
          subscription: "sub_123",
        }),
      ),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ received: true });
    expect(dependencies.retrieveSubscription).toHaveBeenCalledWith("sub_123");
    expect(dependencies.upsertSubscription).toHaveBeenCalledWith({
      userId: 42,
      stripeCustomerId: "cus_123",
      stripeSubscriptionId: "sub_123",
      stripePriceId: STRIPE_PRICES.freshMonthly,
      tier: "fresh",
      billingInterval: "month",
      status: "active",
      currentPeriodEnd: new Date(1_800_000_000 * 1000),
      cancelAtPeriodEnd: false,
    });
  });

  it("updates active subscriptions, downgrades inactive subscriptions, and handles cancellation", async () => {
    await handleStripeEvent(
      event("customer.subscription.updated", subscriptionFixture()),
      dependencies,
    );
    expect(dependencies.updateSubscriptionByCustomerId).toHaveBeenLastCalledWith(
      "cus_123",
      expect.objectContaining({ tier: "fresh", status: "active" }),
    );

    await handleStripeEvent(
      event("customer.subscription.updated", subscriptionFixture({ status: "past_due" })),
      dependencies,
    );
    expect(dependencies.updateSubscriptionByCustomerId).toHaveBeenLastCalledWith(
      "cus_123",
      expect.objectContaining({ tier: "free", status: "past_due" }),
    );

    await handleStripeEvent(
      event("customer.subscription.deleted", subscriptionFixture()),
      dependencies,
    );
    expect(dependencies.updateSubscriptionByCustomerId).toHaveBeenLastCalledWith("cus_123", {
      tier: "free",
      status: "canceled",
      cancelAtPeriodEnd: false,
    });
  });

  it("acknowledges non-subscription checkout and unhandled event types without persistence", async () => {
    await handleStripeEvent(
      event("checkout.session.completed", { mode: "payment", metadata: {} }),
      dependencies,
    );
    await handleStripeEvent(event("invoice.created", {}), dependencies);

    expect(dependencies.retrieveSubscription).not.toHaveBeenCalled();
    expect(dependencies.upsertSubscription).not.toHaveBeenCalled();
    expect(dependencies.updateSubscriptionByCustomerId).not.toHaveBeenCalled();
  });

  it("returns clear HTTP errors for missing configuration, malformed events, and handler failures", async () => {
    delete process.env.STRIPE_SECRET_KEY;
    let baseUrl = await startWebhookServer();
    let response = await fetch(`${baseUrl}/api/stripe/webhook`, { method: "POST", body: "{}" });
    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: "Stripe not configured" });
    await new Promise<void>((resolve) => server?.close(() => resolve()));
    server = undefined;

    process.env.STRIPE_SECRET_KEY = "sk_test_yumkeeper";
    baseUrl = await startWebhookServer();
    response = await fetch(`${baseUrl}/api/stripe/webhook`, { method: "POST", body: "not-json" });
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ error: expect.stringContaining("Webhook Error") });
    await new Promise<void>((resolve) => server?.close(() => resolve()));
    server = undefined;

    dependencies.updateSubscriptionByCustomerId.mockRejectedValueOnce(new Error("database unavailable"));
    baseUrl = await startWebhookServer();
    response = await fetch(`${baseUrl}/api/stripe/webhook`, {
      method: "POST",
      body: JSON.stringify(event("customer.subscription.deleted", subscriptionFixture())),
    });
    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: "Webhook handler failed" });
  });
});
