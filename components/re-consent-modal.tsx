import { Modal, View, Text, Pressable, ScrollView, Linking, StyleSheet, Platform } from "react-native";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/use-colors";
import { recordLegalConsent, CURRENT_POLICY_VERSION } from "@/lib/onboarding";

const PRIVACY_URL = "https://freshkeep-ctbgrbwn.manus.space/api/privacy-policy";
const TERMS_URL = "https://freshkeep-ctbgrbwn.manus.space/api/terms";

interface ReConsentModalProps {
  visible: boolean;
  onConsent: () => void;
}

/**
 * Shown when the policy version has been bumped since the user last consented.
 * The user must re-read and accept the updated terms before continuing.
 */
export function ReConsentModal({ visible, onConsent }: ReConsentModalProps) {
  const colors = useColors();

  async function handleAccept() {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    await recordLegalConsent();
    onConsent();
  }

  function openPrivacy() {
    Linking.openURL(PRIVACY_URL);
  }

  function openTerms() {
    Linking.openURL(TERMS_URL);
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={[styles.overlay, { backgroundColor: "rgba(0,0,0,0.6)" }]}>
        <View style={[styles.sheet, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.emoji]}>📋</Text>
            <Text style={[styles.title, { color: colors.foreground }]}>
              We've updated our policies
            </Text>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            <Text style={[styles.body_text, { color: colors.muted }]}>
              Our Terms of Service and Privacy Policy have been updated to version {CURRENT_POLICY_VERSION}.
              Please review the changes below and confirm your agreement to continue using YumKeeper.
            </Text>

            {/* What changed */}
            <View style={[styles.changeBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Text style={[styles.changeTitle, { color: colors.foreground }]}>What changed</Text>
              <Text style={[styles.changeItem, { color: colors.muted }]}>
                • Added GDPR Article 17 "Delete my data" request mechanism
              </Text>
              <Text style={[styles.changeItem, { color: colors.muted }]}>
                • Added admin consent status monitoring panel
              </Text>
              <Text style={[styles.changeItem, { color: colors.muted }]}>
                • Clarified data deletion timelines (30 days) in Section 12
              </Text>
            </View>

            {/* Links */}
            <View style={styles.links}>
              <Pressable
                style={({ pressed }) => [styles.linkBtn, { opacity: pressed ? 0.6 : 1 }]}
                onPress={openTerms}
              >
                <Text style={[styles.linkText, { color: colors.primary }]}>
                  Read Terms of Service →
                </Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.linkBtn, { opacity: pressed ? 0.6 : 1 }]}
                onPress={openPrivacy}
              >
                <Text style={[styles.linkText, { color: colors.primary }]}>
                  Read Privacy Policy →
                </Text>
              </Pressable>
            </View>
          </ScrollView>

          {/* Accept button */}
          <Pressable
            style={({ pressed }) => [
              styles.acceptBtn,
              { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
            ]}
            onPress={handleAccept}
          >
            <Text style={[styles.acceptText, { color: "#fff" }]}>
              I agree — Continue
            </Text>
          </Pressable>

          <Text style={[styles.footnote, { color: colors.muted }]}>
            By tapping "I agree", you confirm you have read and accept the updated Terms of Service and Privacy Policy.
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 40,
    maxHeight: "85%",
  },
  header: {
    alignItems: "center",
    marginBottom: 16,
  },
  emoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  body: {
    flexGrow: 0,
    maxHeight: 320,
  },
  body_text: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  changeBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  changeTitle: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  changeItem: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  links: {
    gap: 4,
    marginBottom: 8,
  },
  linkBtn: {
    paddingVertical: 6,
  },
  linkText: {
    fontSize: 15,
    fontWeight: "500",
  },
  acceptBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 12,
  },
  acceptText: {
    fontSize: 16,
    fontWeight: "700",
  },
  footnote: {
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
  },
});
