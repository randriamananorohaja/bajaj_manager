import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Colors, Radius } from '@/constants/theme';
import { getVersements, getFrais, getBajajs } from '@/lib/api';
import type { Versement, Frais, Bajaj } from '@/lib/types';
import { Header } from '@/components/common/Header';
import { EmptyState } from '@/components/common/EmptyState';

type Item =
  | { kind: 'versement'; data: Versement }
  | { kind: 'frais'; data: Frais };

export default function HistoriqueScreen() {
  const [items, setItems] = useState<Item[]>([]);
  const [bajajs, setBajajs] = useState<Bajaj[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    const [v, f, b] = await Promise.all([getVersements(), getFrais(), getBajajs()]);
    setBajajs(b);
    const combined: Item[] = [
      ...v.map((x) => ({ kind: 'versement' as const, data: x })),
      ...f.map((x) => ({ kind: 'frais' as const, data: x })),
    ];
    combined.sort((a, b) => {
      const da = a.data.date + (a.kind === 'versement' ? a.data.heure : a.data.heure);
      const db = b.data.date + (b.kind === 'versement' ? b.data.heure : b.data.heure);
      return db.localeCompare(da);
    });
    setItems(combined);
    setLoading(false);
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const getMatricule = (id: string) => bajajs.find((x) => x.id === id)?.matricule ?? '—';

  const renderItem = ({ item }: { item: Item }) => {
    if (item.kind === 'versement') {
      const v = item.data;
      return (
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.type}>💰 Versement</Text>
            <Text style={styles.date}>{v.date}</Text>
          </View>
          <Text style={styles.main}>
            {getMatricule(v.bajaj_id)} · {v.montant_recu.toLocaleString('fr-FR')} Ar
          </Text>
        </View>
      );
    }
    const f = item.data;
    return (
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.type}>🔧 {f.type}</Text>
          <Text style={styles.date}>{f.date}</Text>
        </View>
        <Text style={styles.main}>
          {getMatricule(f.bajaj_id)} · {f.montant.toLocaleString('fr-FR')} Ar
        </Text>
        {f.piece ? <Text style={styles.sub}>{f.piece}</Text> : null}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Historique" showBack />
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item, i) => item.kind + item.data.id + i}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          ListEmptyComponent={<EmptyState message="Aucun historique" />}
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
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: Radius.md,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  type: { fontSize: 12, fontWeight: '600', color: Colors.light.primary },
  date: { fontSize: 12, color: Colors.light.textMuted },
  main: { fontSize: 15, fontWeight: '600', color: Colors.light.text },
  sub: { fontSize: 13, color: Colors.light.textSecondary, marginTop: 2 },
});
