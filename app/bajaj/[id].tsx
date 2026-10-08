import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius } from '@/constants/theme';
import { getBajaj, getChauffeur, deleteBajaj } from '@/lib/api';
import type { Bajaj, Chauffeur } from '@/lib/types';
import { BAJAJ_STATUTS } from '@/lib/types';
import { Header } from '@/components/common/Header';
import { PrimaryButton } from '@/components/common/PrimaryButton';

export default function BajajDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [bajaj, setBajaj] = useState<Bajaj | null>(null);
  const [chauffeur, setChauffeur] = useState<Chauffeur | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!id) return;
    const b = await getBajaj(id);
    setBajaj(b);
    if (b?.chauffeur_id) {
      const c = await getChauffeur(b.chauffeur_id);
      setChauffeur(c);
    } else {
      setChauffeur(null);
    }
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [id])
  );

  const handleDelete = () => {
    Alert.alert('Supprimer', 'Supprimer ce Bajaj et tous ses versements/frais ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          await deleteBajaj(id!);
          router.back();
        },
      },
    ]);
  };

  if (loading || !bajaj) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  const statutLabel =
    BAJAJ_STATUTS.find((x) => x.value === bajaj.statut)?.label ?? bajaj.statut;

  return (
    <View style={styles.container}>
      <Header
        title={bajaj.matricule}
        showBack
        rightIcon="pencil"
        onRightPress={() => router.push(`/modifier-bajaj/${id}`)}
      />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 40 }}>
        <View style={styles.card}>
          <Text style={styles.emoji}>🛺</Text>
          <Text style={styles.matricule}>{bajaj.matricule}</Text>
          <Text style={styles.marque}>{bajaj.marque || 'Sans marque'}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{statutLabel}</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Chauffeur assigné</Text>
          <Text style={styles.infoValue}>
            {chauffeur ? `${chauffeur.prenom} ${chauffeur.nom}` : 'Non assigné'}
          </Text>
          {chauffeur?.telephone ? (
            <Text style={styles.infoSub}>{chauffeur.telephone}</Text>
          ) : null}
        </View>

        {bajaj.notes ? (
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Notes</Text>
            <Text style={styles.infoValue}>{bajaj.notes}</Text>
          </View>
        ) : null}

        <PrimaryButton
          title="Modifier"
          icon="pencil"
          onPress={() => router.push(`/modifier-bajaj/${id}`)}
          style={{ marginTop: 16 }}
        />
        <PrimaryButton
          title="Supprimer"
          variant="danger"
          onPress={handleDelete}
          style={{ marginTop: 10 }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  center: { alignItems: 'center', justifyContent: 'center' },
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: Radius.lg,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: 16,
  },
  emoji: { fontSize: 48, marginBottom: 8 },
  matricule: { fontSize: 22, fontWeight: '700', color: Colors.light.text },
  marque: { fontSize: 15, color: Colors.light.textSecondary, marginTop: 4 },
  badge: {
    marginTop: 12,
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  badgeText: { fontSize: 13, fontWeight: '600', color: Colors.light.primary },
  infoCard: {
    backgroundColor: Colors.light.card,
    borderRadius: Radius.md,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  infoLabel: { fontSize: 12, color: Colors.light.textMuted, marginBottom: 4 },
  infoValue: { fontSize: 16, fontWeight: '600', color: Colors.light.text },
  infoSub: { fontSize: 13, color: Colors.light.textSecondary, marginTop: 2 },
});
