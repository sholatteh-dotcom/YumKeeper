import AsyncStorage from "@react-native-async-storage/async-storage";
import * as StoreReview from "expo-store-review";
import { Platform } from "react-native";

const STORAGE_KEY_ITEM_COUNT = "@yumkeeper:review_item_count";
const STORAGE_KEY_REVIEW_DONE = "@yumkeeper:review_requested";
const REVIEW_MILESTONE = 5;

/**
 * Called every time the user successfully adds a food item.
 * Tracks the cumulative count in AsyncStorage and triggers the
 * native in-app review dialog exactly once when the user hits
 * the 5-item milestone on iOS or Android.
 */
export async function maybeRequestReview(): Promise<void> {
  // Skip on web — StoreReview is not available
  if (Platform.OS === "web") return;

  try {
    // Don't ask twice
    const alreadyRequested = await AsyncStorage.getItem(STORAGE_KEY_REVIEW_DONE);
    if (alreadyRequested === "true") return;

    // Increment the tracked item count
    const raw = await AsyncStorage.getItem(STORAGE_KEY_ITEM_COUNT);
    const count = parseInt(raw ?? "0", 10) + 1;
    await AsyncStorage.setItem(STORAGE_KEY_ITEM_COUNT, String(count));

    // Trigger review at the milestone
    if (count >= REVIEW_MILESTONE) {
      const isAvailable = await StoreReview.isAvailableAsync();
      if (isAvailable) {
        await StoreReview.requestReview();
        // Mark as done so we never prompt again
        await AsyncStorage.setItem(STORAGE_KEY_REVIEW_DONE, "true");
      }
    }
  } catch {
    // Silently fail — review prompts are best-effort
  }
}

/**
 * Returns the current tracked item count (for testing/debugging).
 */
export async function getReviewItemCount(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_ITEM_COUNT);
    return parseInt(raw ?? "0", 10);
  } catch {
    return 0;
  }
}

/**
 * Resets the review state (for testing only).
 */
export async function resetReviewState(): Promise<void> {
  await AsyncStorage.multiRemove([STORAGE_KEY_ITEM_COUNT, STORAGE_KEY_REVIEW_DONE]);
}
