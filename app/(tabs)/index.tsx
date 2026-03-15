import React, { useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, FlatList, StyleSheet, Pressable
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { useFoodContext } from '@/lib/food-context';
import {
  FoodItem, STORAGE_LOCATIONS, getDaysRemaining, formatDaysRemaining, getExpiryStatus
} from '@/lib/food-data';

function StatCard({ label, value, color, icon }: { label: string; value: number; color: string; icon: string }) {
  const colors = useColors();
  return (
    <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.statIconBg, { backgroundColor: color + '20' }]}>
        <Text style={styles.statIcon}>{icon}</Text>
      </View>
      <Text style={[styles.statValue, { color: color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.muted }]}>{label}</Text>
    </View>
  );
}

function ExpiryItemCard({ item, onPress }: { item: FoodItem; onPress: () => void }) {
  const colors = useColors();
  const days = getDaysRemaining(item.expiryDate);
  const status = getExpiryStatus(item.expiryDate);
  const statusColor = status === 'expired' ? colors.error : status === 'expiring_soon' ? colors.warning : colors.success;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.expiryCard,
        { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.8 : 1 }
      ]}
    >
      <Text style={styles.expiryEmoji}>{item.emoji}</Text>
      <Text style={[styles.expiryName, { color: colors.foreground }]} numberOfLines={1}>{item.name}</Text>
      <View style={[styles.expiryBadge, { backgroundColor: statusColor + '20' }]}>
        <Text style={[styles.expiryBadgeText, { color: statusColor }]}>
          {days < 0 ? 'Expired' : days === 0 ? 'Today' : `${days}d`}
        </Text>
      </View>
    </Pressable>
  );
}

export default function DashboardScreen() {
  const colors = useColors();
  const router = useRouter();
  const { items, stats, getExpiringSoon, getExpired } = useFoodContext();

  const urgentItems = useMemo(() => {
    const expiring = getExpiringSoon();
    const expired = getExpired();
    return [...expired, ...expiring].sort((a, b) =>
      getDaysRemaining(a.expiryDate) - getDaysRemaining(b.expiryDate)
    );
  }, [items]);

  const today = new Date();
  const greeting = today.getHours() < 12 ? 'Good morning' : today.getHours() < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const handleAddItem = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/add-item' as any);
  };

  const locationStats = STORAGE_LOCATIONS.map(loc => ({
    ...loc,
    count: items.filter(i => i.category === loc.key).length,
  }));

  return (
    <ScreenContainer containerClassName="bg-background">
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.muted }]}>{greeting} 👋</Text>
            <Text style={[styles.appTitle, { color: colors.foreground }]}>FreshKeep</Text>
            <Text style={[styles.dateText, { color: colors.muted }]}>{dateStr}</Text>
          </View>
          <View style={[styles.logoCircle, { backgroundColor: colors.primary + '15' }]}>
            <Text style={styles.logoEmoji}>🫙</Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatCard label="Total" value={stats.total} color={colors.primary} icon="📦" />
          <StatCard label="Fresh" value={stats.fresh} color={colors.success} icon="✅" />
          <StatCard label="Soon" value={stats.expiringSoon} color={colors.warning} icon="⚠️" />
          <StatCard label="Expired" value={stats.expired} color={colors.error} icon="❌" />
        </View>

        {/* Urgent Items */}
        {urgentItems.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>⚡ Needs Attention</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/inventory' as any)}>
                <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={urgentItems.slice(0, 8)}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={i => i.id}
              contentContainerStyle={styles.horizontalList}
              renderItem={({ item }) => (
                <ExpiryItemCard
                  item={item}
                  onPress={() => router.push({ pathname: '/item-detail' as any, params: { id: item.id } })}
                />
              )}
            />
          </View>
        )}

        {/* Storage Locations */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>📍 Storage Locations</Text>
          <View style={styles.locationGrid}>
            {locationStats.map(loc => (
              <TouchableOpacity
                key={loc.key}
                style={[styles.locationCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => router.push({ pathname: '/(tabs)/inventory' as any, params: { filter: loc.key } })}
                activeOpacity={0.7}
              >
                <Text style={styles.locationEmoji}>{loc.emoji}</Text>
                <Text style={[styles.locationLabel, { color: colors.foreground }]}>{loc.label}</Text>
                <Text style={[styles.locationCount, { color: colors.primary }]}>{loc.count} items</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Tips Banner */}
        <TouchableOpacity
          style={[styles.tipsBanner, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/(tabs)/tips' as any)}
          activeOpacity={0.85}
        >
          <View>
            <Text style={styles.tipsBannerTitle}>💡 Preservation Tips</Text>
            <Text style={styles.tipsBannerSub}>Learn to make food last longer</Text>
          </View>
          <IconSymbol name="chevron.right" size={22} color="#fff" />
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={handleAddItem}
        activeOpacity={0.85}
      >
        <IconSymbol name="plus" size={28} color="#fff" />
      </TouchableOpacity>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 16, paddingTop: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  greeting: { fontSize: 14, fontWeight: '500' },
  appTitle: { fontSize: 28, fontWeight: '800', marginTop: 2 },
  dateText: { fontSize: 13, marginTop: 2 },
  logoCircle: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  logoEmoji: { fontSize: 26 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  statCard: {
    flex: 1, borderRadius: 14, padding: 10, alignItems: 'center',
    borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  statIconBg: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  statIcon: { fontSize: 16 },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 10, fontWeight: '600', marginTop: 2, textAlign: 'center' },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '700' },
  seeAll: { fontSize: 14, fontWeight: '600' },
  horizontalList: { paddingRight: 8 },
  expiryCard: {
    width: 90, borderRadius: 14, padding: 10, alignItems: 'center',
    marginRight: 10, borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  expiryEmoji: { fontSize: 28, marginBottom: 4 },
  expiryName: { fontSize: 11, fontWeight: '600', textAlign: 'center', marginBottom: 6 },
  expiryBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  expiryBadgeText: { fontSize: 10, fontWeight: '700' },
  locationGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  locationCard: {
    width: '47%', borderRadius: 16, padding: 14, alignItems: 'center',
    borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  locationEmoji: { fontSize: 28, marginBottom: 6 },
  locationLabel: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  locationCount: { fontSize: 12, fontWeight: '600' },
  tipsBanner: {
    borderRadius: 16, padding: 16, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center', marginBottom: 16,
  },
  tipsBannerTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 2 },
  tipsBannerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  fab: {
    position: 'absolute', bottom: 24, right: 20,
    width: 58, height: 58, borderRadius: 29,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 8,
  },
});
