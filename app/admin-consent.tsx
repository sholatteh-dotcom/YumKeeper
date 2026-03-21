import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Pressable } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "expo-router";
import { useEffect } from "react";

/**
 * Admin-only screen showing consent status across all users for the current
 * policy version. Accessible from Settings when the logged-in user has the
 * "admin" role.
 */
export default function AdminConsentScreen() {
  const colors = useColors();
  const router = useRouter();
  const { user } = useAuth();

  // Redirect non-admins immediately
  useEffect(() => {
    if (user && user.role !== "admin") {
      router.back();
    }
  }, [user, router]);

  const { data, isLoading, error, refetch } = trpc.legal.adminConsentStatus.useQuery(undefined, {
    enabled: user?.role === "admin",
  });

  if (!user || user.role !== "admin") return null;

  return (
    <ScreenContainer className="p-4">
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}
          onPress={() => router.back()}
        >
          <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
        </Pressable>
        <Text style={[styles.title, { color: colors.foreground }]}>Consent Status</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>Admin panel — policy monitoring</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {isLoading && (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.muted }]}>Loading consent data…</Text>
          </View>
        )}

        {error && (
          <View style={[styles.errorBox, { backgroundColor: colors.error + "20", borderColor: colors.error }]}>
            <Text style={[styles.errorText, { color: colors.error }]}>
              Failed to load consent data. You may not have admin access.
            </Text>
            <Pressable
              style={({ pressed }) => [styles.retryBtn, { opacity: pressed ? 0.7 : 1 }]}
              onPress={() => refetch()}
            >
              <Text style={[styles.retryText, { color: colors.primary }]}>Retry</Text>
            </Pressable>
          </View>
        )}

        {data && (
          <>
            {/* Summary cards */}
            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.statValue, { color: colors.foreground }]}>{data.totalUsers}</Text>
                <Text style={[styles.statLabel, { color: colors.muted }]}>Total Users</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.success + "20", borderColor: colors.success }]}>
                <Text style={[styles.statValue, { color: colors.success }]}>{data.consentedCount}</Text>
                <Text style={[styles.statLabel, { color: colors.muted }]}>Consented</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.warning + "20", borderColor: colors.warning }]}>
                <Text style={[styles.statValue, { color: colors.warning }]}>{data.pendingCount}</Text>
                <Text style={[styles.statLabel, { color: colors.muted }]}>Pending</Text>
              </View>
            </View>

            {/* Current version badge */}
            <View style={[styles.versionBadge, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "40" }]}>
              <Text style={[styles.versionText, { color: colors.primary }]}>
                Current policy version: <Text style={{ fontWeight: "700" }}>v{data.currentVersion}</Text>
              </Text>
            </View>

            {/* Pending users list */}
            {data.pendingCount > 0 ? (
              <>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                  Users pending re-consent ({data.pendingCount})
                </Text>
                {data.pendingUsers.map((u) => (
                  <View
                    key={u.userId}
                    style={[styles.userRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  >
                    <View style={[styles.userAvatar, { backgroundColor: colors.warning + "30" }]}>
                      <Text style={[styles.userAvatarText, { color: colors.warning }]}>
                        {(u.name ?? u.email ?? "?")[0].toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.userInfo}>
                      <Text style={[styles.userName, { color: colors.foreground }]}>
                        {u.name ?? "Unknown"}
                      </Text>
                      <Text style={[styles.userEmail, { color: colors.muted }]}>
                        {u.email ?? `User #${u.userId}`}
                      </Text>
                      <Text style={[styles.userVersion, { color: colors.muted }]}>
                        Last consented: {u.lastConsentedVersion ? `v${u.lastConsentedVersion}` : "Never"}
                      </Text>
                    </View>
                    <View style={[styles.pendingBadge, { backgroundColor: colors.warning + "20" }]}>
                      <Text style={[styles.pendingBadgeText, { color: colors.warning }]}>Pending</Text>
                    </View>
                  </View>
                ))}
              </>
            ) : (
              <View style={[styles.allConsentedBox, { backgroundColor: colors.success + "15", borderColor: colors.success + "40" }]}>
                <Text style={styles.allConsentedEmoji}>✅</Text>
                <Text style={[styles.allConsentedText, { color: colors.success }]}>
                  All users have consented to v{data.currentVersion}
                </Text>
              </View>
            )}

            <View style={{ height: 40 }} />
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { paddingBottom: 16, paddingTop: 8 },
  backBtn: { marginBottom: 8 },
  backText: { fontSize: 15, fontWeight: "500" },
  title: { fontSize: 24, fontWeight: "800", marginBottom: 4 },
  subtitle: { fontSize: 13 },
  center: { alignItems: "center", paddingVertical: 40, gap: 12 },
  loadingText: { fontSize: 14 },
  errorBox: { borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 16, gap: 10 },
  errorText: { fontSize: 14, lineHeight: 20 },
  retryBtn: { alignSelf: "flex-start" },
  retryText: { fontSize: 14, fontWeight: "600" },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  statCard: {
    flex: 1, borderRadius: 14, borderWidth: 1,
    padding: 14, alignItems: "center",
  },
  statValue: { fontSize: 28, fontWeight: "800", marginBottom: 2 },
  statLabel: { fontSize: 11, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.4 },
  versionBadge: {
    borderRadius: 10, borderWidth: 1,
    paddingHorizontal: 14, paddingVertical: 10,
    marginBottom: 20,
  },
  versionText: { fontSize: 14 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 10 },
  userRow: {
    flexDirection: "row", alignItems: "center",
    borderRadius: 12, borderWidth: 1,
    padding: 12, marginBottom: 8, gap: 12,
  },
  userAvatar: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: "center", justifyContent: "center",
  },
  userAvatarText: { fontSize: 18, fontWeight: "700" },
  userInfo: { flex: 1 },
  userName: { fontSize: 15, fontWeight: "600", marginBottom: 2 },
  userEmail: { fontSize: 12, marginBottom: 2 },
  userVersion: { fontSize: 11 },
  pendingBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  pendingBadgeText: { fontSize: 11, fontWeight: "700" },
  allConsentedBox: {
    borderRadius: 14, borderWidth: 1,
    padding: 24, alignItems: "center", gap: 8, marginTop: 16,
  },
  allConsentedEmoji: { fontSize: 36 },
  allConsentedText: { fontSize: 16, fontWeight: "600", textAlign: "center" },
});
