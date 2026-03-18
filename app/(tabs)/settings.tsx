import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFoodContext } from '@/lib/food-context';
import { useSubscription } from '@/lib/subscription-context';
import { useRouter } from 'expo-router';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/hooks/use-auth';
import { Linking } from 'react-native';

function SettingRow({
  icon, label, subtitle, right, onPress, danger
}: {
  icon: string; label: string; subtitle?: string;
  right?: React.ReactNode; onPress?: () => void; danger?: boolean;
}) {
  const colors = useColors();
  return (
    <TouchableOpacity
      style={[styles.settingRow, { borderBottomColor: colors.border }]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <Text style={styles.settingIcon}>{icon}</Text>
      <View style={styles.settingInfo}>
        <Text style={[styles.settingLabel, { color: danger ? colors.error : colors.foreground }]}>{label}</Text>
        {subtitle && <Text style={[styles.settingSubtitle, { color: colors.muted }]}>{subtitle}</Text>}
      </View>
      {right ?? (onPress && <IconSymbol name="chevron.right" size={18} color={colors.muted} />)}
    </TouchableOpacity>
  );
}

function SectionHeader({ title }: { title: string }) {
  const colors = useColors();
  return (
    <Text style={[styles.sectionHeader, { color: colors.muted }]}>{title.toUpperCase()}</Text>
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { items, stats } = useFoodContext();
  const subscription = useSubscription();
  const { isAuthenticated } = useAuth();
  const createPortalMutation = trpc.stripe.createPortalSession.useMutation();

  const handleManageSubscription = async () => {
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';
      const { url } = await createPortalMutation.mutateAsync({ returnUrl: `${apiUrl}/` });
      if (url) await Linking.openURL(url);
    } catch {
      Alert.alert('Error', 'Could not open subscription management. Please try again.');
    }
  };

  const tierLabel = subscription.tier === 'free' ? 'Free Plan' : subscription.tier === 'fresh' ? '🥦 Fresh Plan' : '🏡 Family Plan';
  const tierColor = subscription.tier === 'free' ? colors.muted : '#2D8A4E';

  const [notif1Day, setNotif1Day] = useState(true);
  const [notif3Days, setNotif3Days] = useState(true);
  const [notif7Days, setNotif7Days] = useState(false);

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all food items from your inventory. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All', style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('@freshkeep_inventory');
            Alert.alert('Done', 'All inventory data has been cleared. Restart the app to see changes.');
          }
        }
      ]
    );
  };

  return (
    <ScreenContainer containerClassName="bg-background">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.foreground }]}>Settings</Text>
        </View>

        {/* App Info Card */}
        <View style={[styles.appCard, { backgroundColor: colors.primary }]}>
          <Text style={styles.appEmoji}>🫙</Text>
          <Text style={styles.appName}>YumKeeper</Text>
          <Text style={styles.appTagline}>Keep it fresh, waste less</Text>
          <View style={styles.appStats}>
            <View style={styles.appStatItem}>
              <Text style={styles.appStatValue}>{stats.total}</Text>
              <Text style={styles.appStatLabel}>Items</Text>
            </View>
            <View style={[styles.appStatDivider, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
            <View style={styles.appStatItem}>
              <Text style={styles.appStatValue}>{stats.fresh}</Text>
              <Text style={styles.appStatLabel}>Fresh</Text>
            </View>
            <View style={[styles.appStatDivider, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
            <View style={styles.appStatItem}>
              <Text style={styles.appStatValue}>{stats.expiringSoon}</Text>
              <Text style={styles.appStatLabel}>Expiring</Text>
            </View>
          </View>
        </View>

        {/* Subscription */}
        <SectionHeader title="Subscription" />
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <SettingRow
            icon="⭐"
            label="Current Plan"
            subtitle={tierLabel}
            right={<Text style={{ fontSize: 13, fontWeight: '700', color: tierColor }}>{subscription.tier === 'free' ? 'Free' : 'Active'}</Text>}
          />
          {subscription.tier === 'free' ? (
            <SettingRow
              icon="🚀"
              label="Upgrade to Fresh"
              subtitle="Unlimited items, barcode scanner, all tips"
              onPress={() => router.push('/pricing' as any)}
            />
          ) : (
            <>
              {subscription.currentPeriodEnd && (
                <SettingRow
                  icon="📅"
                  label="Renews"
                  subtitle={new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                />
              )}
              {subscription.cancelAtPeriodEnd && (
                <SettingRow
                  icon="⚠️"
                  label="Cancels at period end"
                  subtitle="Your plan will revert to Free after the current period"
                />
              )}
              {isAuthenticated && (
                <SettingRow
                  icon="⚙️"
                  label="Manage Subscription"
                  subtitle="Change plan, update payment, or cancel"
                  onPress={handleManageSubscription}
                />
              )}
            </>
          )}
        </View>

        {/* Notifications */}
        <SectionHeader title="Notifications" />
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <SettingRow
            icon="🔔"
            label="Expire in 1 day"
            subtitle="Alert when food expires tomorrow"
            right={<Switch value={notif1Day} onValueChange={setNotif1Day} trackColor={{ true: colors.primary }} />}
          />
          <SettingRow
            icon="⚠️"
            label="Expire in 3 days"
            subtitle="Alert 3 days before expiry"
            right={<Switch value={notif3Days} onValueChange={setNotif3Days} trackColor={{ true: colors.primary }} />}
          />
          <SettingRow
            icon="📅"
            label="Expire in 7 days"
            subtitle="Alert 1 week before expiry"
            right={<Switch value={notif7Days} onValueChange={setNotif7Days} trackColor={{ true: colors.primary }} />}
          />
        </View>

        {/* Appearance */}
        <SectionHeader title="Appearance" />
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <SettingRow
            icon={colorScheme === 'dark' ? '🌙' : '☀️'}
            label="Theme"
            subtitle={`Currently: ${colorScheme === 'dark' ? 'Dark' : 'Light'} mode (follows system)`}
          />
        </View>

        {/* Data */}
        <SectionHeader title="Data" />
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <SettingRow
            icon="📊"
            label="Inventory Summary"
            subtitle={`${stats.total} items tracked · ${stats.expired} expired`}
          />
          <SettingRow
            icon="🗑️"
            label="Clear All Data"
            subtitle="Remove all food items"
            onPress={handleClearData}
            danger
          />
        </View>

        {/* About */}
        <SectionHeader title="About" />
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <SettingRow icon="📱" label="Version" subtitle="1.0.0" />
          <SettingRow
            icon="♻️"
            label="Mission"
            subtitle="Reduce food waste, one item at a time"
          />
          <SettingRow
            icon="💚"
            label="Preservation Methods"
            subtitle="8 techniques included"
          />
        </View>

        {/* Tips Section */}
        <View style={[styles.tipsBox, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' }]}>
          <Text style={[styles.tipsBoxTitle, { color: colors.primary }]}>💡 Did you know?</Text>
          <Text style={[styles.tipsBoxText, { color: colors.foreground }]}>
            The average household wastes about 30% of the food it purchases. YumKeeper helps you track expiry dates and learn preservation techniques to reduce waste and save money.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 0.5 },
  title: { fontSize: 26, fontWeight: '800' },
  appCard: {
    margin: 16, borderRadius: 20, padding: 20, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 8, elevation: 4,
  },
  appEmoji: { fontSize: 44, marginBottom: 6 },
  appName: { color: '#fff', fontSize: 24, fontWeight: '800', marginBottom: 2 },
  appTagline: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 16 },
  appStats: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  appStatItem: { alignItems: 'center' },
  appStatValue: { color: '#fff', fontSize: 22, fontWeight: '800' },
  appStatLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  appStatDivider: { width: 1, height: 28 },
  sectionHeader: {
    fontSize: 12, fontWeight: '700', letterSpacing: 0.8,
    paddingHorizontal: 16, paddingTop: 20, paddingBottom: 6,
  },
  section: {
    marginHorizontal: 16, borderRadius: 16, borderWidth: 1, overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    borderBottomWidth: 0.5, gap: 12,
  },
  settingIcon: { fontSize: 22, width: 28, textAlign: 'center' },
  settingInfo: { flex: 1 },
  settingLabel: { fontSize: 15, fontWeight: '600' },
  settingSubtitle: { fontSize: 12, marginTop: 1, lineHeight: 16 },
  tipsBox: {
    margin: 16, borderRadius: 16, padding: 16, borderWidth: 1,
  },
  tipsBoxTitle: { fontSize: 15, fontWeight: '700', marginBottom: 6 },
  tipsBoxText: { fontSize: 13, lineHeight: 19 },
});
