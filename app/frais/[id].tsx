import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius } from '@/constants/theme';
import { getFraisItem, getBajaj, getChauffeur, deleteFrais } from '@/lib/api';
import type { Frais, Bajaj, Chauffeur } from '@/lib/types';
import { FRAIS_TYPES } from '@/lib/types';
import { Header } from '@/components/common/Header';
import { PrimaryButton } from '@/components/common/PrimaryButton';

export default function FraisDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [frais, setFrais] = useState<Frais | null>(null);
  const [bajaj, setBajaj] = useState<Bajaj | null>(null);
  const [chauffeur, setChauffeur] = useState<Chauffeur | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        if (!id) return;
        const f = await getFraisItem(id);
        setFrais(f);
        if (f) {
          const b = await getBajaj(f.bajaj_id);
          setBajaj(b);
          if (f.chauffeur_id) {
            setChauffeur(await getChauffeur(f.chauffeur_id));
          }
        }
        setLoading(false);
      })();
    }, [id])
  );

  const handleDelete = () => {
    Alert.alert('Supprimer', 'Supprimer ce frais ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          await deleteFrais(id!);
          router.back();
        },
      },
    ]);
  };

  if (loading || !frais) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  const typeLabel = FRAIS_TYPES.find((t) => t.value === frais.type)?.label ?? frais.type;

  return (
    <View style={styles.container}>
      <Header title="Détail frais" showBack />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 40 }}>
        <View style={styles.card}>
          <Text style={styles.type}>{typeLabel}</Text>
          <Text style={styles.amount}>{frais.montant.toLocaleString('fr-FR')} Ar</Text>
        </View>

        {[
          { label: 'Date', value: `${frais.date}${frais.heure ? ' · ' + frais.heure : ''}` },
          { label: 'Bajaj', value: bajaj?.matricule ?? '—' },
          {
            label: 'Chauffeur',
            value: chauffeur ? `${chauffeur.prenom} ${chauffeur.nom}` : '—',
          },
          ...(frais.piece ? [{ label: 'Pièce', value: frais.piece }] : []),
          ...(frais.cause ? [{ label: 'Cause', value: frais.cause }] : []),
          ...(frais.description ? [{ label: 'Description', value: frais.description }] : []),
        ].map((row) => (
          <View key={row.label} style={styles.infoCard}>
            <Text style={styles.infoLabel}>{row.label}</Text>
            <Text style={styles.infoValue}>{row.value}</Text>
          </View>
        ))}

        {frais.photo ? (
          <Image source={{ uri: frais.photo }} style={styles.photo} resizeMode="cover" />
        ) : null}

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
  center: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: Radius.lg,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: 16,
  },
  type: { fontSize: 14, fontWeight: '600', color: Colors.light.primaryDark, marginBottom: 8 },
  amount: { fontSize: 28, fontWeight: '800', color: Colors.light.text },
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
  photo: {
    width: '100%',
    height: 200,
    borderRadius: Radius.md,
    marginTop: 8,
    marginBottom: 8,
  },
});
