import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { MEAL_RECIPES } from '@/lib/food-data';

export default function MealDetailScreen() {
  const colors = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const recipe = MEAL_RECIPES.find(r => r.id === id);

  if (!recipe) {
    return (
      <ScreenContainer>
        <View style={styles.notFound}>
          <Text style={[styles.notFoundText, { color: colors.muted }]}>Recipe not found</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[styles.backLink, { color: colors.primary }]}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  const difficultyColor = recipe.difficulty === 'Easy'
    ? colors.success
    : recipe.difficulty === 'Medium'
    ? colors.warning
    : colors.error;

  return (
    <ScreenContainer containerClassName="bg-background">
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <IconSymbol name="chevron.left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]} numberOfLines={1}>
          {recipe.name}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: colors.surface }]}>
          <Text style={styles.heroEmoji}>{recipe.emoji}</Text>
          <Text style={[styles.heroTitle, { color: colors.foreground }]}>{recipe.name}</Text>
          <Text style={[styles.heroDesc, { color: colors.muted }]}>{recipe.description}</Text>

          {/* Meta row */}
          <View style={styles.metaRow}>
            <View style={[styles.metaBadge, { backgroundColor: colors.primary + '18' }]}>
              <IconSymbol name="clock.fill" size={14} color={colors.primary} />
              <Text style={[styles.metaBadgeText, { color: colors.primary }]}>{recipe.prepTime}</Text>
            </View>
            <View style={[styles.metaBadge, { backgroundColor: difficultyColor + '18' }]}>
              <IconSymbol name="star.fill" size={14} color={difficultyColor} />
              <Text style={[styles.metaBadgeText, { color: difficultyColor }]}>{recipe.difficulty}</Text>
            </View>
            <View style={[styles.metaBadge, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}>
              <IconSymbol name="fork.knife" size={14} color={colors.muted} />
              <Text style={[styles.metaBadgeText, { color: colors.muted }]}>{recipe.servings} servings</Text>
            </View>
          </View>

          {/* Tags */}
          <View style={styles.tagsRow}>
            {recipe.tags.map(tag => (
              <View key={tag} style={[styles.tag, { backgroundColor: colors.primary + '12', borderColor: colors.primary + '30' }]}>
                <Text style={[styles.tagText, { color: colors.primary }]}>#{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Ingredients */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Ingredients</Text>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {recipe.allIngredients.map((ingredient, i) => (
              <View key={i} style={[styles.ingredientRow, i < recipe.allIngredients.length - 1 && { borderBottomWidth: 0.5, borderBottomColor: colors.border }]}>
                <View style={[styles.bullet, { backgroundColor: colors.primary }]} />
                <Text style={[styles.ingredientText, { color: colors.foreground }]}>{ingredient}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Steps */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Instructions</Text>
          <View style={styles.stepsContainer}>
            {recipe.steps.map((step, i) => (
              <View key={i} style={[styles.stepRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                  <Text style={styles.stepNumberText}>{i + 1}</Text>
                </View>
                <Text style={[styles.stepText, { color: colors.foreground }]}>{step}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Pro Tip */}
        <View style={styles.section}>
          <View style={[styles.tipCard, { backgroundColor: colors.warning + '12', borderColor: colors.warning + '30' }]}>
            <View style={styles.tipHeader}>
              <Text style={styles.tipEmoji}>💡</Text>
              <Text style={[styles.tipTitle, { color: colors.warning }]}>Pro Tip</Text>
            </View>
            <Text style={[styles.tipText, { color: colors.foreground }]}>{recipe.tips}</Text>
          </View>
        </View>

        {/* Key Ingredients (what triggers this recipe) */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Best For Using Up</Text>
          <View style={styles.keyIngredients}>
            {recipe.keyIngredients.map(ing => (
              <View key={ing} style={[styles.keyIngBadge, { backgroundColor: colors.success + '15', borderColor: colors.success + '30' }]}>
                <Text style={[styles.keyIngText, { color: colors.success }]}>{ing}</Text>
              </View>
            ))}
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
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: '700', flex: 1, textAlign: 'center' },
  content: { paddingBottom: 24 },
  hero: {
    alignItems: 'center', padding: 24, gap: 8, marginBottom: 8,
  },
  heroEmoji: { fontSize: 64, marginBottom: 4 },
  heroTitle: { fontSize: 24, fontWeight: '800', textAlign: 'center' },
  heroDesc: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  metaRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 4 },
  metaBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
  },
  metaBadgeText: { fontSize: 13, fontWeight: '700' },
  tagsRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', justifyContent: 'center' },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  tagText: { fontSize: 12, fontWeight: '600' },
  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 10 },
  card: { borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  ingredientRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12,
  },
  bullet: { width: 6, height: 6, borderRadius: 3 },
  ingredientText: { fontSize: 14, flex: 1 },
  stepsContainer: { gap: 10 },
  stepRow: {
    flexDirection: 'row', gap: 12, padding: 14,
    borderRadius: 14, borderWidth: 1, alignItems: 'flex-start',
  },
  stepNumber: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  stepNumberText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  stepText: { fontSize: 14, lineHeight: 20, flex: 1 },
  tipCard: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 8 },
  tipHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tipEmoji: { fontSize: 18 },
  tipTitle: { fontSize: 15, fontWeight: '800' },
  tipText: { fontSize: 14, lineHeight: 20 },
  keyIngredients: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  keyIngBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  keyIngText: { fontSize: 13, fontWeight: '600' },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  notFoundText: { fontSize: 16 },
  backLink: { fontSize: 16, fontWeight: '700' },
});
