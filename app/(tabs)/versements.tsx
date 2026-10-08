import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Colors, Radius } from '@/constants/theme';
import { getVersements, getBajajs, getChauffeurs } from '@/lib/api';
import type { Versement, Bajaj, Chauffeur } from '@/lib/types';
import { MotiView } from 'moti';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { EmptyState } from '@/components/common/EmptyState';

export default function VersementsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [list, setList] = useState<Versement[]>([]);
  const [bajajs, setBajajs] = useState<Bajaj[]>([]);
  const [chauffeurs, setChauffeurs] = useState<Chauffeur[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    const [v, b, c] = await Promise.all([getVersements(), getBajajs(), getChauffeurs()]);
    setList(v);
    setBajajs(b);
    setChauffeurs(c);
    setLoading(false);
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const getBajajLabel = (id: string) => {
    const b = bajajs.find((x) => x.id === id);
    return b ? b.matricule : '—';
  };

  const getChauffeurName = (id: string) => {
    const c = chauffeurs.find((x) => x.id === id);
    return c ? `${c.prenom} ${c.nom}` : '—';
  };

  const statutColor = (s: string) => {
    if (s === 'complet') return Colors.light.success;
    if (s === 'partiel') return Colors.light.warning;
    return Colors.light.danger;
  };

  const statutLabel = (s: string) => {
    if (s === 'complet') return 'Complet';
    if (s === 'partiel') return 'Partiel';
    return 'Impayé';
  };

  const renderItem = ({ item }: { item: Versement }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => router.push(`/versement/${item.id}`)}
    >
      <View style={styles.cardTop}>
        <Text style={styles.date}>
          {item.date} · {item.heure}
        </Text>
        <View
          style={[styles.badge, { backgroundColor: statutColor(item.statut) + '20' }]}
        >
          <Text style={[styles.badgeText, { color: statutColor(item.statut) }]}>
            {statutLabel(item.statut)}
          </Text>
        </View>
      </View>
      <Text style={styles.bajaj}>{getBajajLabel(item.bajaj_id)}</Text>
      <Text style={styles.chauffeur}>{getChauffeurName(item.chauffeur_id)}</Text>
      <View style={styles.amounts}>
        <Text style={styles.recu}>
          {item.montant_recu.toLocaleString('fr-FR')} Ar
        </Text>
        {item.montant_restant > 0 && (
          <Text style={styles.restant}>
            Reste {item.montant_restant.toLocaleString('fr-FR')} Ar
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.headerTitle}>Versements</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/ajouter-versement')}
        >
          <IconSymbol name="plus" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          ListEmptyComponent={
            <EmptyState message="Aucun versement enregistré" icon="banknote.fill" />
          }
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
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    backgroundColor: Colors.light.header,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { color: '#F5C400', fontSize: 20, fontWeight: '800', letterSpacing: 0.3 },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: Radius.lg,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  date: { fontSize: 12, color: Colors.light.textMuted },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  badgeText: { fontSize: 11, fontWeight: '600' },
  bajaj: { fontSize: 16, fontWeight: '700', color: Colors.light.text },
  chauffeur: { fontSize: 13, color: Colors.light.textSecondary, marginTop: 2 },
  amounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  recu: { fontSize: 17, fontWeight: '700', color: Colors.light.primary },
  restant: { fontSize: 13, color: Colors.light.danger, fontWeight: '600' },
});
