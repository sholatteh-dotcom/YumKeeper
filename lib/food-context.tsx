import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FoodItem, StorageLocation, getExpiryStatus } from './food-data';

const STORAGE_KEY = '@freshkeep_inventory';

interface FoodState {
  items: FoodItem[];
  isLoaded: boolean;
}

type FoodAction =
  | { type: 'LOAD'; items: FoodItem[] }
  | { type: 'ADD'; item: FoodItem }
  | { type: 'UPDATE'; item: FoodItem }
  | { type: 'DELETE'; id: string };

function foodReducer(state: FoodState, action: FoodAction): FoodState {
  switch (action.type) {
    case 'LOAD':
      return { ...state, items: action.items, isLoaded: true };
    case 'ADD':
      return { ...state, items: [action.item, ...state.items] };
    case 'UPDATE':
      return { ...state, items: state.items.map(i => i.id === action.item.id ? action.item : i) };
    case 'DELETE':
      return { ...state, items: state.items.filter(i => i.id !== action.id) };
    default:
      return state;
  }
}

interface FoodContextValue {
  items: FoodItem[];
  isLoaded: boolean;
  addItem: (item: FoodItem) => Promise<void>;
  updateItem: (item: FoodItem) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  getItemsByLocation: (location: StorageLocation) => FoodItem[];
  getExpiringSoon: () => FoodItem[];
  getExpired: () => FoodItem[];
  getFresh: () => FoodItem[];
  stats: { total: number; expiringSoon: number; expired: number; fresh: number };
}

const FoodContext = createContext<FoodContextValue | null>(null);

export function FoodProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(foodReducer, { items: [], isLoaded: false });

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(data => {
      if (data) {
        try {
          const items: FoodItem[] = JSON.parse(data);
          dispatch({ type: 'LOAD', items });
        } catch {
          dispatch({ type: 'LOAD', items: [] });
        }
      } else {
        // Seed with sample data on first launch
        const sampleItems: FoodItem[] = [
          {
            id: '1',
            name: 'Apples',
            category: 'fridge',
            quantity: 6,
            unit: 'pcs',
            purchaseDate: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
            expiryDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
            emoji: '🍎',
            notes: 'Gala variety',
            createdAt: new Date().toISOString(),
          },
          {
            id: '2',
            name: 'Chicken Breast',
            category: 'fridge',
            quantity: 500,
            unit: 'g',
            purchaseDate: new Date().toISOString().split('T')[0],
            expiryDate: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0],
            emoji: '🍗',
            createdAt: new Date().toISOString(),
          },
          {
            id: '3',
            name: 'Frozen Peas',
            category: 'freezer',
            quantity: 1,
            unit: 'bags',
            purchaseDate: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
            expiryDate: new Date(Date.now() + 150 * 86400000).toISOString().split('T')[0],
            emoji: '🟢',
            createdAt: new Date().toISOString(),
          },
          {
            id: '4',
            name: 'Olive Oil',
            category: 'pantry',
            quantity: 500,
            unit: 'mL',
            purchaseDate: new Date(Date.now() - 60 * 86400000).toISOString().split('T')[0],
            expiryDate: new Date(Date.now() + 300 * 86400000).toISOString().split('T')[0],
            emoji: '🫒',
            createdAt: new Date().toISOString(),
          },
          {
            id: '5',
            name: 'Milk',
            category: 'fridge',
            quantity: 1,
            unit: 'L',
            purchaseDate: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
            expiryDate: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
            emoji: '🥛',
            createdAt: new Date().toISOString(),
          },
          {
            id: '6',
            name: 'Carrots',
            category: 'fridge',
            quantity: 500,
            unit: 'g',
            purchaseDate: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
            expiryDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
            emoji: '🥕',
            createdAt: new Date().toISOString(),
          },
          {
            id: '7',
            name: 'Rice',
            category: 'pantry',
            quantity: 2,
            unit: 'kg',
            purchaseDate: new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0],
            expiryDate: new Date(Date.now() + 275 * 86400000).toISOString().split('T')[0],
            emoji: '🍚',
            createdAt: new Date().toISOString(),
          },
          {
            id: '8',
            name: 'Strawberries',
            category: 'fridge',
            quantity: 250,
            unit: 'g',
            purchaseDate: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
            expiryDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
            emoji: '🍓',
            createdAt: new Date().toISOString(),
          },
        ];
        dispatch({ type: 'LOAD', items: sampleItems });
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sampleItems));
      }
    });
  }, []);

  const persist = useCallback(async (items: FoodItem[]) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, []);

  const addItem = useCallback(async (item: FoodItem) => {
    dispatch({ type: 'ADD', item });
    const newItems = [item, ...state.items];
    await persist(newItems);
  }, [state.items, persist]);

  const updateItem = useCallback(async (item: FoodItem) => {
    dispatch({ type: 'UPDATE', item });
    const newItems = state.items.map(i => i.id === item.id ? item : i);
    await persist(newItems);
  }, [state.items, persist]);

  const deleteItem = useCallback(async (id: string) => {
    dispatch({ type: 'DELETE', id });
    const newItems = state.items.filter(i => i.id !== id);
    await persist(newItems);
  }, [state.items, persist]);

  const getItemsByLocation = useCallback((location: StorageLocation) =>
    state.items.filter(i => i.category === location), [state.items]);

  const getExpiringSoon = useCallback(() =>
    state.items.filter(i => getExpiryStatus(i.expiryDate) === 'expiring_soon'), [state.items]);

  const getExpired = useCallback(() =>
    state.items.filter(i => getExpiryStatus(i.expiryDate) === 'expired'), [state.items]);

  const getFresh = useCallback(() =>
    state.items.filter(i => getExpiryStatus(i.expiryDate) === 'fresh'), [state.items]);

  const stats = {
    total: state.items.length,
    expiringSoon: state.items.filter(i => getExpiryStatus(i.expiryDate) === 'expiring_soon').length,
    expired: state.items.filter(i => getExpiryStatus(i.expiryDate) === 'expired').length,
    fresh: state.items.filter(i => getExpiryStatus(i.expiryDate) === 'fresh').length,
  };

  return (
    <FoodContext.Provider value={{
      items: state.items,
      isLoaded: state.isLoaded,
      addItem,
      updateItem,
      deleteItem,
      getItemsByLocation,
      getExpiringSoon,
      getExpired,
      getFresh,
      stats,
    }}>
      {children}
    </FoodContext.Provider>
  );
}

export function useFoodContext() {
  const ctx = useContext(FoodContext);
  if (!ctx) throw new Error('useFoodContext must be used within FoodProvider');
  return ctx;
}
