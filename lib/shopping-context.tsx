import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageLocation } from './food-data';

const STORAGE_KEY = '@freshkeep_shopping_list';

export interface ShoppingItem {
  id: string;
  name: string;
  emoji: string;
  category: StorageLocation;
  quantity: number;
  unit: string;
  checked: boolean;
  addedAt: string;
  source: 'manual' | 'auto'; // 'auto' = added when item was deleted from inventory
}

interface ShoppingState {
  items: ShoppingItem[];
  isLoaded: boolean;
}

type ShoppingAction =
  | { type: 'LOAD'; items: ShoppingItem[] }
  | { type: 'ADD'; item: ShoppingItem }
  | { type: 'TOGGLE'; id: string }
  | { type: 'DELETE'; id: string }
  | { type: 'CLEAR_CHECKED' }
  | { type: 'CLEAR_ALL' };

function shoppingReducer(state: ShoppingState, action: ShoppingAction): ShoppingState {
  switch (action.type) {
    case 'LOAD':
      return { ...state, items: action.items, isLoaded: true };
    case 'ADD': {
      // Avoid duplicates by name
      const exists = state.items.some(
        i => i.name.toLowerCase() === action.item.name.toLowerCase() && !i.checked
      );
      if (exists) return state;
      return { ...state, items: [action.item, ...state.items] };
    }
    case 'TOGGLE':
      return {
        ...state,
        items: state.items.map(i => i.id === action.id ? { ...i, checked: !i.checked } : i),
      };
    case 'DELETE':
      return { ...state, items: state.items.filter(i => i.id !== action.id) };
    case 'CLEAR_CHECKED':
      return { ...state, items: state.items.filter(i => !i.checked) };
    case 'CLEAR_ALL':
      return { ...state, items: [] };
    default:
      return state;
  }
}

interface ShoppingContextValue {
  items: ShoppingItem[];
  isLoaded: boolean;
  addItem: (item: Omit<ShoppingItem, 'id' | 'addedAt'>) => Promise<void>;
  toggleItem: (id: string) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  clearChecked: () => Promise<void>;
  clearAll: () => Promise<void>;
  uncheckedCount: number;
  checkedCount: number;
}

const ShoppingContext = createContext<ShoppingContextValue | null>(null);

export function ShoppingProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(shoppingReducer, { items: [], isLoaded: false });

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(data => {
      if (data) {
        try {
          const items: ShoppingItem[] = JSON.parse(data);
          dispatch({ type: 'LOAD', items });
        } catch {
          dispatch({ type: 'LOAD', items: [] });
        }
      } else {
        dispatch({ type: 'LOAD', items: [] });
      }
    });
  }, []);

  const persist = useCallback(async (items: ShoppingItem[]) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, []);

  const addItem = useCallback(async (itemData: Omit<ShoppingItem, 'id' | 'addedAt'>) => {
    const item: ShoppingItem = {
      ...itemData,
      id: Date.now().toString(),
      addedAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD', item });
    // Persist after state update
    const newItems = [item, ...state.items.filter(
      i => i.name.toLowerCase() !== item.name.toLowerCase() || i.checked
    )];
    await persist(newItems);
  }, [state.items, persist]);

  const toggleItem = useCallback(async (id: string) => {
    dispatch({ type: 'TOGGLE', id });
    const newItems = state.items.map(i => i.id === id ? { ...i, checked: !i.checked } : i);
    await persist(newItems);
  }, [state.items, persist]);

  const deleteItem = useCallback(async (id: string) => {
    dispatch({ type: 'DELETE', id });
    const newItems = state.items.filter(i => i.id !== id);
    await persist(newItems);
  }, [state.items, persist]);

  const clearChecked = useCallback(async () => {
    dispatch({ type: 'CLEAR_CHECKED' });
    const newItems = state.items.filter(i => !i.checked);
    await persist(newItems);
  }, [state.items, persist]);

  const clearAll = useCallback(async () => {
    dispatch({ type: 'CLEAR_ALL' });
    await persist([]);
  }, [persist]);

  return (
    <ShoppingContext.Provider value={{
      items: state.items,
      isLoaded: state.isLoaded,
      addItem,
      toggleItem,
      deleteItem,
      clearChecked,
      clearAll,
      uncheckedCount: state.items.filter(i => !i.checked).length,
      checkedCount: state.items.filter(i => i.checked).length,
    }}>
      {children}
    </ShoppingContext.Provider>
  );
}

export function useShoppingContext() {
  const ctx = useContext(ShoppingContext);
  if (!ctx) throw new Error('useShoppingContext must be used within ShoppingProvider');
  return ctx;
}
