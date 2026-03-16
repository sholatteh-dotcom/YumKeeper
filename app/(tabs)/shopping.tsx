import React, { useState, useMemo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput,
  Alert, Platform
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { useShoppingContext, ShoppingItem } from '@/lib/shopping-context';
import { STORAGE_LOCATIONS, FOOD_SUGGESTIONS, getFoodEmoji, StorageLocation } from '@/lib/food-data';

const CATEGORY_FILTERS = [
  { key: 'all', label: 'All', emoji: '🛒' },
  { key: 'fridge', label: 'Fridge', emoji: '🧊' },
  { key: 'freezer', label: 'Freezer', emoji: '❄️' },
  { key: 'pantry', label: 'Pantry', emoji: '🏠' },
  { key: 'cellar', label: 'Cellar', emoji: '🍷' },
] as const;

export default function ShoppingScreen() {
  const colors = useColors();
  const { items, addItem, toggleItem, deleteItem, clearChecked, clearAll, uncheckedCount, checkedCount } = useShoppingContext();

  const [newItemName, setNewItemName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | StorageLocation>('all');
  const [showAddRow, setShowAddRow] = useState(false);
  const [newItemCategory, setNewItemCategory] = useState<StorageLocation>('pantry');

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'all') return items;
    return items.filter(i => i.category === selectedCategory);
  }, [items, selectedCategory]);

  const uncheckedItems = filteredItems.filter(i => !i.checked);
  const checkedItems = filteredItems.filter(i => i.checked);

  const handleAddItem = async () => {
    const name = newItemName.trim();
    if (!name) return;

    const suggestion = FOOD_SUGGESTIONS.find(f => f.name.toLowerCase() === name.toLowerCase());
    await addItem({
      name: suggestion?.name ?? name,
      emoji: suggestion?.emoji ?? getFoodEmoji(name),
      category: suggestion?.category ?? newItemCategory,
      quantity: 1,
      unit: 'pcs',
      checked: false,
      source: 'manual',
    });

    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setNewItemName('');
    setShowAddRow(false);
  };

  const handleToggle = async (id: string) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await toggleItem(id);
  };

  const handleClearChecked = () => {
    if (checkedCount === 0) return;
    Alert.alert('Clear Completed', `Remove ${checkedCount} completed item${checkedCount > 1 ? 's' : ''}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear', style: 'destructive',
        onPress: async () => {
          if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          await clearChecked();
        }
      }
    ]);
  };

  const renderItem = ({ item }: { item: ShoppingItem }) => {
    const loc = STORAGE_LOCATIONS.find(l => l.key === item.category);
    return (
      <View style={[styles.itemRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.checkbox,
            { borderColor: item.checked ? colors.success : colors.border },
            item.checked && { backgroundColor: colors.success }
          ]}
          onPress={() => handleToggle(item.id)}
          activeOpacity={0.7}
        >
          {item.checked && <IconSymbol name="checkmark.circle.fill" size={14} color="#fff" />}
        </TouchableOpacity>

        <Text style={styles.itemEmoji}>{item.emoji}</Text>

        <View style={styles.itemInfo}>
          <Text style={[
            styles.itemName,
            { color: colors.foreground },
            item.checked && { textDecorationLine: 'line-through', color: colors.muted }
          ]}>
            {item.name}
          </Text>
          <View style={styles.itemMeta}>
            <Text style={[styles.itemMetaText, { color: loc?.color ?? colors.muted }]}>
              {loc?.emoji} {loc?.label}
            </Text>
            {item.source === 'auto' && (
              <View style={[styles.autoBadge, { backgroundColor: colors.warning + '20' }]}>
                <Text style={[styles.autoBadgeText, { color: colors.warning }]}>Auto-added</Text>
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => deleteItem(item.id)}
          activeOpacity={0.7}
        >
          <IconSymbol name="xmark" size={16} color={colors.muted} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScreenContainer containerClassName="bg-background">
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Shopping List</Text>
          <Text style={[styles.headerSubtitle, { color: colors.muted }]}>
            {uncheckedCount} item{uncheckedCount !== 1 ? 's' : ''} to buy
          </Text>
        </View>
        <View style={styles.headerActions}>
          {checkedCount > 0 && (
            <TouchableOpacity
              style={[styles.headerBtn, { backgroundColor: colors.error + '15' }]}
              onPress={handleClearChecked}
            >
              <Text style={[styles.headerBtnText, { color: colors.error }]}>Clear Done</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.headerBtn, { backgroundColor: colors.primary + '15' }]}
            onPress={() => setShowAddRow(!showAddRow)}
          >
            <IconSymbol name="plus" size={16} color={colors.primary} />
            <Text style={[styles.headerBtnText, { color: colors.primary }]}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Add item row */}
      {showAddRow && (
        <View style={[styles.addRow, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <TextInput
            style={[styles.addInput, { color: colors.foreground, borderColor: colors.border }]}
            placeholder="Item name..."
            placeholderTextColor={colors.muted}
            value={newItemName}
            onChangeText={setNewItemName}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleAddItem}
          />
          <View style={styles.addCategoryRow}>
            {STORAGE_LOCATIONS.map(loc => (
              <TouchableOpacity
                key={loc.key}
                style={[
                  styles.addCategoryBtn,
                  { borderColor: colors.border, backgroundColor: colors.background },
                  newItemCategory === loc.key && { borderColor: loc.color, backgroundColor: loc.color + '20' }
                ]}
                onPress={() => setNewItemCategory(loc.key)}
              >
                <Text style={styles.addCategoryEmoji}>{loc.emoji}</Text>
                <Text style={[
                  styles.addCategoryLabel,
                  { color: colors.muted },
                  newItemCategory === loc.key && { color: loc.color }
                ]}>
                  {loc.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.addActions}>
            <TouchableOpacity
              style={[styles.addCancelBtn, { borderColor: colors.border }]}
              onPress={() => { setShowAddRow(false); setNewItemName(''); }}
            >
              <Text style={[styles.addCancelText, { color: colors.muted }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.addConfirmBtn, { backgroundColor: colors.primary }]}
              onPress={handleAddItem}
            >
              <Text style={styles.addConfirmText}>Add to List</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Category filter */}
      <View style={[styles.filterBar, { borderBottomColor: colors.border }]}>
        <FlatList
          horizontal
          data={CATEGORY_FILTERS}
          keyExtractor={f => f.key}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          renderItem={({ item: f }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                { backgroundColor: colors.surface, borderColor: colors.border },
                selectedCategory === f.key && { backgroundColor: colors.primary, borderColor: colors.primary }
              ]}
              onPress={() => setSelectedCategory(f.key as any)}
            >
              <Text style={styles.filterEmoji}>{f.emoji}</Text>
              <Text style={[
                styles.filterLabel,
                { color: colors.muted },
                selectedCategory === f.key && { color: '#fff' }
              ]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* List */}
      {items.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🛒</Text>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Your list is empty</Text>
          <Text style={[styles.emptyText, { color: colors.muted }]}>
            Items are automatically added here when you remove them from your inventory. You can also add items manually.
          </Text>
          <TouchableOpacity
            style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
            onPress={() => setShowAddRow(true)}
          >
            <IconSymbol name="plus" size={18} color="#fff" />
            <Text style={styles.emptyBtnText}>Add First Item</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={[...uncheckedItems, ...checkedItems]}
          keyExtractor={i => i.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          ListHeaderComponent={
            checkedItems.length > 0 && uncheckedItems.length > 0 ? (
              <View style={[styles.sectionDivider, { borderColor: colors.border }]}>
                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                <Text style={[styles.dividerLabel, { color: colors.muted }]}>
                  ✓ {checkedItems.length} completed
                </Text>
                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              </View>
            ) : null
          }
          ListFooterComponent={
            items.length > 0 ? (
              <TouchableOpacity
                style={[styles.clearAllBtn, { borderColor: colors.border }]}
                onPress={() => Alert.alert('Clear All', 'Remove all items from your shopping list?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Clear All', style: 'destructive', onPress: clearAll }
                ])}
              >
                <IconSymbol name="trash.fill" size={14} color={colors.muted} />
                <Text style={[styles.clearAllText, { color: colors.muted }]}>Clear All Items</Text>
              </TouchableOpacity>
            ) : null
          }
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 0.5,
  },
  headerTitle: { fontSize: 22, fontWeight: '800' },
  headerSubtitle: { fontSize: 13, marginTop: 1 },
  headerActions: { flexDirection: 'row', gap: 8 },
  headerBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
  },
  headerBtnText: { fontSize: 13, fontWeight: '700' },
  addRow: {
    padding: 14, borderBottomWidth: 0.5, gap: 10,
  },
  addInput: {
    fontSize: 16, paddingHorizontal: 12, paddingVertical: 10,
    borderRadius: 10, borderWidth: 1,
  },
  addCategoryRow: { flexDirection: 'row', gap: 8 },
  addCategoryBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 10, borderWidth: 1,
  },
  addCategoryEmoji: { fontSize: 18, marginBottom: 2 },
  addCategoryLabel: { fontSize: 10, fontWeight: '600' },
  addActions: { flexDirection: 'row', gap: 8 },
  addCancelBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 10, borderWidth: 1,
  },
  addCancelText: { fontSize: 14, fontWeight: '600' },
  addConfirmBtn: {
    flex: 2, alignItems: 'center', paddingVertical: 10, borderRadius: 10,
  },
  addConfirmText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  filterBar: { borderBottomWidth: 0.5 },
  filterList: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1,
  },
  filterEmoji: { fontSize: 14 },
  filterLabel: { fontSize: 13, fontWeight: '600' },
  listContent: { padding: 12, paddingBottom: 40 },
  itemRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 12, borderRadius: 14, borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  checkbox: {
    width: 24, height: 24, borderRadius: 12, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },
  itemEmoji: { fontSize: 22 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: '600' },
  itemMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  itemMetaText: { fontSize: 12, fontWeight: '600' },
  autoBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  autoBadgeText: { fontSize: 10, fontWeight: '700' },
  deleteBtn: { padding: 6 },
  sectionDivider: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginVertical: 8, borderTopWidth: 0,
  },
  dividerLine: { flex: 1, height: 1 },
  dividerLabel: { fontSize: 12, fontWeight: '600' },
  clearAllBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    marginTop: 16, paddingVertical: 12, borderRadius: 12, borderWidth: 1,
  },
  clearAllText: { fontSize: 13, fontWeight: '600' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { fontSize: 20, fontWeight: '800' },
  emptyText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  emptyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24, marginTop: 8,
  },
  emptyBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
