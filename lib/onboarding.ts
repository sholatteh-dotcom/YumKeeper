import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@yumkeeper:onboarding_complete";

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
 * Resets onboarding state (for testing only).
 */
export async function resetOnboarding(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {}
}
