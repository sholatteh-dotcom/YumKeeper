import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Platform, Linking, ActivityIndicator, Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { useSubscription } from '@/lib/subscription-context';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/hooks/use-auth';
import { STRIPE_PRICES } from '@/lib/stripe-prices';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';

type BillingInterval = 'month' | 'year';

interface TierFeature {
  text: string;
  included: boolean;
}

interface TierConfig {
  id: 'free' | 'fresh' | 'family';
  name: string;
  emoji: string;
  monthlyPrice: number;
  annualPrice: number;
  monthlyPriceId: string;
  annualPriceId: string;
  tagline: string;
  color: string;
  features: TierFeature[];
  popular?: boolean;
}

const TIERS: TierConfig[] = [
  {
    id: 'free',
    name: 'Free',
    emoji: '🌱',
    monthlyPrice: 0,
    annualPrice: 0,
    monthlyPriceId: '',
    annualPriceId: '',
    tagline: 'Get started with the basics',
    color: '#687076',
    features: [
      { text: 'Up to 10 food items', included: true },
      { text: 'Manual item entry', included: true },
      { text: '3 preservation tips', included: true },
      { text: 'Basic expiry tracking', included: true },
      { text: 'Barcode scanner', included: false },
      { text: 'Shopping list', included: false },
      { text: 'Expiry notifications', included: false },
      { text: 'All 8 preservation tips', included: false },
      { text: 'Family sharing (6 members)', included: false },
    ],
  },
  {
    id: 'fresh',
    name: 'Fresh',
    emoji: '🥦',
    monthlyPrice: 2.99,
    annualPrice: 19.99,
    monthlyPriceId: STRIPE_PRICES.freshMonthly,
    annualPriceId: STRIPE_PRICES.freshAnnual,
    tagline: 'Everything you need to waste less',
    color: '#2D8A4E',
    popular: true,
    features: [
      { text: 'Unlimited food items', included: true },
      { text: 'Barcode scanner', included: true },
      { text: 'Shopping list', included: true },
      { text: 'Expiry notifications', included: true },
      { text: 'All 8 preservation tips', included: true },
      { text: 'Use It Up meal suggestions', included: true },
      { text: 'Dark mode', included: true },
      { text: 'Family sharing (6 members)', included: false },
    ],
  },
  {
    id: 'family',
    name: 'Family',
    emoji: '🏡',
    monthlyPrice: 5.99,
    annualPrice: 39.99,
    monthlyPriceId: STRIPE_PRICES.familyMonthly,
    annualPriceId: STRIPE_PRICES.familyAnnual,
    tagline: 'Share with up to 6 family members',
    color: '#C05621',
    features: [
      { text: 'Everything in Fresh', included: true },
      { text: 'Family sharing (6 members)', included: true },
      { text: 'Shared inventory across devices', included: true },
      { text: 'Priority support', included: true },
    ],
  },
];

