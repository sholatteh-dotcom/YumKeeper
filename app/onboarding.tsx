import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewToken,
  KeyboardAvoidingView,
} from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import * as WebBrowser from "expo-web-browser";
import { markOnboardingComplete, recordLegalConsent, saveUserName } from "@/lib/onboarding";
import { useColors } from "@/hooks/use-colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const LEGAL_BASE_URL = "https://freshkeep-ctbgrbwn.manus.space/api";

async function openLegalPage(path: string): Promise<void> {
  const url = `${LEGAL_BASE_URL}${path}`;
  if (Platform.OS === "web") {
    await Linking.openURL(url);
  } else {
    await WebBrowser.openBrowserAsync(url, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
      toolbarColor: "#2D8A4E",
      controlsColor: "#FFFFFF",
    });
  }
}

// ─── Slide data ───────────────────────────────────────────────────────────────
const SLIDES = [
  {
    id: "welcome",
    emoji: "🫙",
    title: "Welcome to YumKeeper",
    subtitle: "Your kitchen's best friend — fresher food,\nhappier meals, and a little more money in your pocket.",
    bullets: [
      { icon: "📦", text: "Track everything in your fridge, freezer & pantry" },
      { icon: "⏰", text: "Get alerts before food expires" },
      { icon: "💡", text: "Discover preservation tips from the pros" },
    ],
  },
  {
    id: "features",
    emoji: "✨",
    title: "Everything You Need",
    subtitle: "Powerful tools that make food management effortless.",
    bullets: [
      { icon: "📷", text: "Scan barcodes to add items in seconds" },
      { icon: "🛒", text: "Auto-generate shopping lists when you run low" },
      { icon: "🍳", text: "Get recipe ideas for items about to expire" },
    ],
  },
  {
    id: "trial",
    emoji: "🎉",
    title: "Start Free — Upgrade Anytime",
    subtitle: "Try YumKeeper Fresh free for 7 days.\nNo credit card required to get started.",
    bullets: [
      { icon: "✅", text: "Free plan: track up to 10 items, 3 tips" },
      { icon: "🚀", text: "Fresh plan: unlimited items, barcode & shopping list" },
      { icon: "👨‍👩‍👧", text: "Family plan: share with up to 6 members" },
    ],
  },
] as const;

type Slide = (typeof SLIDES)[number];

