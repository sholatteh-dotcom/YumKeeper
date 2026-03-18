import Stripe from "stripe";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { STRIPE_PRICES } from "../lib/stripe-prices";
export { STRIPE_PRICES };

// Tier derived from price ID
export function tierFromPriceId(priceId: string): "fresh" | "family" | "free" {
  if (priceId === STRIPE_PRICES.freshMonthly || priceId === STRIPE_PRICES.freshAnnual) return "fresh";
  if (priceId === STRIPE_PRICES.familyMonthly || priceId === STRIPE_PRICES.familyAnnual) return "family";
  return "free";
}

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
  return new Stripe(key, { apiVersion: "2026-02-25.clover" as any });
}

export const stripeRouter = router({
  // Get current subscription status for the logged-in user
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const sub = await db.getSubscriptionByUserId(ctx.user.id);
    if (!sub || sub.status !== "active") {
      return { tier: "free" as const, status: "inactive", currentPeriodEnd: null, cancelAtPeriodEnd: false };
    }
    return {
      tier: sub.tier,
      status: sub.status,
      billingInterval: sub.billingInterval,
      currentPeriodEnd: sub.currentPeriodEnd?.toISOString() ?? null,
      cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
      stripeCustomerId: sub.stripeCustomerId,
    };
  }),

  // Create a Stripe Checkout session
  createCheckoutSession: protectedProcedure
    .input(z.object({
      priceId: z.enum([
        STRIPE_PRICES.freshMonthly,
        STRIPE_PRICES.freshAnnual,
        STRIPE_PRICES.familyMonthly,
        STRIPE_PRICES.familyAnnual,
      ]),
      successUrl: z.string().url(),
      cancelUrl: z.string().url(),
    }))
    .mutation(async ({ ctx, input }) => {
      const stripe = getStripe();
      const user = ctx.user;

      // Find or create Stripe customer
      let customerId: string | undefined;
      const existing = await db.getSubscriptionByUserId(user.id);
      if (existing?.stripeCustomerId) {
        customerId = existing.stripeCustomerId;
      } else {
        const customer = await stripe.customers.create({
          email: user.email ?? undefined,
          name: user.name ?? undefined,
          metadata: { userId: String(user.id), openId: user.openId },
        });
        customerId = customer.id;
      }

      // Check if user has already used a trial (only offer once)
      const hasUsedTrial = existing?.status === 'trialing' ||
        (existing?.stripeSubscriptionId != null && existing?.status !== 'inactive');

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ["card"],
        line_items: [{ price: input.priceId, quantity: 1 }],
        mode: "subscription",
        success_url: input.successUrl,
        cancel_url: input.cancelUrl,
        metadata: { userId: String(user.id) },
        subscription_data: {
          metadata: { userId: String(user.id), tier: tierFromPriceId(input.priceId) },
          // Offer 7-day free trial for first-time subscribers only
          ...(hasUsedTrial ? {} : { trial_period_days: 7 }),
        },
      });

      return { sessionId: session.id, url: session.url };
    }),

  // Create a Stripe Customer Portal session for managing/canceling
  createPortalSession: protectedProcedure
    .input(z.object({ returnUrl: z.string().url() }))
    .mutation(async ({ ctx, input }) => {
      const stripe = getStripe();
      const sub = await db.getSubscriptionByUserId(ctx.user.id);
      if (!sub?.stripeCustomerId) throw new Error("No active subscription found");

      const session = await stripe.billingPortal.sessions.create({
        customer: sub.stripeCustomerId,
        return_url: input.returnUrl,
      });

      return { url: session.url };
    }),

  // Webhook handler — called by Stripe via raw Express route (see stripe-webhook.ts)
  // This tRPC route is for internal use to process webhook events
  processWebhookEvent: publicProcedure
    .input(z.object({
      type: z.string(),
      customerId: z.string(),
      subscriptionId: z.string().optional(),
      priceId: z.string().optional(),
      status: z.string().optional(),
      currentPeriodEnd: z.number().optional(),
      cancelAtPeriodEnd: z.boolean().optional(),
      billingInterval: z.enum(["month", "year"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const sub = await db.getSubscriptionByStripeCustomerId(input.customerId);
      if (!sub) return { ok: false, reason: "subscription not found" };

      const tier = input.priceId ? tierFromPriceId(input.priceId) : "free";
      const isActive = input.status === "active" || input.status === "trialing";

      await db.updateSubscriptionByCustomerId(input.customerId, {
        stripeSubscriptionId: input.subscriptionId,
        stripePriceId: input.priceId,
        tier: isActive ? tier : "free",
        status: input.status ?? "inactive",
        billingInterval: input.billingInterval,
        currentPeriodEnd: input.currentPeriodEnd ? new Date(input.currentPeriodEnd * 1000) : undefined,
        cancelAtPeriodEnd: input.cancelAtPeriodEnd ?? false,
      });

      return { ok: true };
    }),

  // Upsert subscription record after checkout.session.completed
  activateSubscription: publicProcedure
    .input(z.object({
      userId: z.number(),
      customerId: z.string(),
      subscriptionId: z.string(),
      priceId: z.string(),
      status: z.string(),
      currentPeriodEnd: z.number(),
      billingInterval: z.enum(["month", "year"]),
    }))
    .mutation(async ({ input }) => {
      const tier = tierFromPriceId(input.priceId);
      await db.upsertSubscription({
        userId: input.userId,
        stripeCustomerId: input.customerId,
        stripeSubscriptionId: input.subscriptionId,
        stripePriceId: input.priceId,
        tier,
        billingInterval: input.billingInterval,
        status: input.status,
        currentPeriodEnd: new Date(input.currentPeriodEnd * 1000),
        cancelAtPeriodEnd: false,
      });
      return { ok: true, tier };
    }),
});
