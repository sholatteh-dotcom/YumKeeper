import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/hooks/use-auth';

export type SubscriptionTier = 'free' | 'fresh' | 'family';

export interface SubscriptionState {
  tier: SubscriptionTier;
  status: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  billingInterval?: 'month' | 'year';
  isLoading: boolean;
}

export interface SubscriptionContextValue extends SubscriptionState {
  // Feature gates
  canAddItems: (currentCount: number) => boolean;
  canUseBarcodeScanner: boolean;
  canUseShoppingList: boolean;
  canUseNotifications: boolean;
  canSeeAllTips: boolean;
  canUseFamilySharing: boolean;
  maxItems: number;
  // Actions
  refresh: () => void;
}

const FREE_ITEM_LIMIT = 10;
const FREE_TIPS_LIMIT = 3;

const defaultState: SubscriptionState = {
  tier: 'free',
  status: 'inactive',
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
  isLoading: true,
};

const SubscriptionContext = createContext<SubscriptionContextValue>({
  ...defaultState,
  canAddItems: () => true,
  canUseBarcodeScanner: false,
  canUseShoppingList: false,
  canUseNotifications: false,
  canSeeAllTips: false,
  canUseFamilySharing: false,
  maxItems: FREE_ITEM_LIMIT,
  refresh: () => {},
});

const CACHE_KEY = '@yumkeeper_subscription';

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [state, setState] = useState<SubscriptionState>(defaultState);

  // Load cached subscription on mount
  useEffect(() => {
    AsyncStorage.getItem(CACHE_KEY).then((cached) => {
      if (cached) {
        try {
          const parsed = JSON.parse(cached) as SubscriptionState;
          setState({ ...parsed, isLoading: true });
        } catch {}
      }
    });
  }, []);

  // Fetch from server when authenticated
  const statusQuery = trpc.stripe.getStatus.useQuery(undefined, {
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  useEffect(() => {
    if (statusQuery.data) {
      const newState: SubscriptionState = {
        tier: statusQuery.data.tier,
        status: statusQuery.data.status,
        currentPeriodEnd: statusQuery.data.currentPeriodEnd ?? null,
        cancelAtPeriodEnd: statusQuery.data.cancelAtPeriodEnd ?? false,
        billingInterval: statusQuery.data.billingInterval as 'month' | 'year' | undefined,
        isLoading: false,
      };
      setState(newState);
      AsyncStorage.setItem(CACHE_KEY, JSON.stringify(newState));
    } else if (!isAuthenticated && !statusQuery.isLoading) {
      setState({ ...defaultState, isLoading: false });
    } else if (statusQuery.error) {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [statusQuery.data, statusQuery.error, isAuthenticated, statusQuery.isLoading]);

  const refresh = useCallback(() => {
    statusQuery.refetch();
  }, [statusQuery]);

  const isPaid = state.tier === 'fresh' || state.tier === 'family';
  const isFamily = state.tier === 'family';

  const value: SubscriptionContextValue = {
    ...state,
    canAddItems: (currentCount: number) => isPaid || currentCount < FREE_ITEM_LIMIT,
    canUseBarcodeScanner: isPaid,
    canUseShoppingList: isPaid,
    canUseNotifications: isPaid,
    canSeeAllTips: isPaid,
    canUseFamilySharing: isFamily,
    maxItems: isPaid ? Infinity : FREE_ITEM_LIMIT,
    refresh,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  return useContext(SubscriptionContext);
}

export { FREE_ITEM_LIMIT, FREE_TIPS_LIMIT };
