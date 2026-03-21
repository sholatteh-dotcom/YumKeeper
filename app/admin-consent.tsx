import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Pressable, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

type Tab = "consent" | "deletions";

const STATUS_COLORS: Record<string, string> = {
  pending: "#F59E0B",
  processing: "#3B82F6",
  completed: "#22C55E",
  cancelled: "#9CA3AF",
};

/**
 * Admin-only screen with two tabs:
 * 1. Consent Status — policy consent monitoring across all users
 * 2. Deletion Queue — GDPR erasure requests with workflow actions
 */
export default function AdminConsentScreen() {
  const colors = useColors();
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("consent");

  // Redirect non-admins immediately
  useEffect(() => {
    if (user && user.role !== "admin") {
      router.back();
    }
  }, [user, router]);

  const consentQuery = trpc.legal.adminConsentStatus.useQuery(undefined, {
    enabled: user?.role === "admin",
  });

  const deletionQueue = trpc.legal.adminDeletionQueue.useQuery(undefined, {
    enabled: user?.role === "admin" && activeTab === "deletions",
  });

  const updateStatusMutation = trpc.legal.adminUpdateDeletionStatus.useMutation({
    onSuccess: () => deletionQueue.refetch(),
  });

  const runPurgeMutation = trpc.legal.adminRunPurge.useMutation({
    onSuccess: (data) => {
      Alert.alert(
        "Purge Complete",
        data.purgedCount > 0
          ? `Processed ${data.purgedCount} expired deletion request(s). User data has been erased.`
          : "No expired requests found (all requests are less than 30 days old).",
        [{ text: "OK" }]
      );
      deletionQueue.refetch();
    },
  });

  const handleUpdateStatus = (requestId: number, status: "processing" | "completed" | "cancelled") => {
    const labels: Record<string, string> = {
      processing: "Mark as Processing",
      completed: "Mark as Completed",
      cancelled: "Cancel Request",
    };
    Alert.alert(
      labels[status],
      status === "completed"
        ? `This will mark request #${requestId} as completed and notify the owner. The user's data should already be erased.`
        : `Update request #${requestId} status to "${status}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          style: status === "cancelled" ? "destructive" : "default",
          onPress: () => updateStatusMutation.mutate({ requestId, status }),
        },
      ]
    );
  };

  const handleRunPurge = () => {
    Alert.alert(
      "Run Automated Purge",
      "This will permanently delete server-side data (consent records, subscriptions) for all users with deletion requests older than 30 days. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Run Purge",
          style: "destructive",
          onPress: () => runPurgeMutation.mutate(),
        },
      ]
    );
  };

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
        <Text style={[styles.title, { color: colors.foreground }]}>Admin Panel</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>Legal compliance monitoring</Text>
      </View>

      {/* Tab bar */}
      <View style={[styles.tabBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {(["consent", "deletions"] as Tab[]).map((tab) => (
          <Pressable
            key={tab}
            style={({ pressed }) => [
              styles.tabBtn,
              activeTab === tab && { backgroundColor: colors.primary },
              { opacity: pressed ? 0.8 : 1 },
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabLabel,
                { color: activeTab === tab ? "#fff" : colors.muted },
              ]}
            >
              {tab === "consent" ? "🛡️ Consent" : "🗑️ Deletions"}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Consent Tab ── */}
        {activeTab === "consent" && (
          <>
            {consentQuery.isLoading && (
              <View style={styles.center}>
                <ActivityIndicator color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.muted }]}>Loading consent data…</Text>
              </View>
            )}
            {consentQuery.error && (
              <View style={[styles.errorBox, { backgroundColor: colors.error + "20", borderColor: colors.error }]}>
                <Text style={[styles.errorText, { color: colors.error }]}>
                  Failed to load consent data. You may not have admin access.
                </Text>
                <Pressable style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })} onPress={() => consentQuery.refetch()}>
                  <Text style={[styles.retryText, { color: colors.primary }]}>Retry</Text>
                </Pressable>
              </View>
            )}
            {consentQuery.data && (
              <>
                <View style={styles.statsRow}>
                  <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={[styles.statValue, { color: colors.foreground }]}>{consentQuery.data.totalUsers}</Text>
                    <Text style={[styles.statLabel, { color: colors.muted }]}>Total</Text>
                  </View>
                  <View style={[styles.statCard, { backgroundColor: colors.success + "20", borderColor: colors.success }]}>
                    <Text style={[styles.statValue, { color: colors.success }]}>{consentQuery.data.consentedCount}</Text>
                    <Text style={[styles.statLabel, { color: colors.muted }]}>Consented</Text>
                  </View>
                  <View style={[styles.statCard, { backgroundColor: colors.warning + "20", borderColor: colors.warning }]}>
                    <Text style={[styles.statValue, { color: colors.warning }]}>{consentQuery.data.pendingCount}</Text>
                    <Text style={[styles.statLabel, { color: colors.muted }]}>Pending</Text>
                  </View>
                </View>
                <View style={[styles.versionBadge, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "40" }]}>
                  <Text style={[styles.versionText, { color: colors.primary }]}>
                    Current policy version: <Text style={{ fontWeight: "700" }}>v{consentQuery.data.currentVersion}</Text>
                  </Text>
                </View>
                {consentQuery.data.pendingCount > 0 ? (
                  <>
                    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                      Users pending re-consent ({consentQuery.data.pendingCount})
                    </Text>
                    {consentQuery.data.pendingUsers.map((u) => (
                      <View key={u.userId} style={[styles.userRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <View style={[styles.userAvatar, { backgroundColor: colors.warning + "30" }]}>
                          <Text style={[styles.userAvatarText, { color: colors.warning }]}>
                            {(u.name ?? u.email ?? "?")[0].toUpperCase()}
                          </Text>
                        </View>
                        <View style={styles.userInfo}>
                          <Text style={[styles.userName, { color: colors.foreground }]}>{u.name ?? "Unknown"}</Text>
                          <Text style={[styles.userEmail, { color: colors.muted }]}>{u.email ?? `User #${u.userId}`}</Text>
                          <Text style={[styles.userVersion, { color: colors.muted }]}>
                            Last consented: {u.lastConsentedVersion ? `v${u.lastConsentedVersion}` : "Never"}
                          </Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: colors.warning + "20" }]}>
                          <Text style={[styles.statusBadgeText, { color: colors.warning }]}>Pending</Text>
                        </View>
                      </View>
                    ))}
                  </>
                ) : (
                  <View style={[styles.allConsentedBox, { backgroundColor: colors.success + "15", borderColor: colors.success + "40" }]}>
                    <Text style={styles.allConsentedEmoji}>✅</Text>
                    <Text style={[styles.allConsentedText, { color: colors.success }]}>
                      All users have consented to v{consentQuery.data.currentVersion}
                    </Text>
                  </View>
                )}
              </>
            )}
          </>
        )}

        {/* ── Deletion Queue Tab ── */}
        {activeTab === "deletions" && (
          <>
            {/* Run Purge button */}
            <Pressable
              style={({ pressed }) => [
                styles.purgeBtn,
                { backgroundColor: colors.error, opacity: pressed ? 0.8 : 1 },
                runPurgeMutation.isPending && { opacity: 0.5 },
              ]}
              onPress={handleRunPurge}
              disabled={runPurgeMutation.isPending}
            >
              {runPurgeMutation.isPending ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.purgeBtnText}>🗑️ Run 30-Day Purge Job</Text>
              )}
            </Pressable>

            {deletionQueue.isLoading && (
              <View style={styles.center}>
                <ActivityIndicator color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.muted }]}>Loading deletion queue…</Text>
              </View>
            )}

            {deletionQueue.data?.requests.length === 0 && (
              <View style={[styles.allConsentedBox, { backgroundColor: colors.success + "15", borderColor: colors.success + "40" }]}>
                <Text style={styles.allConsentedEmoji}>✅</Text>
                <Text style={[styles.allConsentedText, { color: colors.success }]}>No deletion requests</Text>
              </View>
            )}

            {deletionQueue.data?.requests.map((req) => {
              const statusColor = STATUS_COLORS[req.status] ?? colors.muted;
              const requestedDate = new Date(req.requestedAt).toLocaleDateString();
              const daysSince = Math.floor((Date.now() - new Date(req.requestedAt).getTime()) / (1000 * 60 * 60 * 24));
              const isOverdue = daysSince > 30 && (req.status === "pending" || req.status === "processing");

              return (
                <View key={req.id} style={[styles.deletionCard, { backgroundColor: colors.surface, borderColor: isOverdue ? colors.error : colors.border }]}>
                  <View style={styles.deletionCardHeader}>
                    <View style={styles.userInfo}>
                      <Text style={[styles.userName, { color: colors.foreground }]}>
                        {req.userName ?? req.userEmail ?? `User #${req.userId}`}
                      </Text>
                      <Text style={[styles.userEmail, { color: colors.muted }]}>
                        {req.userEmail ?? `ID: ${req.userId}`}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor + "20" }]}>
                      <Text style={[styles.statusBadgeText, { color: statusColor }]}>
                        {req.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.deletionMeta}>
                    <Text style={[styles.metaText, { color: colors.muted }]}>
                      Requested: {requestedDate} · {daysSince}d ago
                    </Text>
                    {isOverdue && (
                      <Text style={[styles.overdueText, { color: colors.error }]}>⚠️ Overdue — must complete within 30 days</Text>
                    )}
                    {req.notes && (
                      <Text style={[styles.metaText, { color: colors.muted }]}>Note: {req.notes}</Text>
                    )}
                  </View>

                  {/* Action buttons */}
                  {(req.status === "pending" || req.status === "processing") && (
                    <View style={styles.actionRow}>
                      {req.status === "pending" && (
                        <Pressable
                          style={({ pressed }) => [styles.actionBtn, { backgroundColor: "#3B82F620", borderColor: "#3B82F6", opacity: pressed ? 0.7 : 1 }]}
                          onPress={() => handleUpdateStatus(req.id, "processing")}
                        >
                          <Text style={[styles.actionBtnText, { color: "#3B82F6" }]}>Mark Processing</Text>
                        </Pressable>
                      )}
                      <Pressable
                        style={({ pressed }) => [styles.actionBtn, { backgroundColor: colors.success + "20", borderColor: colors.success, opacity: pressed ? 0.7 : 1 }]}
                        onPress={() => handleUpdateStatus(req.id, "completed")}
                      >
                        <Text style={[styles.actionBtnText, { color: colors.success }]}>Mark Completed</Text>
                      </Pressable>
                      <Pressable
                        style={({ pressed }) => [styles.actionBtn, { backgroundColor: colors.error + "15", borderColor: colors.error, opacity: pressed ? 0.7 : 1 }]}
                        onPress={() => handleUpdateStatus(req.id, "cancelled")}
                      >
                        <Text style={[styles.actionBtnText, { color: colors.error }]}>Cancel</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              );
            })}

            <View style={{ height: 40 }} />
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { paddingBottom: 12, paddingTop: 8 },
  backBtn: { marginBottom: 8 },
  backText: { fontSize: 15, fontWeight: "500" },
  title: { fontSize: 24, fontWeight: "800", marginBottom: 4 },
  subtitle: { fontSize: 13 },
  tabBar: {
    flexDirection: "row", borderRadius: 12, borderWidth: 1,
    padding: 4, marginBottom: 16, gap: 4,
  },
  tabBtn: {
    flex: 1, borderRadius: 9, paddingVertical: 8,
    alignItems: "center",
  },
  tabLabel: { fontSize: 13, fontWeight: "600" },
  center: { alignItems: "center", paddingVertical: 40, gap: 12 },
  loadingText: { fontSize: 14 },
  errorBox: { borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 16, gap: 10 },
  errorText: { fontSize: 14, lineHeight: 20 },
  retryText: { fontSize: 14, fontWeight: "600" },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  statCard: { flex: 1, borderRadius: 14, borderWidth: 1, padding: 14, alignItems: "center" },
  statValue: { fontSize: 28, fontWeight: "800", marginBottom: 2 },
  statLabel: { fontSize: 11, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.4 },
  versionBadge: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 20 },
  versionText: { fontSize: 14 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 10 },
  userRow: { flexDirection: "row", alignItems: "center", borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 8, gap: 12 },
  userAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  userAvatarText: { fontSize: 18, fontWeight: "700" },
  userInfo: { flex: 1 },
  userName: { fontSize: 15, fontWeight: "600", marginBottom: 2 },
  userEmail: { fontSize: 12, marginBottom: 2 },
  userVersion: { fontSize: 11 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  statusBadgeText: { fontSize: 11, fontWeight: "700" },
  allConsentedBox: { borderRadius: 14, borderWidth: 1, padding: 24, alignItems: "center", gap: 8, marginTop: 16 },
  allConsentedEmoji: { fontSize: 36 },
  allConsentedText: { fontSize: 16, fontWeight: "600", textAlign: "center" },
  purgeBtn: { borderRadius: 12, paddingVertical: 14, alignItems: "center", marginBottom: 16 },
  purgeBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  deletionCard: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 10, gap: 10 },
  deletionCardHeader: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  deletionMeta: { gap: 4 },
  metaText: { fontSize: 12 },
  overdueText: { fontSize: 12, fontWeight: "600" },
  actionRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  actionBtn: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 7 },
  actionBtnText: { fontSize: 12, fontWeight: "700" },
});
