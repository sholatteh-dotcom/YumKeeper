import { describe, it, expect } from 'vitest';
import {
  getExpiryStatus,
  getDaysRemaining,
  formatDaysRemaining,
  getFoodEmoji,
  FOOD_SUGGESTIONS,
  PRESERVATION_TIPS,
  STORAGE_LOCATIONS,
} from '../lib/food-data';

describe('getExpiryStatus', () => {
  it('returns expired for past dates', () => {
    const pastDate = new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0];
    expect(getExpiryStatus(pastDate)).toBe('expired');
  });

  it('returns expiring_soon for dates within 3 days', () => {
    const soonDate = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0];
    expect(getExpiryStatus(soonDate)).toBe('expiring_soon');
  });

  it('returns fresh for dates more than 3 days away', () => {
    const freshDate = new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0];
    expect(getExpiryStatus(freshDate)).toBe('fresh');
  });

  it('returns expiring_soon for today', () => {
    const today = new Date().toISOString().split('T')[0];
    expect(getExpiryStatus(today)).toBe('expiring_soon');
  });

  it('returns expiring_soon for exactly 3 days', () => {
    const threeDays = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];
    expect(getExpiryStatus(threeDays)).toBe('expiring_soon');
  });
});

describe('getDaysRemaining', () => {
  it('returns negative for expired items', () => {
    const pastDate = new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0];
    expect(getDaysRemaining(pastDate)).toBeLessThan(0);
  });

  it('returns 0 for today', () => {
    const today = new Date().toISOString().split('T')[0];
    expect(getDaysRemaining(today)).toBe(0);
  });

  it('returns positive for future dates', () => {
    const future = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
    expect(getDaysRemaining(future)).toBeGreaterThan(0);
  });
});

describe('formatDaysRemaining', () => {
  it('formats expired items correctly', () => {
    expect(formatDaysRemaining(-3)).toBe('Expired 3d ago');
  });

  it('formats today correctly', () => {
    expect(formatDaysRemaining(0)).toBe('Expires today');
  });

  it('formats tomorrow correctly', () => {
    expect(formatDaysRemaining(1)).toBe('Expires tomorrow');
  });

  it('formats multiple days correctly', () => {
    expect(formatDaysRemaining(5)).toBe('5 days left');
  });
});

describe('getFoodEmoji', () => {
  it('returns correct emoji for known foods', () => {
    expect(getFoodEmoji('Apples')).toBe('🍎');
    expect(getFoodEmoji('Bananas')).toBe('🍌');
    expect(getFoodEmoji('Milk')).toBe('🥛');
    expect(getFoodEmoji('Eggs')).toBe('🥚');
  });

  it('returns default emoji for unknown foods', () => {
    expect(getFoodEmoji('Unknown Food XYZ')).toBe('🥫');
  });

  it('is case insensitive for known foods', () => {
    expect(getFoodEmoji('apples')).toBe('🍎');
    expect(getFoodEmoji('MILK')).toBe('🥛');
  });
});

describe('FOOD_SUGGESTIONS', () => {
  it('has required fields for each suggestion', () => {
    FOOD_SUGGESTIONS.forEach(s => {
      expect(s.name).toBeTruthy();
      expect(s.emoji).toBeTruthy();
      expect(s.defaultDays).toBeGreaterThan(0);
      expect(['fridge', 'freezer', 'pantry', 'cellar']).toContain(s.category);
    });
  });

  it('has at least 20 food suggestions', () => {
    expect(FOOD_SUGGESTIONS.length).toBeGreaterThanOrEqual(20);
  });
});

describe('PRESERVATION_TIPS', () => {
  it('has required fields for each tip', () => {
    PRESERVATION_TIPS.forEach(tip => {
      expect(tip.id).toBeTruthy();
      expect(tip.title).toBeTruthy();
      expect(tip.description).toBeTruthy();
      expect(tip.steps.length).toBeGreaterThan(0);
      expect(tip.equipment.length).toBeGreaterThan(0);
      expect(tip.proTips.length).toBeGreaterThan(0);
      expect(tip.bestFoods.length).toBeGreaterThan(0);
      expect(['Easy', 'Medium', 'Hard']).toContain(tip.difficulty);
    });
  });

  it('has at least 5 preservation tips', () => {
    expect(PRESERVATION_TIPS.length).toBeGreaterThanOrEqual(5);
  });

  it('covers multiple categories', () => {
    const categories = new Set(PRESERVATION_TIPS.map(t => t.category));
    expect(categories.size).toBeGreaterThanOrEqual(4);
  });
});

describe('STORAGE_LOCATIONS', () => {
  it('has all four storage locations', () => {
    const keys = STORAGE_LOCATIONS.map(l => l.key);
    expect(keys).toContain('fridge');
    expect(keys).toContain('freezer');
    expect(keys).toContain('pantry');
    expect(keys).toContain('cellar');
  });

  it('each location has required fields', () => {
    STORAGE_LOCATIONS.forEach(loc => {
      expect(loc.key).toBeTruthy();
      expect(loc.label).toBeTruthy();
      expect(loc.emoji).toBeTruthy();
      expect(loc.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });
});
