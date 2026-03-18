import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';

const FEATURE_COPY: Record<string, { emoji: string; title: string; description: string }> = {
  barcode: {
    emoji: '📷',
    title: 'Barcode Scanner',
    description: 'Scan product barcodes to instantly add food items with name, category, and shelf life pre-filled.',
  },
  shopping: {
    emoji: '🛒',
    title: 'Shopping List',
    description: 'Auto-generate a restock list when items are consumed, and manage your grocery runs in one place.',
  },
  notifications: {
    emoji: '🔔',
    title: 'Expiry Notifications',
    description: 'Get push alerts 3 days before food expires so you never miss a chance to use it up.',
  },
  tips: {
    emoji: '📚',
    title: 'All Preservation Tips',
    description: 'Unlock all 8 preservation techniques including fermenting, vacuum sealing, smoking, and more.',
  },
  items: {
    emoji: '🥕',
    title: 'Unlimited Items',
    description: 'The free plan supports up to 10 items. Upgrade to track your entire pantry, fridge, and freezer.',
  },
  family: {
    emoji: '🏡',
    title: 'Family Sharing',
    description: 'Share your inventory with up to 6 family members so everyone stays in sync.',
  },
};

export default function PaywallScreen() {
  const colors = useColors();
  const router = useRouter();
  const { feature } = useLocalSearchParams<{ feature?: string }>();

  const copy = FEATURE_COPY[feature ?? ''] ?? {
    emoji: '⭐',
    title: 'Premium Feature',
    description: 'This feature is available on the Fresh or Family plan.',
  };

  const handleUpgrade = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/pricing' as any);
  };

  return (
    <ScreenContainer edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.container}>
        {/* Close */}
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Text style={[styles.closeText, { color: colors.muted }]}>✕</Text>
        </TouchableOpacity>

        {/* Icon */}
        <View style={[styles.iconCircle, { backgroundColor: colors.surface }]}>
          <Text style={styles.iconEmoji}>{copy.emoji}</Text>
        </View>

        {/* Copy */}
        <Text style={[styles.title, { color: colors.foreground }]}>{copy.title}</Text>
        <Text style={[styles.description, { color: colors.muted }]}>{copy.description}</Text>

        {/* Upgrade CTA */}
        <TouchableOpacity
          style={[styles.upgradeBtn, { backgroundColor: '#2D8A4E' }]}
          onPress={handleUpgrade}
        >
          <Text style={styles.upgradeBtnText}>🥦 Upgrade to Fresh — $1.67/mo</Text>
        </TouchableOpacity>

        {/* Secondary */}
        <TouchableOpacity onPress={() => router.back()} style={styles.notNowBtn}>
          <Text style={[styles.notNowText, { color: colors.muted }]}>Not now</Text>
        </TouchableOpacity>

        {/* Trust signals */}
        <View style={[styles.trustRow, { borderTopColor: colors.border }]}>
          <Text style={[styles.trustItem, { color: colors.muted }]}>✓ Cancel anytime</Text>
          <Text style={[styles.trustItem, { color: colors.muted }]}>✓ Secure payment</Text>
          <Text style={[styles.trustItem, { color: colors.muted }]}>✓ 7-day free trial</Text>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32,
  },
  closeBtn: { position: 'absolute', top: 16, right: 16, padding: 8 },
  closeText: { fontSize: 18, fontWeight: '600' },
  iconCircle: {
    width: 100, height: 100, borderRadius: 50,
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
  },
  iconEmoji: { fontSize: 48 },
  title: { fontSize: 24, fontWeight: '800', textAlign: 'center', marginBottom: 12 },
  description: { fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  upgradeBtn: {
    width: '100%', paddingVertical: 16, borderRadius: 16,
    alignItems: 'center', marginBottom: 12,
  },
  upgradeBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  notNowBtn: { paddingVertical: 12 },
  notNowText: { fontSize: 14 },
  trustRow: {
    flexDirection: 'row', gap: 16, marginTop: 32,
    paddingTop: 20, borderTopWidth: 1, flexWrap: 'wrap', justifyContent: 'center',
  },
  trustItem: { fontSize: 12 },
});
