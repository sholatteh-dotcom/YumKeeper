import { z } from "zod/v4";
import { protectedProcedure, router } from "./_core/trpc";
import { upsertConsentRecord, getLatestConsentRecord } from "./db";

/**
 * Current policy version — bump this string whenever the ToS or Privacy Policy
 * is materially updated. The app compares this against the stored consent version
 * and prompts the user to re-consent if they differ.
 */
export const CURRENT_POLICY_VERSION = "1.0";

export const legalRouter = router({
  /**
   * Record that the authenticated user has consented to the current policy version.
   * Called from the app after the user ticks the onboarding checkbox or re-consent modal.
   */
  recordConsent: protectedProcedure
    .input(
      z.object({
        consentedAt: z.string(), // ISO 8601 timestamp from AsyncStorage
        documents: z.string().optional(), // e.g. "terms-of-service,privacy-policy"
        platform: z.string().optional(), // 'ios' | 'android' | 'web'
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await upsertConsentRecord({
        userId: ctx.user.id,
        policyVersion: CURRENT_POLICY_VERSION,
        consentedAt: new Date(input.consentedAt),
        documents: input.documents ?? "terms-of-service,privacy-policy",
        platform: input.platform ?? null,
      });
      return { success: true, policyVersion: CURRENT_POLICY_VERSION } as const;
    }),

  /**
   * Returns the current policy version and whether the authenticated user has
   * already consented to it. The app uses this on launch to decide whether to
   * show the re-consent modal.
   */
  consentStatus: protectedProcedure.query(async ({ ctx }) => {
    const record = await getLatestConsentRecord(ctx.user.id);
    return {
      currentVersion: CURRENT_POLICY_VERSION,
      hasConsented: record?.policyVersion === CURRENT_POLICY_VERSION,
      lastConsentedVersion: record?.policyVersion ?? null,
      lastConsentedAt: record?.consentedAt ?? null,
    };
  }),
});
