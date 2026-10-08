import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius } from '@/constants/theme';
import { createBajaj, getChauffeurs } from '@/lib/api';
import type { Chauffeur, BajajStatut } from '@/lib/types';
import { BAJAJ_STATUTS } from '@/lib/types';
import { Header } from '@/components/common/Header';
import { PrimaryButton } from '@/components/common/PrimaryButton';

export default function AjouterBajajScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [marque, setMarque] = useState('');
  const [matricule, setMatricule] = useState('');
  const [statut, setStatut] = useState<BajajStatut>('en_service');
  const [chauffeurId, setChauffeurId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [chauffeurs, setChauffeurs] = useState<Chauffeur[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getChauffeurs().then((c) => setChauffeurs(c.filter((x) => x.statut === 'actif')));
  }, []);

  const handleSave = async () => {
    if (!matricule.trim()) {
      Alert.alert('Erreur', 'Le matricule est obligatoire');
      return;
    }
    setLoading(true);
    try {
      const b = await createBajaj({
        marque: marque.trim(),
        matricule: matricule.trim().toUpperCase(),
        statut,
        chauffeur_id: chauffeurId,
        notes: notes.trim() || null,
      });
      if (b) {
        router.back();
      } else {
        Alert.alert('Erreur', 'Impossible de créer le Bajaj');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Nouveau Bajaj" showBack />
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.label}>Matricule *</Text>
        <TextInput
          style={styles.input}
          value={matricule}
          onChangeText={setMatricule}
          placeholder="Ex: 1234 TAB"
          placeholderTextColor={Colors.light.textMuted}
          autoCapitalize="characters"
        />

        <Text style={styles.label}>Marque</Text>
        <TextInput
          style={styles.input}
          value={marque}
          onChangeText={setMarque}
          placeholder="Ex: Bajaj RE, TVS..."
          placeholderTextColor={Colors.light.textMuted}
        />

        <Text style={styles.label}>Statut</Text>
        <View style={styles.chips}>
          {BAJAJ_STATUTS.map((s) => (
            <TouchableOpacity
              key={s.value}
              style={[styles.chip, statut === s.value && styles.chipActive]}
              onPress={() => setStatut(s.value)}
            >
              <Text
                style={[styles.chipText, statut === s.value && styles.chipTextActive]}
              >
                {s.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Chauffeur assigné</Text>
        <View style={styles.chips}>
          <TouchableOpacity
            style={[styles.chip, !chauffeurId && styles.chipActive]}
            onPress={() => setChauffeurId(null)}
          >
            <Text style={[styles.chipText, !chauffeurId && styles.chipTextActive]}>
              Aucun
            </Text>
          </TouchableOpacity>
          {chauffeurs.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={[styles.chip, chauffeurId === c.id && styles.chipActive]}
              onPress={() => setChauffeurId(c.id)}
            >
              <Text
                style={[
                  styles.chipText,
                  chauffeurId === c.id && styles.chipTextActive,
                ]}
              >
                {c.prenom} {c.nom}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Remarques..."
          placeholderTextColor={Colors.light.textMuted}
          multiline
        />

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
