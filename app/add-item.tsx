import React, { useState, useMemo, useEffect } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Platform, Alert, FlatList
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { useFoodContext } from '@/lib/food-context';
import { useSubscription } from '@/lib/subscription-context';
import {
  FoodItem, StorageLocation, STORAGE_LOCATIONS, UNITS, FOOD_SUGGESTIONS, getFoodEmoji
} from '@/lib/food-data';
import { maybeRequestReview } from '@/lib/review-trigger';

function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function today(): string {
  return new Date().toISOString().split('T')[0];
}

export default function AddItemScreen() {
  const colors = useColors();
  const router = useRouter();
  const { addItem } = useFoodContext();
  const params = useLocalSearchParams<{
    prefillName?: string;
    prefillCategory?: string;
    prefillDays?: string;
    prefillEmoji?: string;
    prefillBarcode?: string;
  }>();

  const { items } = useFoodContext();
  const subscription = useSubscription();

  const [name, setName] = useState(params.prefillName ?? '');
  const [category, setCategory] = useState<StorageLocation>(
    (params.prefillCategory as StorageLocation) ?? 'fridge'
  );
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('pcs');
  const [purchaseDate, setPurchaseDate] = useState(today());
  const [expiryDate, setExpiryDate] = useState(
    params.prefillDays ? addDays(parseInt(params.prefillDays)) : addDays(7)
  );
  const [notes, setNotes] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [barcodeScanned, setBarcodeScanned] = useState(!!params.prefillName);

  // If prefilled from barcode, show a banner
  useEffect(() => {
    if (params.prefillName) {
      setBarcodeScanned(true);
    }
  }, [params.prefillName]);

  const suggestions = useMemo(() => {
    if (!name.trim() || name.length < 1) return [];
    return FOOD_SUGGESTIONS.filter(f =>
      f.name.toLowerCase().includes(name.toLowerCase())
    ).slice(0, 5);
  }, [name]);

  const handleSelectSuggestion = (s: typeof FOOD_SUGGESTIONS[0]) => {
    setName(s.name);
    setCategory(s.category);
    setExpiryDate(addDays(s.defaultDays));
    setShowSuggestions(false);
  };

  const handleSave = async () => {
    // Check item limit for free tier
    if (!subscription.canAddItems(items.length)) {
      Alert.alert(
        '10-Item Limit Reached',
        'Free accounts can track up to 10 items. Upgrade to Fresh for unlimited items.',
        [
          { text: 'Not Now', style: 'cancel' },
          { text: 'Upgrade', onPress: () => router.push('/pricing' as any) },
        ]
      );
      return;
    }
    if (!name.trim()) {
      Alert.alert('Missing Name', 'Please enter a food item name.');
      return;
    }
    if (!expiryDate) {
      Alert.alert('Missing Date', 'Please set an expiry date.');
      return;
    }

    const newItem: FoodItem = {
      id: Date.now().toString(),
      name: name.trim(),
      category,
      quantity: parseFloat(quantity) || 1,
      unit,
      purchaseDate,
      expiryDate,
      notes: notes.trim() || undefined,
      emoji: params.prefillEmoji ?? getFoodEmoji(name.trim()),
      createdAt: new Date().toISOString(),
    };

    await addItem(newItem);
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Trigger in-app review prompt at the 5-item milestone (once only)
    maybeRequestReview();
    router.back();
  };

  return (
    <ScreenContainer containerClassName="bg-background" edges={['top', 'left', 'right', 'bottom']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <IconSymbol name="xmark" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Add Food Item</Text>
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: colors.primary }]}
          onPress={handleSave}
        >
          <Text style={styles.saveBtnText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Barcode success banner */}
        {barcodeScanned && (
          <View style={[styles.barcodeBanner, { backgroundColor: colors.success + '18', borderColor: colors.success + '40' }]}>
            <Text style={styles.barcodeBannerEmoji}>✅</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.barcodeBannerTitle, { color: colors.success }]}>Barcode Scanned!</Text>
              <Text style={[styles.barcodeBannerText, { color: colors.muted }]}>
                Details auto-filled. Review and adjust as needed.
              </Text>
            </View>
            <TouchableOpacity onPress={() => setBarcodeScanned(false)}>
              <IconSymbol name="xmark" size={16} color={colors.muted} />
            </TouchableOpacity>
          </View>
        )}

        {/* Food Name */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.muted }]}>FOOD NAME</Text>
          <View style={styles.nameRow}>
            <View style={[styles.inputContainer, { flex: 1, backgroundColor: colors.surface, borderColor: colors.border }]}>
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                placeholder="e.g. Apples, Chicken Breast..."
                placeholderTextColor={colors.muted}
                value={name}
                onChangeText={v => { setName(v); setShowSuggestions(true); setBarcodeScanned(false); }}
                onFocus={() => setShowSuggestions(true)}
                returnKeyType="next"
              />
            </View>
            {/* Barcode scan button */}
            <TouchableOpacity
              style={[styles.scanBtn, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '40' }]}
              onPress={() => {
                if (!subscription.canUseBarcodeScanner) {
                  router.push({ pathname: '/paywall', params: { feature: 'barcode' } } as any);
                } else {
                  router.push('/barcode-scanner' as any);
                }
              }}
            >
              <IconSymbol name="camera.fill" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
          {showSuggestions && suggestions.length > 0 && (
            <View style={[styles.suggestionsBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {suggestions.map(s => (
                <TouchableOpacity
                  key={s.name}
                  style={[styles.suggestionItem, { borderBottomColor: colors.border }]}
                  onPress={() => handleSelectSuggestion(s)}
                >
                  <Text style={styles.suggestionEmoji}>{s.emoji}</Text>
                  <View>
                    <Text style={[styles.suggestionName, { color: colors.foreground }]}>{s.name}</Text>
                    <Text style={[styles.suggestionMeta, { color: colors.muted }]}>
                      {STORAGE_LOCATIONS.find(l => l.key === s.category)?.label} · {s.defaultDays} days shelf life
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Storage Location */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.muted }]}>STORAGE LOCATION</Text>
          <View style={styles.locationRow}>
            {STORAGE_LOCATIONS.map(loc => (
              <TouchableOpacity
                key={loc.key}
                style={[
                  styles.locationBtn,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  category === loc.key && { backgroundColor: loc.color + '20', borderColor: loc.color }
                ]}
                onPress={() => setCategory(loc.key)}
              >
                <Text style={styles.locationBtnEmoji}>{loc.emoji}</Text>
                <Text style={[
                  styles.locationBtnLabel,
                  { color: colors.muted },
                  category === loc.key && { color: loc.color, fontWeight: '700' }
                ]}>
                  {loc.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quantity & Unit */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.muted }]}>QUANTITY</Text>
          <View style={styles.quantityRow}>
            <View style={[styles.inputContainer, { flex: 1, backgroundColor: colors.surface, borderColor: colors.border }]}>
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                placeholder="1"
                placeholderTextColor={colors.muted}
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="decimal-pad"
                returnKeyType="done"
              />
            </View>
            <TouchableOpacity
              style={[styles.unitBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => setShowUnitPicker(!showUnitPicker)}
            >
              <Text style={[styles.unitBtnText, { color: colors.foreground }]}>{unit}</Text>
              <IconSymbol name="chevron.down" size={16} color={colors.muted} />
            </TouchableOpacity>
          </View>
          {showUnitPicker && (
            <View style={[styles.unitPickerBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <FlatList
                data={UNITS}
                numColumns={4}
                keyExtractor={u => u}
                scrollEnabled={false}
                renderItem={({ item: u }) => (
                  <TouchableOpacity
                    style={[
                      styles.unitOption,
                      { borderColor: colors.border },
                      unit === u && { backgroundColor: colors.primary + '20', borderColor: colors.primary }
                    ]}
                    onPress={() => { setUnit(u); setShowUnitPicker(false); }}
                  >
                    <Text style={[styles.unitOptionText, { color: unit === u ? colors.primary : colors.foreground }]}>
                      {u}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
        </View>

        {/* Purchase Date */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.muted }]}>PURCHASE DATE</Text>
          <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <IconSymbol name="calendar" size={18} color={colors.muted} />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.muted}
              value={purchaseDate}
              onChangeText={setPurchaseDate}
              returnKeyType="next"
            />
          </View>
        </View>

        {/* Expiry Date */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.muted }]}>EXPIRY DATE</Text>
          <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <IconSymbol name="clock.fill" size={18} color={colors.warning} />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.muted}
              value={expiryDate}
              onChangeText={setExpiryDate}
              returnKeyType="next"
            />
          </View>
          {/* Quick date shortcuts */}
          <View style={styles.quickDates}>
            {[
              { label: '3 days', days: 3 },
              { label: '1 week', days: 7 },
              { label: '2 weeks', days: 14 },
              { label: '1 month', days: 30 },
              { label: '3 months', days: 90 },
              { label: '1 year', days: 365 },
            ].map(q => (
              <TouchableOpacity
                key={q.days}
                style={[styles.quickDateBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => setExpiryDate(addDays(q.days))}
              >
                <Text style={[styles.quickDateText, { color: colors.primary }]}>{q.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notes */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.muted }]}>NOTES (OPTIONAL)</Text>
          <View style={[styles.inputContainer, styles.notesContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TextInput
              style={[styles.input, styles.notesInput, { color: colors.foreground }]}
              placeholder="Add notes about this item..."
              placeholderTextColor={colors.muted}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              returnKeyType="done"
            />
          </View>
        </View>

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
  closeBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  saveBtn: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20 },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  content: { padding: 16 },
  barcodeBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 16,
  },
  barcodeBannerEmoji: { fontSize: 20 },
  barcodeBannerTitle: { fontSize: 13, fontWeight: '700' },
  barcodeBannerText: { fontSize: 12, marginTop: 1 },
  fieldGroup: { marginBottom: 20 },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: 8 },
  nameRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  scanBtn: {
    width: 48, height: 48, borderRadius: 12, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 12,
  },
  input: { flex: 1, fontSize: 15, padding: 0 },
  suggestionsBox: {
    borderRadius: 12, borderWidth: 1, marginTop: 4, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 6, elevation: 4,
  },
  suggestionItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 12, borderBottomWidth: 0.5,
  },
  suggestionEmoji: { fontSize: 24 },
  suggestionName: { fontSize: 15, fontWeight: '600' },
  suggestionMeta: { fontSize: 12, marginTop: 1 },
  locationRow: { flexDirection: 'row', gap: 8 },
  locationBtn: {
    flex: 1, alignItems: 'center', padding: 10, borderRadius: 12, borderWidth: 1.5,
  },
  locationBtnEmoji: { fontSize: 22, marginBottom: 4 },
  locationBtnLabel: { fontSize: 11, fontWeight: '600' },
  quantityRow: { flexDirection: 'row', gap: 10 },
  unitBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12, borderWidth: 1,
    minWidth: 90,
  },
  unitBtnText: { fontSize: 15, fontWeight: '600', flex: 1 },
  unitPickerBox: {
    borderRadius: 12, borderWidth: 1, marginTop: 8, padding: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6, elevation: 3,
  },
  unitOption: {
    flex: 1, margin: 3, paddingVertical: 7, alignItems: 'center',
    borderRadius: 8, borderWidth: 1,
  },
  unitOptionText: { fontSize: 13, fontWeight: '600' },
  quickDates: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  quickDateBtn: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1,
  },
  quickDateText: { fontSize: 12, fontWeight: '600' },
  notesContainer: { alignItems: 'flex-start', paddingVertical: 10 },
  notesInput: { minHeight: 70, textAlignVertical: 'top' },
});
