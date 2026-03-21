import { z } from "zod/v4";
import { protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { upsertConsentRecord, getLatestConsentRecord, getConsentStatusSummary, createDeletionRequest, getDeletionRequest } from "./db";

/**
 * Current policy version — bump this string whenever the ToS or Privacy Policy
 * is materially updated. The app compares this against the stored consent version
 * and prompts the user to re-consent if they differ.
 */
export const CURRENT_POLICY_VERSION = "1.1";

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
   * Submits a GDPR Article 17 erasure request for the authenticated user.
   * The request is logged to the database and processed within 30 days.
   */
  requestDeletion: protectedProcedure
    .input(z.object({ platform: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const requestId = await createDeletionRequest(ctx.user.id, input.platform);
      return {
        success: true,
        requestId,
        message: "Your data deletion request has been received. We will process it within 30 days and send a confirmation to your email address.",
      } as const;
    }),

  /**
   * Returns the current deletion request status for the authenticated user.
   * Used to show the user whether their request is pending, processing, or completed.
   */
  deletionStatus: protectedProcedure.query(async ({ ctx }) => {
    const request = await getDeletionRequest(ctx.user.id);
    return {
      hasRequest: request !== null,
      status: request?.status ?? null,
      requestedAt: request?.requestedAt ?? null,
      completedAt: request?.completedAt ?? null,
    };
  }),

  /**
   * Admin-only: returns a summary of consent status across all users for the
   * current policy version. Used in the admin panel to identify users who
   * have not yet consented and may need a reminder push notification.
   */
  adminConsentStatus: adminProcedure.query(async () => {
    const summary = await getConsentStatusSummary(CURRENT_POLICY_VERSION);
    return {
      currentVersion: CURRENT_POLICY_VERSION,
      ...summary,
    };
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
