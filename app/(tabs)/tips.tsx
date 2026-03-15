import React, { useState, useMemo } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Pressable
} from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { PRESERVATION_TIPS, PreservationTip, PreservationCategory } from '@/lib/food-data';

const CATEGORIES: { key: PreservationCategory; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'freezing', label: '❄️ Freezing' },
  { key: 'canning', label: '🫙 Canning' },
  { key: 'pickling', label: '🥒 Pickling' },
  { key: 'drying', label: '☀️ Drying' },
  { key: 'fermenting', label: '🧫 Fermenting' },
  { key: 'vacuum_sealing', label: '🔒 Vacuum' },
  { key: 'smoking', label: '💨 Smoking' },
];

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: '#2D8A4E',
  Medium: '#F4A228',
  Hard: '#E53E3E',
};

function TipCard({ tip, onPress }: { tip: PreservationTip; onPress: () => void }) {
  const colors = useColors();
  const diffColor = DIFFICULTY_COLORS[tip.difficulty] ?? colors.muted;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.tipCard,
        { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.85 : 1 }
      ]}
    >
      <Text style={styles.tipEmoji}>{tip.emoji}</Text>
      <Text style={[styles.tipTitle, { color: colors.foreground }]} numberOfLines={2}>{tip.title}</Text>
      <View style={styles.tipMeta}>
        <View style={[styles.diffBadge, { backgroundColor: diffColor + '20' }]}>
          <Text style={[styles.diffText, { color: diffColor }]}>{tip.difficulty}</Text>
        </View>
        <Text style={[styles.timeText, { color: colors.muted }]}>{tip.timeRequired}</Text>
      </View>
    </Pressable>
  );
}

export default function TipsScreen() {
  const colors = useColors();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<PreservationCategory>('all');

  const filtered = useMemo(() => {
    let result = PRESERVATION_TIPS;
    if (activeCategory !== 'all') result = result.filter(t => t.category === activeCategory);
    if (search.trim()) {
      result = result.filter(t =>
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase()) ||
        t.bestFoods.some(f => f.toLowerCase().includes(search.toLowerCase()))
      );
    }
    return result;
  }, [activeCategory, search]);

  const featuredTip = PRESERVATION_TIPS[0];

  return (
    <ScreenContainer containerClassName="bg-background">
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Preservation Tips</Text>
      </View>

      {/* Search */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <IconSymbol name="magnifyingglass" size={18} color={colors.muted} />
        <TextInput
          style={[styles.searchInput, { color: colors.foreground }]}
          placeholder="Search techniques, foods..."
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

      {/* Category Filters */}
      <FlatList
        data={CATEGORIES}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={c => c.key}
        contentContainerStyle={styles.filterList}
        renderItem={({ item: cat }) => (
          <TouchableOpacity
            style={[
              styles.filterTab,
              { borderColor: colors.border, backgroundColor: colors.surface },
              activeCategory === cat.key && { backgroundColor: colors.primary, borderColor: colors.primary }
            ]}
            onPress={() => setActiveCategory(cat.key)}
          >
            <Text style={[
              styles.filterTabText, { color: colors.muted },
              activeCategory === cat.key && { color: '#fff' }
            ]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Featured Tip */}
      {activeCategory === 'all' && !search && (
        <Pressable
          onPress={() => router.push({ pathname: '/tip-detail' as any, params: { id: featuredTip.id } })}
          style={({ pressed }) => [
            styles.featuredCard,
            { backgroundColor: colors.primary, opacity: pressed ? 0.9 : 1 }
          ]}
        >
          <View style={styles.featuredContent}>
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredBadgeText}>⭐ Featured</Text>
            </View>
            <Text style={styles.featuredEmoji}>{featuredTip.emoji}</Text>
            <Text style={styles.featuredTitle}>{featuredTip.title}</Text>
            <Text style={styles.featuredDesc} numberOfLines={2}>{featuredTip.description}</Text>
            <View style={styles.featuredMeta}>
              <Text style={styles.featuredMetaText}>⏱ {featuredTip.timeRequired}</Text>
              <Text style={styles.featuredMetaText}>📊 {featuredTip.difficulty}</Text>
            </View>
          </View>
        </Pressable>
      )}

      {/* Tips Grid */}
      <FlatList
        data={filtered}
        keyExtractor={t => t.id}
        numColumns={2}
        contentContainerStyle={styles.gridContent}
        columnWrapperStyle={styles.gridRow}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>💡</Text>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No tips found</Text>
            <Text style={[styles.emptySubtitle, { color: colors.muted }]}>Try a different search or category</Text>
          </View>
        }
        renderItem={({ item: tip }) => (
          <TipCard
            tip={tip}
            onPress={() => router.push({ pathname: '/tip-detail' as any, params: { id: tip.id } })}
          />
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 0.5,
  },
  title: { fontSize: 26, fontWeight: '800' },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 16, marginVertical: 10, paddingHorizontal: 12, paddingVertical: 10,
    borderRadius: 12, borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 15, padding: 0 },
  filterList: { paddingHorizontal: 16, paddingBottom: 8, gap: 8 },
  filterTab: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  filterTabText: { fontSize: 13, fontWeight: '600' },
  featuredCard: {
    marginHorizontal: 16, marginBottom: 14, borderRadius: 18, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15, shadowRadius: 8, elevation: 4,
  },
  featuredContent: {},
  featuredBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'flex-start',
    paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12, marginBottom: 8,
  },
  featuredBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  featuredEmoji: { fontSize: 36, marginBottom: 6 },
  featuredTitle: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 4 },
  featuredDesc: { color: 'rgba(255,255,255,0.85)', fontSize: 13, lineHeight: 18, marginBottom: 10 },
  featuredMeta: { flexDirection: 'row', gap: 14 },
  featuredMetaText: { color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: '600' },
  gridContent: { paddingHorizontal: 16, paddingBottom: 100 },
  gridRow: { gap: 10, marginBottom: 10 },
  tipCard: {
    flex: 1, borderRadius: 16, padding: 14, borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  tipEmoji: { fontSize: 32, marginBottom: 8 },
  tipTitle: { fontSize: 14, fontWeight: '700', marginBottom: 8, lineHeight: 20 },
  tipMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  diffBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  diffText: { fontSize: 11, fontWeight: '700' },
  timeText: { fontSize: 11 },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 52, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  emptySubtitle: { fontSize: 14, textAlign: 'center' },
});
