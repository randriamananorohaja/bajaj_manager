import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius } from '@/constants/theme';
import { createChauffeur } from '@/lib/api';
import { pickImage } from '@/lib/imagePicker';
import { Header } from '@/components/common/Header';
import { PrimaryButton } from '@/components/common/PrimaryButton';

export default function AjouterChauffeurScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [adresse, setAdresse] = useState('');
  const [cin, setCin] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePhoto = async () => {
    const result = await pickImage({ aspect: [1, 1] });
    if (result?.uri) setPhoto(result.uri);
  };

  const handleSave = async () => {
    if (!nom.trim() || !prenom.trim()) {
      Alert.alert('Erreur', 'Nom et prénom sont obligatoires');
      return;
    }
    setLoading(true);
    try {
      const c = await createChauffeur({
        nom: nom.trim(),
        prenom: prenom.trim(),
        telephone: telephone.trim(),
        adresse: adresse.trim() || null,
        cin: cin.trim() || null,
        photo: photo,
        statut: 'actif',
      });
      if (c) {
        router.back();
      } else {
        Alert.alert('Erreur', 'Impossible de créer le chauffeur');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Nouveau chauffeur" showBack />
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity style={styles.photoBox} onPress={handlePhoto} activeOpacity={0.8}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.photoImg} />
          ) : (
            <Text style={styles.photoHint}>📷 Ajouter une photo</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.label}>Prénom *</Text>
        <TextInput
          style={styles.input}
          value={prenom}
          onChangeText={setPrenom}
          placeholder="Prénom"
          placeholderTextColor={Colors.light.textMuted}
        />

        <Text style={styles.label}>Nom *</Text>
        <TextInput
          style={styles.input}
          value={nom}
          onChangeText={setNom}
          placeholder="Nom"
          placeholderTextColor={Colors.light.textMuted}
        />

        <Text style={styles.label}>Téléphone</Text>
        <TextInput
          style={styles.input}
          value={telephone}
          onChangeText={setTelephone}
          placeholder="034 XX XXX XX"
          placeholderTextColor={Colors.light.textMuted}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>CIN</Text>
        <TextInput
          style={styles.input}
          value={cin}
          onChangeText={setCin}
          placeholder="Numéro CIN"
          placeholderTextColor={Colors.light.textMuted}
        />

        <Text style={styles.label}>Adresse</Text>
        <TextInput
          style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
          value={adresse}
          onChangeText={setAdresse}
          placeholder="Adresse complète"
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
  photoBox: {
    alignSelf: 'center',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.light.card,
    borderWidth: 2,
    borderColor: Colors.light.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 8,
  },
  photoImg: { width: 100, height: 100 },
  photoHint: { fontSize: 12, color: Colors.light.textMuted, textAlign: 'center' },
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
});
