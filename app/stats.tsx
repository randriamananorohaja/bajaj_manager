import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Colors, Radius } from '@/constants/theme';
import { getMonthlyStats, getDashboardStats } from '@/lib/api';
import { MONTHS_FR } from '@/lib/types';
import { Header } from '@/components/common/Header';

export default function StatsScreen() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [monthly, setMonthly] = useState<Awaited<ReturnType<typeof getMonthlyStats>> | null>(null);
  const [dash, setDash] = useState<Awaited<ReturnType<typeof getDashboardStats>> | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [m, d] = await Promise.all([getMonthlyStats(year, month), getDashboardStats()]);
    setMonthly(m);
    setDash(d);
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [year, month])
  );

  const prevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  };

  return (
    <View style={styles.container}>
      <Header title="Statistiques" showBack />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Sélecteur mois */}
        <View style={styles.monthRow}>
          <TouchableOpacity onPress={prevMonth} style={styles.monthBtn}>
            <Text style={styles.monthBtnText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.monthLabel}>
            {MONTHS_FR[month - 1]} {year}
          </Text>
          <TouchableOpacity onPress={nextMonth} style={styles.monthBtn}>
            <Text style={styles.monthBtnText}>›</Text>
          </TouchableOpacity>
        </View>

        {loading || !monthly || !dash ? (
          <ActivityIndicator size="large" color={Colors.light.primary} style={{ marginTop: 40 }} />
        ) : (
          <>
            <View style={styles.grid}>
              <View style={[styles.statBox, { backgroundColor: '#FFF7ED' }]}>
                <Text style={styles.statValue}>{monthly.totalRecu.toLocaleString('fr-FR')}</Text>
                <Text style={styles.statLabel}>Versements (Ar)</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: '#FEF2F2' }]}>
                <Text style={[styles.statValue, { color: Colors.light.danger }]}>
                  {monthly.totalFrais.toLocaleString('fr-FR')}
                </Text>
                <Text style={styles.statLabel}>Frais (Ar)</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: '#F0FDF4' }]}>
                <Text style={[styles.statValue, { color: Colors.light.success }]}>
                  {monthly.benefice.toLocaleString('fr-FR')}
                </Text>
                <Text style={styles.statLabel}>Bénéfice (Ar)</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: '#EFF6FF' }]}>
                <Text style={styles.statValue}>{monthly.versementsCount}</Text>
                <Text style={styles.statLabel}>Nb versements</Text>
              </View>
            </View>

            <Text style={styles.section}>Détail du mois</Text>
            <View style={styles.card}>
              <Row label="Complets" value={String(monthly.complets)} color={Colors.light.success} />
              <Row label="Partiels" value={String(monthly.partiels)} color={Colors.light.warning} />
              <Row label="Impayés" value={String(monthly.impayes)} color={Colors.light.danger} />
              <Row label="Nb frais" value={String(monthly.fraisCount)} />
            </View>

            <Text style={styles.section}>Aujourd'hui</Text>
            <View style={styles.card}>
              <Row label="Bajaj en service" value={String(dash.bajajEnService)} />
              <Row label="Chauffeurs actifs" value={String(dash.chauffeurCount)} />
              <Row
                label="Reçu aujourd'hui"
                value={`${dash.totalRecu.toLocaleString('fr-FR')} Ar`}
              />
              <Row
                label="Attendu aujourd'hui"
                value={`${dash.totalAttendu.toLocaleString('fr-FR')} Ar`}
              />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function Row({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, color ? { color } : null]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 20,
  },
  monthBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  monthBtnText: { fontSize: 24, color: Colors.light.primary, fontWeight: '600' },
  monthLabel: { fontSize: 18, fontWeight: '700', color: Colors.light.text },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statBox: {
    width: '48%',
    borderRadius: Radius.lg,
    padding: 16,
    alignItems: 'center',
  },
  statValue: { fontSize: 20, fontWeight: '700', color: Colors.light.primary },
  statLabel: { fontSize: 12, color: Colors.light.textSecondary, marginTop: 4 },
  section: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.text,
    marginTop: 24,
    marginBottom: 10,
  },
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: Radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  rowLabel: { fontSize: 14, color: Colors.light.textSecondary },
  rowValue: { fontSize: 14, fontWeight: '700', color: Colors.light.text },
});
