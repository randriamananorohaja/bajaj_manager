import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Linking,
  Platform,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Colors, Radius } from '@/constants/theme';
import {
  getBajajs,
  getPositions,
  savePosition,
  getLatestPosition,
} from '@/lib/api';
import type { Bajaj, Position } from '@/lib/types';
import { Header } from '@/components/common/Header';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { EmptyState } from '@/components/common/EmptyState';
import { IconSymbol } from '@/components/ui/icon-symbol';

let Location: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Location = require('expo-location');
} catch {
  Location = null;
}

export default function GpsScreen() {
  const [bajajs, setBajajs] = useState<Bajaj[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [latest, setLatest] = useState<Record<string, Position | null>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [myCoords, setMyCoords] = useState<{ lat: number; lng: number } | null>(null);

  const load = async () => {
    const b = await getBajajs();
    setBajajs(b);
    const map: Record<string, Position | null> = {};
    for (const bajaj of b) {
      map[bajaj.id] = await getLatestPosition(bajaj.id);
    }
    setLatest(map);
    if (selectedId) {
      setPositions(await getPositions(selectedId));
    }
    setLoading(false);
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [selectedId])
  );

  const requestLocation = async () => {
    if (!Location) {
      Alert.alert(
        'Module manquant',
        'Installez expo-location :\nnpx expo install expo-location'
      );
      return null;
    }
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission', 'Autorisez la localisation pour enregistrer la position.');
      return null;
    }
    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy?.Balanced ?? 3,
    });
    const coords = {
      lat: loc.coords.latitude,
      lng: loc.coords.longitude,
      accuracy: loc.coords.accuracy,
    };
    setMyCoords({ lat: coords.lat, lng: coords.lng });
    return coords;
  };

  const handleSavePosition = async () => {
    if (!selectedId) {
      Alert.alert('Sélection', 'Choisissez d\'abord un Bajaj');
      return;
    }
    setSaving(true);
    try {
      const coords = await requestLocation();
      if (!coords) {
        setSaving(false);
        return;
      }
      await savePosition({
        bajaj_id: selectedId,
        latitude: coords.lat,
        longitude: coords.lng,
        accuracy: coords.accuracy,
      });
      Alert.alert('OK', 'Position enregistrée');
      await load();
    } catch (e: any) {
      Alert.alert('Erreur', e?.message || 'Impossible d\'obtenir la position');
    } finally {
      setSaving(false);
    }
  };

  const openMaps = (lat: number, lng: number) => {
    const url = Platform.select({
      ios: `maps:0,0?q=${lat},${lng}`,
      android: `geo:${lat},${lng}?q=${lat},${lng}`,
      default: `https://www.google.com/maps?q=${lat},${lng}`,
    });
    Linking.openURL(url!);
  };

  const selectBajaj = async (id: string) => {
    setSelectedId(id);
    setPositions(await getPositions(id));
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <Header title="GPS — Suivi Bajaj" showBack />
        <ActivityIndicator size="large" color={Colors.light.primary} style={{ marginTop: 40 }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="GPS — Suivi Bajaj" showBack />

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Sélectionner un Bajaj</Text>
        <View style={styles.chips}>
          {bajajs.map((b) => (
            <TouchableOpacity
              key={b.id}
              style={[styles.chip, selectedId === b.id && styles.chipActive]}
              onPress={() => selectBajaj(b.id)}
            >
              <Text style={[styles.chipText, selectedId === b.id && styles.chipTextActive]}>
                {b.matricule}
              </Text>
            </TouchableOpacity>
          ))}
          {bajajs.length === 0 && (
            <Text style={styles.hint}>Aucun Bajaj — ajoutez-en d\'abord</Text>
          )}
        </View>

        {selectedId && (
          <>
            <PrimaryButton
              title={saving ? 'Localisation…' : '📍 Enregistrer ma position actuelle'}
              onPress={handleSavePosition}
              loading={saving}
              style={{ marginVertical: 12 }}
            />

            {latest[selectedId] && (
              <TouchableOpacity
                style={styles.latestCard}
                onPress={() =>
                  openMaps(latest[selectedId]!.latitude, latest[selectedId]!.longitude)
                }
              >
                <IconSymbol name="location.fill" size={22} color={Colors.light.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.latestTitle}>Dernière position</Text>
                  <Text style={styles.latestCoords}>
                    {latest[selectedId]!.latitude.toFixed(5)},{' '}
                    {latest[selectedId]!.longitude.toFixed(5)}
                  </Text>
                  <Text style={styles.latestDate}>
                    {new Date(latest[selectedId]!.created_at).toLocaleString('fr-FR')}
                  </Text>
                </View>
                <Text style={styles.openMaps}>Maps →</Text>
              </TouchableOpacity>
            )}

            <Text style={styles.sectionTitle}>Historique ({positions.length})</Text>
          </>
        )}
      </View>

      <FlatList
        data={positions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        ListEmptyComponent={
          selectedId ? (
            <EmptyState message="Aucune position enregistrée" icon="location" />
          ) : (
            <EmptyState message="Sélectionnez un Bajaj" icon="car.fill" />
          )
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
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.posCard}
            onPress={() => openMaps(item.latitude, item.longitude)}
          >
            <Text style={styles.posCoords}>
              {item.latitude.toFixed(5)}, {item.longitude.toFixed(5)}
            </Text>
            <Text style={styles.posDate}>
              {new Date(item.created_at).toLocaleString('fr-FR')}
              {item.accuracy != null ? ` · ±${Math.round(item.accuracy)} m` : ''}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  center: { alignItems: 'center' },
  content: { paddingHorizontal: 16, paddingTop: 12 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 8,
    marginTop: 8,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  chipActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  chipText: { fontSize: 13, color: Colors.light.textSecondary, fontWeight: '500' },
  chipTextActive: { color: '#fff' },
  hint: { fontSize: 13, color: Colors.light.textMuted },
  latestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.light.card,
    borderRadius: Radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: 8,
  },
  latestTitle: { fontSize: 14, fontWeight: '700', color: Colors.light.text },
  latestCoords: { fontSize: 13, color: Colors.light.textSecondary, marginTop: 2 },
  latestDate: { fontSize: 11, color: Colors.light.textMuted, marginTop: 2 },
  openMaps: { fontSize: 13, color: Colors.light.primary, fontWeight: '600' },
  posCard: {
    backgroundColor: Colors.light.card,
    borderRadius: Radius.md,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  posCoords: { fontSize: 14, fontWeight: '600', color: Colors.light.text },
  posDate: { fontSize: 12, color: Colors.light.textMuted, marginTop: 4 },
});