// ─── Individual slide ─────────────────────────────────────────────────────────
function OnboardingSlide({ slide, colors }: { slide: Slide; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
      <View style={styles.emojiContainer}>
        <Text style={styles.emoji}>{slide.emoji}</Text>
      </View>

      <Text style={[styles.title, { color: colors.foreground }]}>{slide.title}</Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>{slide.subtitle}</Text>

      <View style={styles.bulletsContainer}>
        {slide.bullets.map((bullet, index) => (
          <View key={index} style={[styles.bulletRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={styles.bulletIcon}>{bullet.icon}</Text>
            <Text style={[styles.bulletText, { color: colors.foreground }]}>{bullet.text}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Name input (shown on last slide) ────────────────────────────────────────
function NameInput({
  value,
  onChange,
  colors,
}: {
  value: string;
  onChange: (v: string) => void;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={[styles.nameInputWrapper, { borderColor: value.trim() ? colors.primary : colors.border, backgroundColor: colors.surface }]}>
      <Text style={styles.nameInputEmoji}>👋</Text>
      <TextInput
        style={[styles.nameInput, { color: colors.foreground }]}
        placeholder="What's your first name? (optional)"
        placeholderTextColor={colors.muted}
        value={value}
        onChangeText={onChange}
        autoCapitalize="words"
        autoCorrect={false}
        returnKeyType="done"
        maxLength={30}
        accessibilityLabel="Enter your first name"
      />
    </View>
  );
}

// ─── Consent checkbox ─────────────────────────────────────────────────────────
function ConsentCheckbox({
  checked,
  onToggle,
  colors,
}: {
  checked: boolean;
  onToggle: () => void;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <Pressable
      onPress={onToggle}
      style={[
        styles.consentRow,
        { borderColor: checked ? colors.primary : colors.border, backgroundColor: colors.surface },
      ]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel="I agree to the Terms of Service and Privacy Policy"
    >
      {/* Checkbox box */}
      <View
        style={[
          styles.checkbox,
          {
            borderColor: checked ? colors.primary : colors.border,
            backgroundColor: checked ? colors.primary : "transparent",
          },
        ]}
      >
        {checked && <Text style={styles.checkmark}>✓</Text>}
      </View>

      {/* Label with tappable links */}
      <Text style={[styles.consentText, { color: colors.foreground }]}>
        {"I agree to the "}
        <Text
          style={[styles.consentLink, { color: colors.primary }]}
          onPress={() => openLegalPage("/terms")}
        >
          Terms of Service
        </Text>
        {" and "}
        <Text
          style={[styles.consentLink, { color: colors.primary }]}
          onPress={() => openLegalPage("/privacy-policy")}
        >
          Privacy Policy
        </Text>
      </Text>
    </Pressable>
  );
}

// ─── Dot indicator ────────────────────────────────────────────────────────────
function DotIndicator({ total, current, colors }: { total: number; current: number; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={styles.dotsRow}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            {
              backgroundColor: i === current ? colors.primary : colors.border,
              width: i === current ? 20 : 8,
            },
          ]}
        />
      ))}
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function OnboardingScreen() {
  const colors = useColors();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [consentChecked, setConsentChecked] = useState(false);
  const [userName, setUserName] = useState("");
  const flatListRef = useRef<FlatList<Slide>>(null);

  const isLast = currentIndex === SLIDES.length - 1;

  const handleViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const goNext = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (isLast) {
      handleFinish();
    } else {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    }
  };

  const handleFinish = async () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    // Save name if provided
    if (userName.trim()) {
      await saveUserName(userName.trim());
    }
    // Record consent timestamp before completing onboarding
    await recordLegalConsent();
    await markOnboardingComplete();
    router.replace("/(tabs)");
  };

  const handleSkip = async () => {
    // Save name even when skipping (if entered)
    if (userName.trim()) {
      await saveUserName(userName.trim());
    }
    await markOnboardingComplete();
    router.replace("/(tabs)");
  };

  const handleToggleConsent = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setConsentChecked((prev) => !prev);
  };

  // CTA is disabled on last slide until consent is checked
  const ctaDisabled = isLast && !consentChecked;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Skip button */}
      {!isLast && (
        <Pressable
          onPress={handleSkip}
          style={({ pressed }) => [styles.skipButton, pressed && { opacity: 0.6 }]}
        >
          <Text style={[styles.skipText, { color: colors.muted }]}>Skip</Text>
        </Pressable>
      )}

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES as unknown as Slide[]}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <OnboardingSlide slide={item} colors={colors} />}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        scrollEventThrottle={16}
        style={styles.flatList}
        contentContainerStyle={styles.flatListContent}
      />

      {/* Bottom controls */}
      <View style={styles.bottomArea}>
        <DotIndicator total={SLIDES.length} current={currentIndex} colors={colors} />

        {/* Name input — only visible on last slide */}
        {isLast && (
          <NameInput value={userName} onChange={setUserName} colors={colors} />
        )}

        {/* Consent checkbox — only visible on last slide */}
        {isLast && (
          <ConsentCheckbox
            checked={consentChecked}
            onToggle={handleToggleConsent}
            colors={colors}
          />
        )}

        <Pressable
          onPress={ctaDisabled ? undefined : goNext}
          style={({ pressed }) => [
            styles.ctaButton,
            {
              backgroundColor: ctaDisabled
                ? colors.border
                : colors.primary,
            },
            !ctaDisabled && pressed && { transform: [{ scale: 0.97 }], opacity: 0.9 },
          ]}
          accessibilityState={{ disabled: ctaDisabled }}
        >
          <Text style={[styles.ctaText, ctaDisabled && { color: colors.muted }]}>
            {isLast ? "Start Free Trial" : "Next"}
          </Text>
        </Pressable>

        {isLast && (
          <Pressable
            onPress={handleSkip}
            style={({ pressed }) => [styles.secondaryButton, pressed && { opacity: 0.6 }]}
          >
            <Text style={[styles.secondaryText, { color: colors.muted }]}>
              Maybe later — use free plan
            </Text>
          </Pressable>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    position: "absolute",
    top: 56,
    right: 24,
    zIndex: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  skipText: {
    fontSize: 15,
    fontWeight: "500",
  },
  flatList: {
    flex: 1,
  },
  flatListContent: {
    // No extra padding — each slide is exactly SCREEN_WIDTH
  },
  slide: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 80,
    paddingBottom: 24,
    alignItems: "center",
  },
  emojiContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(45, 138, 78, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  emoji: {
    fontSize: 48,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  bulletsContainer: {
    width: "100%",
    gap: 10,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 14,
  },
  bulletIcon: {
    fontSize: 22,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },
  // ─── Name input ───
  nameInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    gap: 10,
  },
  nameInputEmoji: {
    fontSize: 20,
  },
  nameInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    paddingVertical: 0,
  },
  // ─── Consent ───
  consentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    width: "100%",
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
    flexShrink: 0,
  },
  checkmark: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 16,
  },
  consentText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
  },
  consentLink: {
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  // ─── Dots ───
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginBottom: 20,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  // ─── Bottom ───
  bottomArea: {
    paddingHorizontal: 28,
    paddingBottom: 48,
    paddingTop: 8,
    alignItems: "center",
  },
  ctaButton: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  ctaText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  secondaryButton: {
    paddingVertical: 8,
  },
  secondaryText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
