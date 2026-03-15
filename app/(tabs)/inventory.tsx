import React, { useState, useMemo } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Pressable, Alert, Platform
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { useFoodContext } from '@/lib/food-context';
import {
  FoodItem, StorageLocation, STORAGE_LOCATIONS,
  getDaysRemaining, getExpiryStatus, formatDaysRemaining
} from '@/lib/food-data';

const FILTERS: { key: 'all' | StorageLocation; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'fridge', label: '🧊 Fridge' },
  { key: 'freezer', label: '❄️ Freezer' },
  { key: 'pantry', label: '🏠 Pantry' },
  { key: 'cellar', label: '🍷 Cellar' },
];

function FoodCard({ item, onPress, onDelete }: { item: FoodItem; onPress: () => void; onDelete: () => void }) {
  const colors = useColors();
  const days = getDaysRemaining(item.expiryDate);
  const status = getExpiryStatus(item.expiryDate);
  const statusColor = status === 'expired' ? colors.error : status === 'expiring_soon' ? colors.warning : colors.success;
  const loc = STORAGE_LOCATIONS.find(l => l.key === item.category);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.foodCard,
        { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.85 : 1 }
      ]}
    >
      <View style={[styles.statusStrip, { backgroundColor: statusColor }]} />
      <View style={styles.cardContent}>
        <Text style={styles.foodEmoji}>{item.emoji}</Text>
        <View style={styles.cardInfo}>
          <Text style={[styles.foodName, { color: colors.foreground }]} numberOfLines={1}>{item.name}</Text>
          <View style={styles.cardMeta}>
            <View style={[styles.locBadge, { backgroundColor: loc?.color + '20' }]}>
              <Text style={[styles.locBadgeText, { color: loc?.color }]}>{loc?.emoji} {loc?.label}</Text>
            </View>
            <Text style={[styles.quantity, { color: colors.muted }]}>{item.quantity} {item.unit}</Text>
          </View>
          <Text style={[styles.expiryText, { color: statusColor }]}>{formatDaysRemaining(days)}</Text>
        </View>
        <TouchableOpacity
          onPress={onDelete}
          style={styles.deleteBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <IconSymbol name="trash.fill" size={18} color={colors.error} />
        </TouchableOpacity>
      </View>
    </Pressable>
  );
}

export default function InventoryScreen() {
  const colors = useColors();
  const router = useRouter();
  const params = useLocalSearchParams<{ filter?: string }>();
  const { items, deleteItem } = useFoodContext();

  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | StorageLocation>(
    (params.filter as StorageLocation) || 'all'
  );
  const [sortBy, setSortBy] = useState<'expiry' | 'name'>('expiry');

  const filtered = useMemo(() => {
    let result = items;
    if (activeFilter !== 'all') result = result.filter(i => i.category === activeFilter);
    if (search.trim()) result = result.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));
    if (sortBy === 'expiry') result = [...result].sort((a, b) => getDaysRemaining(a.expiryDate) - getDaysRemaining(b.expiryDate));
    else result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    return result;
  }, [items, activeFilter, search, sortBy]);

  const handleDelete = (item: FoodItem) => {
    Alert.alert('Remove Item', `Remove "${item.name}" from your inventory?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: async () => {
          if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          await deleteItem(item.id);
        }
      }
    ]);
  };

  return (
    <ScreenContainer containerClassName="bg-background">
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Inventory</Text>
        <TouchableOpacity
          style={[styles.sortBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => setSortBy(s => s === 'expiry' ? 'name' : 'expiry')}
        >
          <IconSymbol name="arrow.up.arrow.down" size={16} color={colors.primary} />
          <Text style={[styles.sortText, { color: colors.primary }]}>
            {sortBy === 'expiry' ? 'Expiry' : 'Name'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <IconSymbol name="magnifyingglass" size={18} color={colors.muted} />
        <TextInput
          style={[styles.searchInput, { color: colors.foreground }]}
          placeholder="Search food items..."
          placeholderTextColor={colors.muted}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <IconSymbol name="xmark.circle.fill" size={18} color={colors.muted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <FlatList
        data={FILTERS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={f => f.key}
        contentContainerStyle={styles.filterList}
        renderItem={({ item: f }) => (
          <TouchableOpacity
            style={[
              styles.filterTab,
              { borderColor: colors.border, backgroundColor: colors.surface },
              activeFilter === f.key && { backgroundColor: colors.primary, borderColor: colors.primary }
            ]}
            onPress={() => setActiveFilter(f.key)}
          >
            <Text style={[
              styles.filterTabText,
              { color: colors.muted },
              activeFilter === f.key && { color: '#fff' }
            ]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🥫</Text>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No items found</Text>
            <Text style={[styles.emptySubtitle, { color: colors.muted }]}>
              {search ? 'Try a different search term' : 'Add food items to track their freshness'}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <FoodCard
            item={item}
            onPress={() => router.push({ pathname: '/item-detail' as any, params: { id: item.id } })}
            onDelete={() => handleDelete(item)}
          />
        )}
      />

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/add-item' as any)}
        activeOpacity={0.85}
      >
        <IconSymbol name="plus" size={28} color="#fff" />
      </TouchableOpacity>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 0.5,
  },
  title: { fontSize: 26, fontWeight: '800' },
  sortBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1,
  },
  sortText: { fontSize: 13, fontWeight: '600' },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 16, marginVertical: 10, paddingHorizontal: 12, paddingVertical: 10,
    borderRadius: 12, borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 15, padding: 0 },
  filterList: { paddingHorizontal: 16, paddingBottom: 8, gap: 8 },
  filterTab: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1,
  },
  filterTabText: { fontSize: 13, fontWeight: '600' },
  listContent: { paddingHorizontal: 16, paddingBottom: 100 },
  foodCard: {
    flexDirection: 'row', borderRadius: 16, marginBottom: 10,
    borderWidth: 1, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  statusStrip: { width: 5 },
  cardContent: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10 },
  foodEmoji: { fontSize: 32 },
  cardInfo: { flex: 1 },
  foodName: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  locBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  locBadgeText: { fontSize: 11, fontWeight: '600' },
  quantity: { fontSize: 12 },
  expiryText: { fontSize: 12, fontWeight: '700' },
  deleteBtn: { padding: 4 },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 52, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  emptySubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  fab: {
    position: 'absolute', bottom: 24, right: 20,
    width: 58, height: 58, borderRadius: 29,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 8,
  },
});