export default function PricingScreen() {
  const colors = useColors();
  const router = useRouter();
  const { tier: currentTier } = useSubscription();
  const { isAuthenticated } = useAuth();
  const [billingInterval, setBillingInterval] = useState<BillingInterval>('year');
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  const createCheckoutMutation = trpc.stripe.createCheckoutSession.useMutation();

  const annualSavings = (tier: TierConfig) => {
    const monthlyCost = tier.monthlyPrice * 12;
    const saved = monthlyCost - tier.annualPrice;
    return Math.round((saved / monthlyCost) * 100);
  };

  const handleSubscribe = async (tier: TierConfig) => {
    if (tier.id === 'free') return;
    if (tier.id === currentTier) return;

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    if (!isAuthenticated) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to subscribe to a plan.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/oauth/callback') },
        ]
      );
      return;
    }

    setLoadingTier(tier.id);
    try {
      const priceId = billingInterval === 'month' ? tier.monthlyPriceId : tier.annualPriceId;
      const successUrl = `${API_BASE}/api/stripe/success?tier=${tier.id}`;
      const cancelUrl = `${API_BASE}/api/stripe/cancel`;

      const { url } = await createCheckoutMutation.mutateAsync({
        priceId: priceId as any,
        successUrl,
        cancelUrl,
      });

      if (url) {
        await Linking.openURL(url);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Could not start checkout. Please try again.');
    } finally {
      setLoadingTier(null);
    }
  };

  const displayPrice = (tier: TierConfig) => {
    if (tier.id === 'free') return '$0';
    const price = billingInterval === 'month' ? tier.monthlyPrice : tier.annualPrice;
    return `$${price.toFixed(2)}`;
  };

  const displayPeriod = (tier: TierConfig) => {
    if (tier.id === 'free') return 'forever';
    if (billingInterval === 'month') return '/month';
    return '/year';
  };

  return (
    <ScreenContainer edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <IconSymbol name="xmark" size={20} color={colors.muted} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.foreground }]}>Choose Your Plan</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Reduce food waste and save money with YumKeeper
          </Text>
        </View>

        {/* Billing Toggle */}
        <View style={[styles.toggleContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.toggleBtn, billingInterval === 'month' && { backgroundColor: colors.background }]}
            onPress={() => setBillingInterval('month')}
          >
            <Text style={[styles.toggleText, { color: billingInterval === 'month' ? colors.foreground : colors.muted }]}>
              Monthly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, billingInterval === 'year' && { backgroundColor: colors.background }]}
            onPress={() => setBillingInterval('year')}
          >
            <Text style={[styles.toggleText, { color: billingInterval === 'year' ? colors.foreground : colors.muted }]}>
              Annual
            </Text>
            <View style={[styles.saveBadge, { backgroundColor: '#2D8A4E' }]}>
              <Text style={styles.saveBadgeText}>Save ~33%</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Tier Cards */}
        {TIERS.map((tier) => {
          const isCurrentPlan = tier.id === currentTier;
          const isLoading = loadingTier === tier.id;
          const savings = billingInterval === 'year' && tier.id !== 'free' ? annualSavings(tier) : 0;

          return (
            <View
              key={tier.id}
              style={[
                styles.tierCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: tier.popular ? tier.color : colors.border,
                  borderWidth: tier.popular ? 2 : 1,
                },
              ]}
            >
              {tier.popular && (
                <View style={[styles.popularBadge, { backgroundColor: tier.color }]}>
                  <Text style={styles.popularBadgeText}>⭐ Most Popular</Text>
                </View>
              )}

              {/* Tier header */}
              <View style={styles.tierHeader}>
                <View style={styles.tierTitleRow}>
                  <Text style={styles.tierEmoji}>{tier.emoji}</Text>
                  <View>
                    <Text style={[styles.tierName, { color: colors.foreground }]}>{tier.name}</Text>
                    <Text style={[styles.tierTagline, { color: colors.muted }]}>{tier.tagline}</Text>
                  </View>
                </View>
                <View style={styles.priceBlock}>
                  <Text style={[styles.price, { color: tier.color }]}>{displayPrice(tier)}</Text>
                  <Text style={[styles.pricePeriod, { color: colors.muted }]}>{displayPeriod(tier)}</Text>
                  {savings > 0 && (
                    <Text style={[styles.savingsText, { color: tier.color }]}>Save {savings}%</Text>
                  )}
                </View>
              </View>

              {/* Features */}
              <View style={styles.featureList}>
                {tier.features.map((feature, i) => (
                  <View key={i} style={styles.featureRow}>
                    <Text style={[styles.featureIcon, { color: feature.included ? '#2D8A4E' : colors.border }]}>
                      {feature.included ? '✓' : '✗'}
                    </Text>
                    <Text style={[styles.featureText, { color: feature.included ? colors.foreground : colors.muted }]}>
                      {feature.text}
                    </Text>
                  </View>
                ))}
              </View>

              {/* CTA Button */}
              {tier.id !== 'free' && (
                <TouchableOpacity
                  style={[
                    styles.ctaBtn,
                    {
                      backgroundColor: isCurrentPlan ? colors.surface : tier.color,
                      borderColor: tier.color,
                      borderWidth: isCurrentPlan ? 1.5 : 0,
                      opacity: isCurrentPlan ? 0.7 : 1,
                    },
                  ]}
                  onPress={() => handleSubscribe(tier)}
                  disabled={isCurrentPlan || isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color={isCurrentPlan ? tier.color : '#fff'} size="small" />
                  ) : (
                    <Text style={[styles.ctaBtnText, { color: isCurrentPlan ? tier.color : '#fff' }]}>
                      {isCurrentPlan ? '✓ Current Plan' : `Get ${tier.name}`}
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          );
        })}

        {/* Footer note */}
        <Text style={[styles.footerNote, { color: colors.muted }]}>
          Cancel anytime. Subscriptions managed via Stripe. Secure payment processing.
        </Text>
        <View style={{ height: 32 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingTop: 12 },
  header: { alignItems: 'center', marginBottom: 24, gap: 8 },
  closeBtn: { alignSelf: 'flex-end', padding: 8, marginBottom: 4 },
  title: { fontSize: 26, fontWeight: '800', textAlign: 'center' },
  subtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  toggleContainer: {
    flexDirection: 'row', borderRadius: 12, borderWidth: 1,
    padding: 4, marginBottom: 24, gap: 4,
  },
  toggleBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10, borderRadius: 9, gap: 6,
  },
  toggleText: { fontSize: 14, fontWeight: '600' },
  saveBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  saveBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  tierCard: {
    borderRadius: 20, marginBottom: 16, overflow: 'hidden',
    padding: 20,
  },
  popularBadge: {
    alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: 20, marginBottom: 12,
  },
  popularBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  tierHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  tierTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  tierEmoji: { fontSize: 32 },
  tierName: { fontSize: 18, fontWeight: '800' },
  tierTagline: { fontSize: 12, lineHeight: 16, marginTop: 2 },
  priceBlock: { alignItems: 'flex-end' },
  price: { fontSize: 26, fontWeight: '900' },
  pricePeriod: { fontSize: 12, marginTop: 2 },
  savingsText: { fontSize: 11, fontWeight: '700', marginTop: 2 },
  featureList: { gap: 8, marginBottom: 16 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureIcon: { fontSize: 14, fontWeight: '700', width: 16, textAlign: 'center' },
  featureText: { fontSize: 13, flex: 1, lineHeight: 18 },
  ctaBtn: {
    paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginTop: 4,
  },
  ctaBtnText: { fontSize: 15, fontWeight: '700' },
  footerNote: { fontSize: 11, textAlign: 'center', lineHeight: 16, marginTop: 8 },
});
