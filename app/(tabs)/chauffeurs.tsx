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
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Colors, Radius } from '@/constants/theme';
import { getChauffeurs } from '@/lib/api';
import type { Chauffeur } from '@/lib/types';
import { MotiView } from 'moti';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { EmptyState } from '@/components/common/EmptyState';

export default function ChauffeursScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [list, setList] = useState<Chauffeur[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    const c = await getChauffeurs();
    setList(c);
    setLoading(false);
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const renderItem = ({ item }: { item: Chauffeur }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => router.push(`/chauffeur/${item.id}`)}
    >
      <View style={styles.avatar}>
        {item.photo ? (
          <Image source={{ uri: item.photo }} style={styles.avatarImg} />
        ) : (
          <Text style={styles.avatarText}>
            {(item.prenom?.[0] || '') + (item.nom?.[0] || '')}
          </Text>
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>
          {item.prenom} {item.nom}
        </Text>
        <Text style={styles.phone}>{item.telephone || 'Pas de téléphone'}</Text>
        {item.cin ? <Text style={styles.cin}>CIN : {item.cin}</Text> : null}
      </View>
      <View
        style={[
          styles.badge,
          {
            backgroundColor:
              item.statut === 'actif'
                ? Colors.light.success + '20'
                : Colors.light.textMuted + '20',
          },
        ]}
      >
        <Text
          style={[
            styles.badgeText,
            {
              color:
                item.statut === 'actif'
                  ? Colors.light.success
                  : Colors.light.textMuted,
            },
          ]}
        >
          {item.statut === 'actif' ? 'Actif' : 'Inactif'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.headerTitle}>Chauffeurs</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/ajouter-chauffeur')}
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
            <EmptyState message="Aucun chauffeur enregistré" icon="person.2.fill" />
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
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: { width: 48, height: 48 },
  avatarText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  name: { fontSize: 16, fontWeight: '700', color: Colors.light.text },
  phone: { fontSize: 13, color: Colors.light.textSecondary, marginTop: 2 },
  cin: { fontSize: 12, color: Colors.light.textMuted, marginTop: 2 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  badgeText: { fontSize: 11, fontWeight: '600' },
});
