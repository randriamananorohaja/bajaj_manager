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
import { getChauffeur, deleteChauffeur } from '@/lib/api';
import type { Chauffeur } from '@/lib/types';
import { Header } from '@/components/common/Header';
import { PrimaryButton } from '@/components/common/PrimaryButton';

export default function ChauffeurDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [chauffeur, setChauffeur] = useState<Chauffeur | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      getChauffeur(id).then((c) => {
        setChauffeur(c);
        setLoading(false);
      });
    }, [id])
  );

  const handleDelete = () => {
    Alert.alert('Supprimer', 'Supprimer ce chauffeur ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          await deleteChauffeur(id!);
          router.back();
        },
      },
    ]);
  };

  if (loading || !chauffeur) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title={`${chauffeur.prenom} ${chauffeur.nom}`}
        showBack
        rightIcon="pencil"
        onRightPress={() => router.push(`/modifier-chauffeur/${id}`)}
      />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 40 }}>
        <View style={styles.card}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(chauffeur.prenom?.[0] || '') + (chauffeur.nom?.[0] || '')}
            </Text>
          </View>
          <Text style={styles.name}>
            {chauffeur.prenom} {chauffeur.nom}
          </Text>
          <View
            style={[
              styles.badge,
              {
                backgroundColor:
                  chauffeur.statut === 'actif'
                    ? Colors.light.success + '20'
                    : Colors.light.textMuted + '20',
              },
            ]}
          >
            <Text
              style={{
                color:
                  chauffeur.statut === 'actif'
                    ? Colors.light.success
                    : Colors.light.textMuted,
                fontWeight: '600',
                fontSize: 13,
              }}
            >
              {chauffeur.statut === 'actif' ? 'Actif' : 'Inactif'}
            </Text>
          </View>
        </View>

        {[
          { label: 'Téléphone', value: chauffeur.telephone },
          { label: 'CIN', value: chauffeur.cin },
          { label: 'Adresse', value: chauffeur.adresse },
        ]
          .filter((x) => x.value)
          .map((row) => (
            <View key={row.label} style={styles.infoCard}>
              <Text style={styles.infoLabel}>{row.label}</Text>
              <Text style={styles.infoValue}>{row.value}</Text>
            </View>
          ))}

        <PrimaryButton
          title="Modifier"
          icon="pencil"
          onPress={() => router.push(`/modifier-chauffeur/${id}`)}
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
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { color: '#fff', fontSize: 24, fontWeight: '700' },
  name: { fontSize: 20, fontWeight: '700', color: Colors.light.text },
  badge: {
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
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
