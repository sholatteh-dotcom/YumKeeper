import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@yumkeeper:onboarding_complete";
const CONSENT_KEY = "@yumkeeper:legal_consent";

/**
 * Current policy version — must match CURRENT_POLICY_VERSION in server/legal-router.ts.
 * Bump this string whenever the ToS or Privacy Policy is materially updated.
 */
export const CURRENT_POLICY_VERSION = "1.0";

/**
 * Returns true if the user has NOT yet completed onboarding
 * (i.e. this is their first launch).
 */
export async function shouldShowOnboarding(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEY);
    return value !== "true";
  } catch {
    return false;
  }
}

/**
 * Marks onboarding as complete so it is never shown again.
 */
export async function markOnboardingComplete(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, "true");
  } catch {
    // Silently fail
  }
}

/**
 * Records the user's explicit consent to the Terms of Service and Privacy Policy.
 * Stores an ISO timestamp for audit purposes.
 */
export async function recordLegalConsent(): Promise<void> {
  try {
    const record = JSON.stringify({
      consentedAt: new Date().toISOString(),
      version: "1.0",
      documents: ["terms-of-service", "privacy-policy"],
    });
    await AsyncStorage.setItem(CONSENT_KEY, record);
  } catch {
    // Silently fail
  }
}

/**
 * Returns the stored consent record, or null if not yet consented.
 */
export async function getLegalConsent(): Promise<{ consentedAt: string; version: string; documents: string[] } | null> {
  try {
    const raw = await AsyncStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Returns true if the user has consented to a previous version of the policy
 * but not the current one, meaning they need to re-consent.
 * Returns false if they have never consented (onboarding handles that case)
 * or if they are already on the current version.
 */
export async function needsReConsent(): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(CONSENT_KEY);
    if (!raw) return false; // Never consented — onboarding handles first-time case
    const record = JSON.parse(raw) as { version?: string };
    return record.version !== CURRENT_POLICY_VERSION;
  } catch {
    return false;
  }
}

/**
 * Resets onboarding state (for testing only).
 */
export async function resetOnboarding(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    await AsyncStorage.removeItem(CONSENT_KEY);
  } catch {}
}
