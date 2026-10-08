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
import { getVersement, getBajaj, getChauffeur, deleteVersement } from '@/lib/api';
import type { Versement, Bajaj, Chauffeur } from '@/lib/types';
import { Header } from '@/components/common/Header';
import { PrimaryButton } from '@/components/common/PrimaryButton';

export default function VersementDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [v, setV] = useState<Versement | null>(null);
  const [bajaj, setBajaj] = useState<Bajaj | null>(null);
  const [chauffeur, setChauffeur] = useState<Chauffeur | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        if (!id) return;
        const vers = await getVersement(id);
        setV(vers);
        if (vers) {
          const [b, c] = await Promise.all([
            getBajaj(vers.bajaj_id),
            getChauffeur(vers.chauffeur_id),
          ]);
          setBajaj(b);
          setChauffeur(c);
        }
        setLoading(false);
      })();
    }, [id])
  );

  const handleDelete = () => {
    Alert.alert('Supprimer', 'Supprimer ce versement ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          await deleteVersement(id!);
          router.back();
        },
      },
    ]);
  };

  if (loading || !v) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  const statutLabel =
    v.statut === 'complet' ? 'Complet' : v.statut === 'partiel' ? 'Partiel' : 'Impayé';
  const statutColor =
    v.statut === 'complet'
      ? Colors.light.success
      : v.statut === 'partiel'
        ? Colors.light.warning
        : Colors.light.danger;

  return (
    <View style={styles.container}>
      <Header title="Détail versement" showBack />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 40 }}>
        <View style={styles.card}>
          <Text style={styles.amount}>{v.montant_recu.toLocaleString('fr-FR')} Ar</Text>
          <View style={[styles.badge, { backgroundColor: statutColor + '20' }]}>
            <Text style={{ color: statutColor, fontWeight: '600' }}>{statutLabel}</Text>
          </View>
          {v.montant_restant > 0 && (
            <Text style={styles.restant}>
              Reste : {v.montant_restant.toLocaleString('fr-FR')} Ar
            </Text>
          )}
        </View>

        {[
          { label: 'Date', value: `${v.date} à ${v.heure}` },
          { label: 'Bajaj', value: bajaj?.matricule ?? '—' },
          {
            label: 'Chauffeur',
            value: chauffeur ? `${chauffeur.prenom} ${chauffeur.nom}` : '—',
          },
          { label: 'Attendu', value: `${v.montant_attendu.toLocaleString('fr-FR')} Ar` },
          ...(v.note ? [{ label: 'Note', value: v.note }] : []),
        ].map((row) => (
          <View key={row.label} style={styles.infoCard}>
            <Text style={styles.infoLabel}>{row.label}</Text>
            <Text style={styles.infoValue}>{row.value}</Text>
          </View>
        ))}

        <PrimaryButton
          title="Supprimer"
          variant="danger"
          onPress={handleDelete}
          style={{ marginTop: 20 }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: Radius.lg,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: 16,
  },
  amount: { fontSize: 32, fontWeight: '700', color: Colors.light.primary },
  badge: {
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  restant: { marginTop: 8, fontSize: 14, color: Colors.light.danger, fontWeight: '600' },
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
});
