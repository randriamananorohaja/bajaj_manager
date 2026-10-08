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
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Colors, Radius } from '@/constants/theme';
import { getBajajs, getChauffeurs } from '@/lib/api';
import type { Bajaj, Chauffeur } from '@/lib/types';
import { BAJAJ_STATUTS } from '@/lib/types';
import { MotiView } from 'moti';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { EmptyState } from '@/components/common/EmptyState';

export default function BajajScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [list, setList] = useState<Bajaj[]>([]);
  const [chauffeurs, setChauffeurs] = useState<Chauffeur[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const load = async () => {
    const [b, c] = await Promise.all([getBajajs(), getChauffeurs()]);
    setList(b);
    setChauffeurs(c);
    setLoading(false);
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const getChauffeurName = (id: string | null) => {
    if (!id) return 'Non assigné';
    const c = chauffeurs.find((x) => x.id === id);
    return c ? `${c.prenom} ${c.nom}` : '—';
  };

  const statutLabel = (s: string) =>
    BAJAJ_STATUTS.find((x) => x.value === s)?.label ?? s;

  const statutColor = (s: string) => {
    if (s === 'en_service') return Colors.light.success;
    if (s === 'en_panne') return Colors.light.danger;
    return Colors.light.warning;
  };

  const filtered = list.filter((b) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      b.matricule.toLowerCase().includes(q) ||
      (b.marque || '').toLowerCase().includes(q)
    );
  });

  const renderItem = ({ item }: { item: Bajaj }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => router.push(`/bajaj/${item.id}`)}
    >
      <View style={styles.cardLeft}>
        <View style={styles.iconCircle}>
          <Text style={{ fontSize: 22 }}>🛺</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.matricule}>{item.matricule}</Text>
          <Text style={styles.marque}>{item.marque || 'Sans marque'}</Text>
          <Text style={styles.chauffeur}>{getChauffeurName(item.chauffeur_id)}</Text>
        </View>
      </View>
      <View style={[styles.badge, { backgroundColor: statutColor(item.statut) + '20' }]}>
        <Text style={[styles.badgeText, { color: statutColor(item.statut) }]}>
          {statutLabel(item.statut)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.headerTitle}>Mes Bajaj</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/ajouter-bajaj')}
        >
          <IconSymbol name="plus" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBox}>
        <IconSymbol name="magnifyingglass" size={18} color={Colors.light.textMuted} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Rechercher matricule, marque..."
          placeholderTextColor={Colors.light.textMuted}
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          ListEmptyComponent={
            <EmptyState message="Aucun Bajaj enregistré" icon="car.fill" />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  matricule: { fontSize: 16, fontWeight: '700', color: Colors.light.text },
  marque: { fontSize: 13, color: Colors.light.textSecondary, marginTop: 2 },
  chauffeur: { fontSize: 12, color: Colors.light.textMuted, marginTop: 2 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  badgeText: { fontSize: 11, fontWeight: '600' },
});
