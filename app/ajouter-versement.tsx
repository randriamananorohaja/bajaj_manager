import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius, VERSEMENT_JOURNALIER } from '@/constants/theme';
import { createVersement, getBajajs, getChauffeurs } from '@/lib/api';
import type { Bajaj, Chauffeur } from '@/lib/types';
import { Header } from '@/components/common/Header';
import { PrimaryButton } from '@/components/common/PrimaryButton';

export default function AjouterVersementScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [bajajs, setBajajs] = useState<Bajaj[]>([]);
  const [chauffeurs, setChauffeurs] = useState<Chauffeur[]>([]);
  const [bajajId, setBajajId] = useState<string | null>(null);
  const [chauffeurId, setChauffeurId] = useState<string | null>(null);
  const [montantRecu, setMontantRecu] = useState(String(VERSEMENT_JOURNALIER));
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const [b, c] = await Promise.all([getBajajs(), getChauffeurs()]);
      setBajajs(b.filter((x) => x.statut === 'en_service'));
      setChauffeurs(c.filter((x) => x.statut === 'actif'));
    })();
  }, []);

  // Auto-select chauffeur when bajaj selected
  useEffect(() => {
    if (!bajajId) return;
    const b = bajajs.find((x) => x.id === bajajId);
    if (b?.chauffeur_id) setChauffeurId(b.chauffeur_id);
  }, [bajajId, bajajs]);

  const recu = parseFloat(montantRecu.replace(/\s/g, '')) || 0;
  const restant = Math.max(0, VERSEMENT_JOURNALIER - recu);

  const handleSave = async () => {
    if (!bajajId || !chauffeurId) {
      Alert.alert('Erreur', 'Sélectionnez un Bajaj et un chauffeur');
      return;
    }
    if (recu < 0) {
      Alert.alert('Erreur', 'Montant invalide');
      return;
    }
    setLoading(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const v = await createVersement({
        bajaj_id: bajajId,
        chauffeur_id: chauffeurId,
        date: today,
        montant_recu: recu,
        montant_attendu: VERSEMENT_JOURNALIER,
        note: note.trim() || null,
      });
      if (v) {
        router.back();
      } else {
        Alert.alert('Erreur', 'Impossible d\'enregistrer le versement');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Nouveau versement" showBack />
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.label}>Bajaj *</Text>
        <View style={styles.chips}>
          {bajajs.map((b) => (
            <TouchableOpacity
              key={b.id}
              style={[styles.chip, bajajId === b.id && styles.chipActive]}
              onPress={() => setBajajId(b.id)}
            >
              <Text
                style={[styles.chipText, bajajId === b.id && styles.chipTextActive]}
              >
                {b.matricule}
              </Text>
            </TouchableOpacity>
          ))}
          {bajajs.length === 0 && (
            <Text style={styles.emptyHint}>Aucun Bajaj en service</Text>
          )}
        </View>

        <Text style={styles.label}>Chauffeur *</Text>
        <View style={styles.chips}>
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

        <Text style={styles.label}>
          Montant reçu (attendu : {VERSEMENT_JOURNALIER.toLocaleString('fr-FR')} Ar)
        </Text>
        <TextInput
          style={styles.input}
          value={montantRecu}
          onChangeText={setMontantRecu}
          placeholder="30000"
          placeholderTextColor={Colors.light.textMuted}
          keyboardType="numeric"
        />

        {restant > 0 && (
          <View style={styles.restantBox}>
            <Text style={styles.restantText}>
              Reste à payer : {restant.toLocaleString('fr-FR')} Ar
            </Text>
          </View>
        )}
        {recu >= VERSEMENT_JOURNALIER && (
          <View style={[styles.restantBox, { backgroundColor: '#F0FDF4' }]}>
            <Text style={[styles.restantText, { color: Colors.light.success }]}>
              Versement complet ✓
            </Text>
          </View>
        )}

        <Text style={styles.label}>Note (optionnel)</Text>
        <TextInput
          style={[styles.input, { height: 70, textAlignVertical: 'top' }]}
          value={note}
          onChangeText={setNote}
          placeholder="Remarque..."
          placeholderTextColor={Colors.light.textMuted}
          multiline
        />

        <PrimaryButton
          title="Enregistrer le versement"
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
  emptyHint: { fontSize: 13, color: Colors.light.textMuted },
  restantBox: {
    marginTop: 10,
    backgroundColor: '#FFF7ED',
    borderRadius: Radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  restantText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.warning,
  },
});
