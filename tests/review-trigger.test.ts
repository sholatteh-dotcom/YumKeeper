import { describe, it, expect, beforeEach, vi } from 'vitest';

// Use vi.hoisted so these refs are available inside vi.mock factories
const { mockRequestReview, mockIsAvailable } = vi.hoisted(() => ({
  mockRequestReview: vi.fn().mockResolvedValue(undefined),
  mockIsAvailable: vi.fn().mockResolvedValue(true),
}));

// Mock AsyncStorage
const store: Record<string, string> = {};
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: async (key: string) => store[key] ?? null,
    setItem: async (key: string, value: string) => { store[key] = value; },
    multiRemove: async (keys: string[]) => { keys.forEach(k => delete store[k]); },
  },
}));

// Mock expo-store-review
vi.mock('expo-store-review', () => ({
  requestReview: mockRequestReview,
  isAvailableAsync: mockIsAvailable,
}));

// Mock Platform to simulate iOS
vi.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { maybeRequestReview, getReviewItemCount, resetReviewState } from '../lib/review-trigger';

describe('review-trigger', () => {
  beforeEach(async () => {
    // Clear store and mocks before each test
    Object.keys(store).forEach(k => delete store[k]);
    mockRequestReview.mockClear();
    mockIsAvailable.mockClear();
    mockIsAvailable.mockResolvedValue(true);
  });

  it('does not request review before reaching the 5-item milestone', async () => {
    await maybeRequestReview(); // 1
    await maybeRequestReview(); // 2
    await maybeRequestReview(); // 3
    await maybeRequestReview(); // 4
    expect(mockRequestReview).not.toHaveBeenCalled();
  });

  it('requests review exactly when the 5-item milestone is reached', async () => {
    for (let i = 0; i < 5; i++) await maybeRequestReview();
    expect(mockRequestReview).toHaveBeenCalledTimes(1);
  });

  it('does not request review more than once even after many items', async () => {
    for (let i = 0; i < 10; i++) await maybeRequestReview();
    expect(mockRequestReview).toHaveBeenCalledTimes(1);
  });

  it('tracks item count correctly', async () => {
    await maybeRequestReview();
    await maybeRequestReview();
    await maybeRequestReview();
    const count = await getReviewItemCount();
    expect(count).toBe(3);
  });

  it('resets state correctly', async () => {
    for (let i = 0; i < 5; i++) await maybeRequestReview();
    await resetReviewState();
    const count = await getReviewItemCount();
    expect(count).toBe(0);
    // After reset, review can fire again
    for (let i = 0; i < 5; i++) await maybeRequestReview();
    expect(mockRequestReview).toHaveBeenCalledTimes(2);
  });

  it('does not request review when StoreReview is not available', async () => {
    mockIsAvailable.mockResolvedValueOnce(false);
    for (let i = 0; i < 5; i++) await maybeRequestReview();
    expect(mockRequestReview).not.toHaveBeenCalled();
  });
});
