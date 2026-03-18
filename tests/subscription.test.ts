import { describe, it, expect } from 'vitest';

// ─── Replicate the subscription gating logic from subscription-context ───────
const FREE_ITEM_LIMIT = 10;
const FREE_TIPS_LIMIT = 3;

type SubscriptionTier = 'free' | 'fresh' | 'family';

function buildPermissions(tier: SubscriptionTier) {
  const isPaid = tier === 'fresh' || tier === 'family';
  const isFamily = tier === 'family';
  return {
    tier,
    canAddItems: (currentCount: number) => isPaid || currentCount < FREE_ITEM_LIMIT,
    canUseBarcodeScanner: isPaid,
    canUseShoppingList: isPaid,
    canSeeAllTips: isPaid,
    canUseNotifications: isPaid,
    canShareWithFamily: isFamily,
    maxFamilyMembers: isFamily ? 6 : 1,
    itemLimit: isPaid ? Infinity : FREE_ITEM_LIMIT,
    tipsLimit: isPaid ? Infinity : FREE_TIPS_LIMIT,
  };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('Subscription Tier: Free', () => {
  const perms = buildPermissions('free');

  it('allows adding items when under the limit', () => {
    expect(perms.canAddItems(0)).toBe(true);
    expect(perms.canAddItems(9)).toBe(true);
  });

  it('blocks adding items at the limit', () => {
    expect(perms.canAddItems(10)).toBe(false);
    expect(perms.canAddItems(15)).toBe(false);
  });

  it('blocks barcode scanner', () => {
    expect(perms.canUseBarcodeScanner).toBe(false);
  });

  it('blocks shopping list', () => {
    expect(perms.canUseShoppingList).toBe(false);
  });

  it('blocks all tips beyond the free limit', () => {
    expect(perms.canSeeAllTips).toBe(false);
    expect(perms.tipsLimit).toBe(FREE_TIPS_LIMIT);
  });

  it('blocks notifications', () => {
    expect(perms.canUseNotifications).toBe(false);
  });

  it('blocks family sharing', () => {
    expect(perms.canShareWithFamily).toBe(false);
    expect(perms.maxFamilyMembers).toBe(1);
  });

  it('enforces item limit of 10', () => {
    expect(perms.itemLimit).toBe(FREE_ITEM_LIMIT);
  });
});

describe('Subscription Tier: Fresh', () => {
  const perms = buildPermissions('fresh');

  it('allows unlimited items', () => {
    expect(perms.canAddItems(0)).toBe(true);
    expect(perms.canAddItems(100)).toBe(true);
    expect(perms.canAddItems(10000)).toBe(true);
    expect(perms.itemLimit).toBe(Infinity);
  });

  it('unlocks barcode scanner', () => {
    expect(perms.canUseBarcodeScanner).toBe(true);
  });

  it('unlocks shopping list', () => {
    expect(perms.canUseShoppingList).toBe(true);
  });

  it('unlocks all tips', () => {
    expect(perms.canSeeAllTips).toBe(true);
    expect(perms.tipsLimit).toBe(Infinity);
  });

  it('unlocks notifications', () => {
    expect(perms.canUseNotifications).toBe(true);
  });

  it('does not include family sharing', () => {
    expect(perms.canShareWithFamily).toBe(false);
    expect(perms.maxFamilyMembers).toBe(1);
  });
});

describe('Subscription Tier: Family', () => {
  const perms = buildPermissions('family');

  it('allows unlimited items', () => {
    expect(perms.canAddItems(999)).toBe(true);
    expect(perms.itemLimit).toBe(Infinity);
  });

  it('unlocks all premium features', () => {
    expect(perms.canUseBarcodeScanner).toBe(true);
    expect(perms.canUseShoppingList).toBe(true);
    expect(perms.canSeeAllTips).toBe(true);
    expect(perms.canUseNotifications).toBe(true);
  });

  it('unlocks family sharing with 6 members', () => {
    expect(perms.canShareWithFamily).toBe(true);
    expect(perms.maxFamilyMembers).toBe(6);
  });
});

describe('Pricing constants', () => {
  it('free item limit is 10', () => {
    expect(FREE_ITEM_LIMIT).toBe(10);
  });

  it('free tips limit is 3', () => {
    expect(FREE_TIPS_LIMIT).toBe(3);
  });

  it('tier boundary: exactly at limit is blocked for free', () => {
    const perms = buildPermissions('free');
    expect(perms.canAddItems(FREE_ITEM_LIMIT - 1)).toBe(true);
    expect(perms.canAddItems(FREE_ITEM_LIMIT)).toBe(false);
  });
});
