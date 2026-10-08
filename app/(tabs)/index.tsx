import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { Colors, Radius, VERSEMENT_JOURNALIER } from '@/constants/theme';
import { getDashboardStats } from '@/lib/api';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { AnimatedSection, AnimatedCard } from '@/components/common/AnimatedSection';

export default function AccueilScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getDashboardStats>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    const s = await getDashboardStats();
    setStats(s);
    setLoading(false);
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  if (loading || !stats) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  const rate =
    stats.totalAttendu > 0
      ? Math.round((stats.totalRecu / stats.totalAttendu) * 100)
      : 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#1A1A1A', '#2A2A2A']}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <View style={styles.headerTop}>
          <View style={styles.logoRow}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>{'🛺'}</Text>
            </View>
            <View>
              <Text style={styles.greeting}>Bonjour {'👋'}</Text>
              <Text style={styles.teamName}>Bajaj Manager</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.bellBtn}
            onPress={() => router.push('/notifications')}
          >
            <IconSymbol name="bell.fill" size={22} color={Colors.light.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.headerAccent} />
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
            tintColor={Colors.light.primary}
          />
        }
      >
        <View style={styles.statsRow}>
          <AnimatedCard index={0} style={{ flex: 1 }}>
            <View style={[styles.statCard, { backgroundColor: '#FFF8E1' }]}>
              <IconSymbol name="car.fill" size={24} color={Colors.light.primaryDark} />
              <Text style={styles.statValue}>{stats.bajajEnService}</Text>
              <Text style={styles.statLabel}>En service</Text>
            </View>
          </AnimatedCard>
          <AnimatedCard index={1} style={{ flex: 1 }}>
            <View style={[styles.statCard, { backgroundColor: '#F0FDF4' }]}>
              <IconSymbol name="person.2.fill" size={24} color={Colors.light.success} />
              <Text style={styles.statValue}>{stats.chauffeurCount}</Text>
              <Text style={styles.statLabel}>Chauffeurs</Text>
            </View>
          </AnimatedCard>
        </View>

        <AnimatedSection delay={150}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Versements du jour</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{stats.versementsToday}</Text>
              </View>
            </View>

            <View style={styles.amountRow}>
              <View>
                <Text style={styles.amountLabel}>Reçu</Text>
                <Text style={styles.amountValue}>
                  {stats.totalRecu.toLocaleString('fr-FR')} Ar
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.amountLabel}>Attendu</Text>
                <Text style={[styles.amountValue, { color: Colors.light.textSecondary }]}>
                  {stats.totalAttendu.toLocaleString('fr-FR')} Ar
                </Text>
              </View>
            </View>

            <View style={styles.progressBg}>
              <MotiView
                from={{ width: '0%' as any }}
                animate={{ width: `${Math.min(rate, 100)}%` as any }}
                transition={{ type: 'timing', duration: 800, delay: 300 }}
                style={styles.progressFill}
              />
            </View>
            <Text style={styles.progressText}>{rate}% collecté</Text>

            <View style={styles.statusRow}>
              <View style={styles.statusItem}>
                <View style={[styles.dot, { backgroundColor: Colors.light.success }]} />
                <Text style={styles.statusText}>{stats.complets} complets</Text>
              </View>
              <View style={styles.statusItem}>
                <View style={[styles.dot, { backgroundColor: Colors.light.warning }]} />
                <Text style={styles.statusText}>{stats.impayes} restants</Text>
              </View>
            </View>
          </View>
        </AnimatedSection>

        <AnimatedSection delay={250}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          <PrimaryButton
            title="Nouveau versement"
            icon="plus.circle.fill"
            onPress={() => router.push('/ajouter-versement')}
          />
          <PrimaryButton
            title="Ajouter un Bajaj"
            icon="car.fill"
            variant="outline"
            onPress={() => router.push('/ajouter-bajaj')}
            style={{ marginTop: 10 }}
          />
          <PrimaryButton
            title="Ajouter un chauffeur"
            icon="person.badge.plus"
            variant="dark"
            onPress={() => router.push('/ajouter-chauffeur')}
            style={{ marginTop: 10 }}
          />
        </AnimatedSection>

        <AnimatedSection delay={350}>
          <View style={styles.infoBox}>
            <IconSymbol name="info.circle" size={18} color={Colors.light.primaryDark} />
            <Text style={styles.infoText}>
              Versement journalier : {VERSEMENT_JOURNALIER.toLocaleString('fr-FR')} Ar
            </Text>
          </View>
        </AnimatedSection>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  center: { alignItems: 'center', justifyContent: 'center' },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 22,
  },
  headerAccent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: Colors.light.primary,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: { fontSize: 26 },
  greeting: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  teamName: { color: Colors.light.primary, fontSize: 18, fontWeight: '800' },
  bellBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(245, 196, 0, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statCard: {
    borderRadius: Radius.lg,
    padding: 18,
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  statValue: { fontSize: 30, fontWeight: '800', color: Colors.light.text },
  statLabel: { fontSize: 12, color: Colors.light.textSecondary, fontWeight: '500' },
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: Radius.lg,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Colors.light.text },
  badge: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  badgeText: { fontSize: 12, fontWeight: '800', color: '#1A1A1A' },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  amountLabel: { fontSize: 12, color: Colors.light.textMuted },
  amountValue: { fontSize: 20, fontWeight: '800', color: Colors.light.primaryDark },
  progressBg: {
    height: 10,
    backgroundColor: Colors.light.progressBg,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.light.primary,
    borderRadius: 5,
  },
  progressText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 6,
    textAlign: 'right',
    fontWeight: '600',
  },
  statusRow: { flexDirection: 'row', gap: 20, marginTop: 12 },
  statusItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 13, color: Colors.light.textSecondary },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 12,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginTop: 20,
  },
  infoText: { flex: 1, fontSize: 13, color: Colors.light.textSecondary, fontWeight: '500' },
});
