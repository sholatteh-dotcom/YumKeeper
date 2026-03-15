import React, { useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { PRESERVATION_TIPS } from '@/lib/food-data';

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: '#2D8A4E',
  Medium: '#F4A228',
  Hard: '#E53E3E',
};

export default function TipDetailScreen() {
  const colors = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const tip = useMemo(() => PRESERVATION_TIPS.find(t => t.id === id), [id]);

  if (!tip) {
    return (
      <ScreenContainer>
        <View style={styles.notFound}>
          <Text style={[styles.notFoundText, { color: colors.muted }]}>Tip not found</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[styles.backLink, { color: colors.primary }]}>Go back</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  const diffColor = DIFFICULTY_COLORS[tip.difficulty] ?? colors.muted;

  return (
    <ScreenContainer containerClassName="bg-background">
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Technique Guide</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: colors.primary + '12' }]}>
          <Text style={styles.heroEmoji}>{tip.emoji}</Text>
          <Text style={[styles.heroTitle, { color: colors.foreground }]}>{tip.title}</Text>
          <Text style={[styles.heroDesc, { color: colors.muted }]}>{tip.description}</Text>
          <View style={styles.heroBadges}>
            <View style={[styles.badge, { backgroundColor: diffColor + '20' }]}>
              <Text style={[styles.badgeText, { color: diffColor }]}>📊 {tip.difficulty}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.badgeText, { color: colors.primary }]}>⏱ {tip.timeRequired}</Text>
            </View>
          </View>
        </View>

        {/* Best Foods */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>🥗 Best For</Text>
          <View style={styles.chipsRow}>
            {tip.bestFoods.map(food => (
              <View key={food} style={[styles.chip, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' }]}>
                <Text style={[styles.chipText, { color: colors.primary }]}>{food}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Equipment */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>🔧 Equipment Needed</Text>
          {tip.equipment.map((item, i) => (
            <View key={i} style={styles.equipRow}>
              <View style={[styles.equipBullet, { backgroundColor: colors.border }]}>
                <Text style={[styles.equipNum, { color: colors.muted }]}>{i + 1}</Text>
              </View>
              <Text style={[styles.equipText, { color: colors.foreground }]}>{item}</Text>
            </View>
          ))}
        </View>

        {/* Steps */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>📋 Step-by-Step Instructions</Text>
          {tip.steps.map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                <Text style={styles.stepNumberText}>{i + 1}</Text>
              </View>
              <Text style={[styles.stepText, { color: colors.foreground }]}>{step}</Text>
            </View>
          ))}
        </View>

        {/* Pro Tips */}
        <View style={[styles.proTipsSection, { backgroundColor: colors.warning + '12', borderColor: colors.warning + '30' }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>⭐ Pro Tips</Text>
          {tip.proTips.map((pt, i) => (
            <View key={i} style={styles.proTipRow}>
              <Text style={styles.proTipIcon}>💡</Text>
              <Text style={[styles.proTipText, { color: colors.foreground }]}>{pt}</Text>
            </View>
          ))}
        </View>

        {/* Related Techniques */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>🔗 More Techniques</Text>
          {PRESERVATION_TIPS.filter(t => t.id !== tip.id).slice(0, 3).map(related => (
            <TouchableOpacity
              key={related.id}
              style={[styles.relatedRow, { borderBottomColor: colors.border }]}
              onPress={() => router.replace({ pathname: '/tip-detail' as any, params: { id: related.id } })}
              activeOpacity={0.7}
            >
              <Text style={styles.relatedEmoji}>{related.emoji}</Text>
              <View style={styles.relatedInfo}>
                <Text style={[styles.relatedTitle, { color: colors.foreground }]}>{related.title}</Text>
                <Text style={[styles.relatedMeta, { color: colors.muted }]}>{related.difficulty} · {related.timeRequired}</Text>
              </View>
              <IconSymbol name="chevron.right" size={18} color={colors.muted} />
            </TouchableOpacity>
          ))}
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
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  hero: { alignItems: 'center', paddingVertical: 28, paddingHorizontal: 20 },
  heroEmoji: { fontSize: 56, marginBottom: 10 },
  heroTitle: { fontSize: 24, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  heroDesc: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 14 },
  heroBadges: { flexDirection: 'row', gap: 10 },
  badge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  badgeText: { fontSize: 13, fontWeight: '700' },
  section: {
    marginHorizontal: 16, marginTop: 10, borderRadius: 16, padding: 16, borderWidth: 1,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 13, fontWeight: '600' },
  equipRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  equipBullet: {
    width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
  },
  equipNum: { fontSize: 11, fontWeight: '700' },
  equipText: { flex: 1, fontSize: 14, lineHeight: 20 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  stepNumber: {
    width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
  },
  stepNumberText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  stepText: { flex: 1, fontSize: 14, lineHeight: 21 },
  proTipsSection: {
    marginHorizontal: 16, marginTop: 10, borderRadius: 16, padding: 16, borderWidth: 1,
  },
  proTipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  proTipIcon: { fontSize: 18, marginTop: 1 },
  proTipText: { flex: 1, fontSize: 14, lineHeight: 20 },
  relatedRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 10, borderBottomWidth: 0.5,
  },
  relatedEmoji: { fontSize: 24 },
  relatedInfo: { flex: 1 },
  relatedTitle: { fontSize: 15, fontWeight: '600' },
  relatedMeta: { fontSize: 12, marginTop: 1 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  notFoundText: { fontSize: 16 },
  backLink: { fontSize: 16, fontWeight: '600' },
});
