import type { Express, Request, Response } from "express";
import Stripe from "stripe";
import * as db from "./db";
import { tierFromPriceId } from "./stripe-router";

export type StripeWebhookDependencies = {
  retrieveSubscription: (subscriptionId: string) => Promise<Stripe.Subscription>;
  upsertSubscription: typeof db.upsertSubscription;
  updateSubscriptionByCustomerId: typeof db.updateSubscriptionByCustomerId;
};

const productionDependencies: StripeWebhookDependencies = {
  retrieveSubscription: async (subscriptionId) => {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not configured");

    const stripe = new Stripe(stripeKey, { apiVersion: "2026-02-25.clover" as any });
    return stripe.subscriptions.retrieve(subscriptionId);
  },
  upsertSubscription: db.upsertSubscription,
  updateSubscriptionByCustomerId: db.updateSubscriptionByCustomerId,
};

/**
 * Registers the raw Stripe webhook endpoint on the Express app.
 * Must be registered BEFORE express.json() middleware so the raw body is available.
 */
export function registerStripeWebhook(
  app: Express,
  dependencies: StripeWebhookDependencies = productionDependencies,
) {
  // Raw body parser for Stripe webhook verification
  app.post(
    "/api/stripe/webhook",
    // Use express.raw for this route
    (req: Request, res: Response, next) => {
      // If body is already a Buffer (raw), proceed; otherwise collect raw body
      if (Buffer.isBuffer(req.body)) return next();
      const chunks: Buffer[] = [];
      req.on("data", (chunk: Buffer) => chunks.push(chunk));
      req.on("end", () => {
        (req as any).rawBody = Buffer.concat(chunks);
        next();
      });
    },
    async (req: Request, res: Response) => {
      const stripeKey = process.env.STRIPE_SECRET_KEY;
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!stripeKey) {
        res.status(500).json({ error: "Stripe not configured" });
        return;
      }

      const stripe = new Stripe(stripeKey, { apiVersion: "2026-02-25.clover" as any });
      const rawBody = (req as any).rawBody ?? req.body;
      const sig = req.headers["stripe-signature"] as string;

      let event: Stripe.Event;

      try {
        if (webhookSecret && sig) {
          event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
        } else {
          // Dev mode: parse without verification
          const body = typeof rawBody === "string" ? rawBody : rawBody.toString("utf8");
          event = JSON.parse(body) as Stripe.Event;
        }
      } catch (err: any) {
        console.error("[Stripe Webhook] Signature verification failed:", err.message);
        res.status(400).json({ error: `Webhook Error: ${err.message}` });
        return;
      }

      try {
        await handleStripeEvent(event, dependencies);
        res.json({ received: true });
      } catch (err: any) {
        console.error("[Stripe Webhook] Handler error:", err);
        res.status(500).json({ error: "Webhook handler failed" });
      }
    }
  );
}

export async function handleStripeEvent(
  event: Stripe.Event,
  dependencies: StripeWebhookDependencies = productionDependencies,
) {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode !== "subscription") break;

      const userId = Number(session.metadata?.userId);
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;

      if (!userId || !customerId || !subscriptionId) break;

      // Retrieve full subscription to get price details
      const subscription = await dependencies.retrieveSubscription(subscriptionId);
      const priceId = subscription.items.data[0]?.price.id ?? "";
      const interval = (subscription.items.data[0]?.price.recurring?.interval ?? "month") as "month" | "year";
      const tier = tierFromPriceId(priceId);

      await dependencies.upsertSubscription({
        userId,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        stripePriceId: priceId,
        tier,
        billingInterval: interval,
        status: subscription.status,
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      });

      console.log(`[Stripe] Subscription activated for user ${userId}: ${tier} (${interval})`);
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      const priceId = subscription.items.data[0]?.price.id ?? "";
      const interval = (subscription.items.data[0]?.price.recurring?.interval ?? "month") as "month" | "year";
      const tier = tierFromPriceId(priceId);
      const isActive = subscription.status === "active" || subscription.status === "trialing";

      await dependencies.updateSubscriptionByCustomerId(customerId, {
        stripeSubscriptionId: subscription.id,
        stripePriceId: priceId,
        tier: isActive ? tier : "free",
        billingInterval: interval,
        status: subscription.status,
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      });

      console.log(`[Stripe] Subscription updated for customer ${customerId}: ${tier} (${subscription.status})`);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      await dependencies.updateSubscriptionByCustomerId(customerId, {
        tier: "free",
        status: "canceled",
        cancelAtPeriodEnd: false,
      });

      console.log(`[Stripe] Subscription canceled for customer ${customerId}`);
      break;
    }

    default:
      console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
  }
}
