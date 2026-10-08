import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius } from '@/constants/theme';
import { getChauffeur, updateChauffeur } from '@/lib/api';
import type { ChauffeurStatut } from '@/lib/types';
import { Header } from '@/components/common/Header';
import { PrimaryButton } from '@/components/common/PrimaryButton';

export default function ModifierChauffeurScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [adresse, setAdresse] = useState('');
  const [cin, setCin] = useState('');
  const [statut, setStatut] = useState<ChauffeurStatut>('actif');
  const [loading, setLoading] = useState(false);
  const [init, setInit] = useState(true);

  useEffect(() => {
    if (!id) return;
    getChauffeur(id).then((c) => {
      if (c) {
        setNom(c.nom);
        setPrenom(c.prenom);
        setTelephone(c.telephone || '');
        setAdresse(c.adresse || '');
        setCin(c.cin || '');
        setStatut((c.statut as ChauffeurStatut) || 'actif');
      }
      setInit(false);
    });
  }, [id]);

  const handleSave = async () => {
    if (!nom.trim() || !prenom.trim()) {
      Alert.alert('Erreur', 'Nom et prénom obligatoires');
      return;
    }
    setLoading(true);
    try {
      await updateChauffeur(id!, {
        nom: nom.trim(),
        prenom: prenom.trim(),
        telephone: telephone.trim(),
        adresse: adresse.trim() || null,
        cin: cin.trim() || null,
        statut,
      });
      router.back();
    } finally {
      setLoading(false);
    }
  };

  if (init) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Modifier chauffeur" showBack />
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.label}>Prénom *</Text>
        <TextInput style={styles.input} value={prenom} onChangeText={setPrenom} />

        <Text style={styles.label}>Nom *</Text>
        <TextInput style={styles.input} value={nom} onChangeText={setNom} />

        <Text style={styles.label}>Téléphone</Text>
        <TextInput
          style={styles.input}
          value={telephone}
          onChangeText={setTelephone}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>CIN</Text>
        <TextInput style={styles.input} value={cin} onChangeText={setCin} />

        <Text style={styles.label}>Adresse</Text>
        <TextInput
          style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
          value={adresse}
          onChangeText={setAdresse}
          multiline
        />

        <Text style={styles.label}>Statut</Text>
        <View style={styles.chips}>
          {(['actif', 'inactif'] as ChauffeurStatut[]).map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.chip, statut === s && styles.chipActive]}
              onPress={() => setStatut(s)}
            >
              <Text style={[styles.chipText, statut === s && styles.chipTextActive]}>
                {s === 'actif' ? 'Actif' : 'Inactif'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <PrimaryButton
          title="Enregistrer"
          onPress={handleSave}
          loading={loading}
          style={{ marginTop: 24 }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: Colors.light.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.light.text,
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
});
