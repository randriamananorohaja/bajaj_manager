import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius } from '@/constants/theme';
import { createFrais, getBajajs, getChauffeurs } from '@/lib/api';
import type { Bajaj, Chauffeur, FraisType } from '@/lib/types';
import { FRAIS_TYPES } from '@/lib/types';
import { pickImage } from '@/lib/imagePicker';
import { Header } from '@/components/common/Header';
import { PrimaryButton } from '@/components/common/PrimaryButton';

export default function AjouterFraisScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [bajajs, setBajajs] = useState<Bajaj[]>([]);
  const [chauffeurs, setChauffeurs] = useState<Chauffeur[]>([]);
  const [type, setType] = useState<FraisType>('visite');
  const [bajajId, setBajajId] = useState<string | null>(null);
  const [chauffeurId, setChauffeurId] = useState<string | null>(null);
  const [montant, setMontant] = useState('');
  const [piece, setPiece] = useState('');
  const [cause, setCause] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const [b, c] = await Promise.all([getBajajs(), getChauffeurs()]);
      setBajajs(b);
      setChauffeurs(c.filter((x) => x.statut === 'actif'));
    })();
  }, []);

  const handleSave = async () => {
    if (!bajajId) {
      Alert.alert('Erreur', 'Sélectionnez un Bajaj');
      return;
    }
    const m = parseFloat(montant.replace(/\s/g, '')) || 0;
    if (m <= 0) {
      Alert.alert('Erreur', 'Montant invalide');
      return;
    }
    setLoading(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const f = await createFrais({
        type,
        bajaj_id: bajajId,
        chauffeur_id: chauffeurId,
        date: today,
        montant: m,
        piece: piece.trim() || null,
        cause: cause.trim() || null,
        description: description.trim() || null,
        photo: photo,
      });
      if (f) {
        Alert.alert('Succès', 'Frais enregistré');
        router.back();
      } else {
        Alert.alert('Erreur', 'Impossible d\'enregistrer');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Nouveau frais" showBack />
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.label}>Type *</Text>
        <View style={styles.chips}>
          {FRAIS_TYPES.map((t) => (
            <TouchableOpacity
              key={t.value}
              style={[styles.chip, type === t.value && styles.chipActive]}
              onPress={() => setType(t.value)}
            >
              <Text style={[styles.chipText, type === t.value && styles.chipTextActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Bajaj *</Text>
        <View style={styles.chips}>
          {bajajs.map((b) => (
            <TouchableOpacity
              key={b.id}
              style={[styles.chip, bajajId === b.id && styles.chipActive]}
              onPress={() => setBajajId(b.id)}
            >
              <Text style={[styles.chipText, bajajId === b.id && styles.chipTextActive]}>
                {b.matricule}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Chauffeur (optionnel)</Text>
        <View style={styles.chips}>
          <TouchableOpacity
            style={[styles.chip, !chauffeurId && styles.chipActive]}
            onPress={() => setChauffeurId(null)}
          >
            <Text style={[styles.chipText, !chauffeurId && styles.chipTextActive]}>Aucun</Text>
          </TouchableOpacity>
          {chauffeurs.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={[styles.chip, chauffeurId === c.id && styles.chipActive]}
              onPress={() => setChauffeurId(c.id)}
            >
              <Text
                style={[styles.chipText, chauffeurId === c.id && styles.chipTextActive]}
              >
                {c.prenom} {c.nom}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Montant (Ar) *</Text>
        <TextInput
          style={styles.input}
          value={montant}
          onChangeText={setMontant}
          placeholder="Ex: 50000"
          placeholderTextColor={Colors.light.textMuted}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Pièce réparée / remplacée</Text>
        <TextInput
          style={styles.input}
          value={piece}
          onChangeText={setPiece}
          placeholder="Ex: pneu avant, frein..."
          placeholderTextColor={Colors.light.textMuted}
        />

        <Text style={styles.label}>Cause</Text>
        <TextInput
          style={styles.input}
          value={cause}
          onChangeText={setCause}
          placeholder="Cause de la panne / entretien"
          placeholderTextColor={Colors.light.textMuted}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, { height: 70, textAlignVertical: 'top' }]}
          value={description}
          onChangeText={setDescription}
          placeholder="Détails..."
          placeholderTextColor={Colors.light.textMuted}
          multiline
        />

        <Text style={styles.label}>Photo facture / pièce</Text>
        <TouchableOpacity
          style={styles.photoBox}
          onPress={async () => {
            const r = await pickImage({ allowsEditing: false });
            if (r?.uri) setPhoto(r.uri);
          }}
        >
          {photo ? (
            <Image source={{ uri: photo }} style={styles.photoImg} />
          ) : (
            <Text style={styles.photoHint}>📷 Ajouter une photo</Text>
          )}
        </TouchableOpacity>

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
