import React, { useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Platform
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { useFoodContext } from '@/lib/food-context';
import {
  STORAGE_LOCATIONS, FOOD_STORAGE_TIPS,
  getDaysRemaining, getExpiryStatus, formatDaysRemaining
} from '@/lib/food-data';

export default function ItemDetailScreen() {
  const colors = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { items, deleteItem } = useFoodContext();

  const item = useMemo(() => items.find(i => i.id === id), [items, id]);

  if (!item) {
    return (
      <ScreenContainer>
        <View style={styles.notFound}>
          <Text style={[styles.notFoundText, { color: colors.muted }]}>Item not found</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[styles.backLink, { color: colors.primary }]}>Go back</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  const days = getDaysRemaining(item.expiryDate);
  const status = getExpiryStatus(item.expiryDate);
  const statusColor = status === 'expired' ? colors.error : status === 'expiring_soon' ? colors.warning : colors.success;
  const loc = STORAGE_LOCATIONS.find(l => l.key === item.category);
  const storageTips = FOOD_STORAGE_TIPS[item.category] ?? FOOD_STORAGE_TIPS.default;

  const handleDelete = () => {
    Alert.alert('Remove Item', `Remove "${item.name}" from your inventory?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: async () => {
          if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          await deleteItem(item.id);
          router.back();
        }
      }
    ]);
  };

  const statusLabel = status === 'expired' ? 'Expired' : status === 'expiring_soon' ? 'Expiring Soon' : 'Fresh';

  return (
    <ScreenContainer containerClassName="bg-background">
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Item Detail</Text>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
          <IconSymbol name="trash.fill" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={[styles.heroSection, { backgroundColor: statusColor + '12' }]}>
          <Text style={styles.heroEmoji}>{item.emoji}</Text>
          <Text style={[styles.heroName, { color: colors.foreground }]}>{item.name}</Text>

          {/* Status Badge */}
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20', borderColor: statusColor + '40' }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
          </View>

          {/* Days Remaining */}
          <View style={styles.daysContainer}>
            <Text style={[styles.daysNumber, { color: statusColor }]}>
              {Math.abs(days)}
            </Text>
            <Text style={[styles.daysLabel, { color: colors.muted }]}>
              {days < 0 ? 'days ago' : days === 0 ? 'expires today' : 'days remaining'}
            </Text>
          </View>
        </View>

        {/* Info Cards */}
        <View style={styles.infoGrid}>
          <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.infoCardLabel, { color: colors.muted }]}>Storage</Text>
            <Text style={styles.infoCardEmoji}>{loc?.emoji}</Text>
            <Text style={[styles.infoCardValue, { color: colors.foreground }]}>{loc?.label}</Text>
          </View>
          <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.infoCardLabel, { color: colors.muted }]}>Quantity</Text>
            <Text style={styles.infoCardEmoji}>📦</Text>
            <Text style={[styles.infoCardValue, { color: colors.foreground }]}>{item.quantity} {item.unit}</Text>
          </View>
          <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.infoCardLabel, { color: colors.muted }]}>Purchased</Text>
            <Text style={styles.infoCardEmoji}>🛒</Text>
            <Text style={[styles.infoCardValue, { color: colors.foreground }]}>{item.purchaseDate}</Text>
          </View>
          <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.infoCardLabel, { color: colors.muted }]}>Expires</Text>
            <Text style={styles.infoCardEmoji}>📅</Text>
            <Text style={[styles.infoCardValue, { color: statusColor }]}>{item.expiryDate}</Text>
          </View>
        </View>

        {/* Notes */}
        {item.notes && (
          <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>📝 Notes</Text>
            <Text style={[styles.notesText, { color: colors.muted }]}>{item.notes}</Text>
          </View>
        )}

        {/* Storage Tips */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            💡 {loc?.label} Storage Tips
          </Text>
          {storageTips.map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <View style={[styles.tipBullet, { backgroundColor: colors.primary }]} />
              <Text style={[styles.tipText, { color: colors.muted }]}>{tip}</Text>
            </View>
          ))}
        </View>

        {/* Preservation Options */}
        {status !== 'fresh' && (
          <View style={[styles.preservationBanner, { backgroundColor: colors.warning + '15', borderColor: colors.warning + '30' }]}>
            <Text style={[styles.preservationTitle, { color: colors.warning }]}>
              ⚡ Extend Shelf Life
            </Text>
            <Text style={[styles.preservationText, { color: colors.foreground }]}>
              This item is {status === 'expired' ? 'expired' : 'expiring soon'}. Consider these preservation methods to reduce waste:
            </Text>
            <View style={styles.preservationMethods}>
              {['❄️ Freeze it', '🫙 Can it', '🥒 Pickle it', '☀️ Dry it'].map(m => (
                <TouchableOpacity
                  key={m}
                  style={[styles.methodChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => router.push('/(tabs)/tips' as any)}
                >
                  <Text style={[styles.methodChipText, { color: colors.foreground }]}>{m}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 0.5,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  deleteBtn: { padding: 4 },
  heroSection: { alignItems: 'center', paddingVertical: 28, paddingHorizontal: 16 },
  heroEmoji: { fontSize: 64, marginBottom: 10 },
  heroName: { fontSize: 26, fontWeight: '800', marginBottom: 10, textAlign: 'center' },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, marginBottom: 16,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 14, fontWeight: '700' },
  daysContainer: { alignItems: 'center' },
  daysNumber: { fontSize: 52, fontWeight: '900', lineHeight: 56 },
  daysLabel: { fontSize: 15, fontWeight: '500', marginTop: 2 },
  infoGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
    paddingHorizontal: 16, marginTop: 16, marginBottom: 6,
  },
  infoCard: {
    width: '47%', borderRadius: 14, padding: 14, alignItems: 'center',
    borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  infoCardLabel: { fontSize: 11, fontWeight: '600', marginBottom: 6 },
  infoCardEmoji: { fontSize: 22, marginBottom: 4 },
  infoCardValue: { fontSize: 14, fontWeight: '700', textAlign: 'center' },
  section: {
    marginHorizontal: 16, marginTop: 10, borderRadius: 16, padding: 16, borderWidth: 1,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  notesText: { fontSize: 14, lineHeight: 20 },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  tipBullet: { width: 6, height: 6, borderRadius: 3, marginTop: 6, flexShrink: 0 },
  tipText: { flex: 1, fontSize: 14, lineHeight: 20 },
  preservationBanner: {
    marginHorizontal: 16, marginTop: 10, borderRadius: 16, padding: 16, borderWidth: 1,
  },
  preservationTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  preservationText: { fontSize: 13, lineHeight: 18, marginBottom: 12 },
  preservationMethods: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  methodChip: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1,
  },
  methodChipText: { fontSize: 13, fontWeight: '600' },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  notFoundText: { fontSize: 16 },
  backLink: { fontSize: 16, fontWeight: '600' },
});
