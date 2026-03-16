import { describe, it, expect } from 'vitest';
import {
  BARCODE_LOOKUP,
  MEAL_RECIPES,
  getMatchingRecipes,
  getFoodEmoji,
} from '../lib/food-data';

describe('BARCODE_LOOKUP', () => {
  it('should have entries with required fields', () => {
    const entries = Object.values(BARCODE_LOOKUP);
    expect(entries.length).toBeGreaterThan(0);
    entries.forEach(entry => {
      expect(entry).toHaveProperty('name');
      expect(entry).toHaveProperty('emoji');
      expect(entry).toHaveProperty('defaultDays');
      expect(entry).toHaveProperty('category');
      expect(entry.defaultDays).toBeGreaterThan(0);
    });
  });

  it('should have valid storage categories', () => {
    const validCategories = ['fridge', 'freezer', 'pantry', 'cellar'];
    Object.values(BARCODE_LOOKUP).forEach(entry => {
      expect(validCategories).toContain(entry.category);
    });
  });

  it('should look up a known barcode', () => {
    const result = BARCODE_LOOKUP['5000112637922'];
    expect(result).toBeDefined();
    expect(result.name).toBe('Coca-Cola');
    expect(result.category).toBe('pantry');
  });

  it('should return undefined for unknown barcode', () => {
    const result = BARCODE_LOOKUP['0000000000000'];
    expect(result).toBeUndefined();
  });
});

describe('MEAL_RECIPES', () => {
  it('should have at least 5 recipes', () => {
    expect(MEAL_RECIPES.length).toBeGreaterThanOrEqual(5);
  });

  it('each recipe should have required fields', () => {
    MEAL_RECIPES.forEach(recipe => {
      expect(recipe).toHaveProperty('id');
      expect(recipe).toHaveProperty('name');
      expect(recipe).toHaveProperty('emoji');
      expect(recipe).toHaveProperty('description');
      expect(recipe).toHaveProperty('prepTime');
      expect(recipe).toHaveProperty('difficulty');
      expect(recipe).toHaveProperty('servings');
      expect(recipe).toHaveProperty('keyIngredients');
      expect(recipe).toHaveProperty('allIngredients');
      expect(recipe).toHaveProperty('steps');
      expect(recipe).toHaveProperty('tips');
      expect(recipe).toHaveProperty('tags');
      expect(recipe.steps.length).toBeGreaterThan(0);
      expect(recipe.keyIngredients.length).toBeGreaterThan(0);
    });
  });

  it('difficulty should be Easy, Medium, or Hard', () => {
    const validDifficulties = ['Easy', 'Medium', 'Hard'];
    MEAL_RECIPES.forEach(recipe => {
      expect(validDifficulties).toContain(recipe.difficulty);
    });
  });

  it('servings should be a positive number', () => {
    MEAL_RECIPES.forEach(recipe => {
      expect(recipe.servings).toBeGreaterThan(0);
    });
  });
});

describe('getMatchingRecipes', () => {
  it('should return empty array for empty input', () => {
    const result = getMatchingRecipes([]);
    expect(result).toEqual([]);
  });

  it('should match chicken soup recipe when Chicken Breast is expiring', () => {
    const result = getMatchingRecipes(['Chicken Breast']);
    const names = result.map(r => r.id);
    expect(names).toContain('chicken-soup');
  });

  it('should match berry smoothie when Strawberries are expiring', () => {
    const result = getMatchingRecipes(['Strawberries']);
    const names = result.map(r => r.id);
    expect(names).toContain('berry-smoothie');
  });

  it('should match banana bread when Bananas are expiring', () => {
    const result = getMatchingRecipes(['Bananas']);
    const names = result.map(r => r.id);
    expect(names).toContain('banana-bread');
  });

  it('should match multiple recipes for multiple expiring items', () => {
    const result = getMatchingRecipes(['Chicken Breast', 'Strawberries', 'Bananas']);
    expect(result.length).toBeGreaterThanOrEqual(2);
  });

  it('should return empty array for items with no matching recipes', () => {
    const result = getMatchingRecipes(['Uranium', 'Plutonium']);
    expect(result).toEqual([]);
  });

  it('should be case-insensitive in matching', () => {
    const result1 = getMatchingRecipes(['chicken breast']);
    const result2 = getMatchingRecipes(['CHICKEN BREAST']);
    expect(result1.length).toBe(result2.length);
  });

  it('should handle partial name matches', () => {
    // 'Chicken' should match 'Chicken Breast' key ingredient
    const result = getMatchingRecipes(['Chicken']);
    const names = result.map(r => r.id);
    expect(names).toContain('chicken-soup');
  });
});

describe('getFoodEmoji', () => {
  it('should return emoji for known foods', () => {
    expect(getFoodEmoji('Apple')).toBe('🍎');
    expect(getFoodEmoji('Milk')).toBe('🥛');
    expect(getFoodEmoji('Chicken Breast')).toBe('🍗');
  });

  it('should return fallback emoji for unknown foods', () => {
    const result = getFoodEmoji('UnknownFood12345');
    expect(result).toBe('🥫');
  });
});
