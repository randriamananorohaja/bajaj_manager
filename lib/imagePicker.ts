/**
 * Wrapper autour d'expo-image-picker
 */
import { Alert, ActionSheetIOS, Platform } from 'react-native';

type PickerResult = { uri: string } | null;

let ImagePicker: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  ImagePicker = require('expo-image-picker');
} catch {
  ImagePicker = null;
}

export function isImagePickerAvailable(): boolean {
  return ImagePicker != null;
}

export async function pickFromGallery(options?: {
  aspect?: [number, number];
  allowsEditing?: boolean;
}): Promise<PickerResult> {
  if (!ImagePicker) {
    Alert.alert('Package manquant', "Installez expo-image-picker");
    return null;
  }
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permission requise', "Autorisez l'accès à la galerie.");
    return null;
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: options?.allowsEditing !== false,
    aspect: options?.aspect ?? [1, 1],
    quality: 0.7,
  });
  if (!result.canceled && result.assets?.[0]) {
    return { uri: result.assets[0].uri };
  }
  return null;
}

export async function pickFromCamera(options?: {
  aspect?: [number, number];
  allowsEditing?: boolean;
}): Promise<PickerResult> {
  if (!ImagePicker) {
    Alert.alert('Package manquant', "Installez expo-image-picker");
    return null;
  }
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permission requise', "Autorisez l'accès à la caméra.");
    return null;
  }
  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: options?.allowsEditing !== false,
    aspect: options?.aspect ?? [1, 1],
    quality: 0.7,
  });
  if (!result.canceled && result.assets?.[0]) {
    return { uri: result.assets[0].uri };
  }
  return null;
}

/** Affiche un choix Caméra / Galerie */
export function pickImage(
  options?: { aspect?: [number, number]; allowsEditing?: boolean }
): Promise<PickerResult> {
  return new Promise((resolve) => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Annuler', 'Caméra', 'Galerie'],
          cancelButtonIndex: 0,
        },
        async (i) => {
          if (i === 1) resolve(await pickFromCamera(options));
          else if (i === 2) resolve(await pickFromGallery(options));
          else resolve(null);
        }
      );
    } else {
      Alert.alert('Photo', 'Choisir la source', [
        { text: 'Annuler', style: 'cancel', onPress: () => resolve(null) },
        { text: 'Caméra', onPress: async () => resolve(await pickFromCamera(options)) },
        { text: 'Galerie', onPress: async () => resolve(await pickFromGallery(options)) },
      ]);
    }
  });
}
