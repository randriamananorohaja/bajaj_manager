import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { Colors, Radius } from '@/constants/theme';
import { login } from '@/lib/auth';
import { IconSymbol } from '@/components/ui/icon-symbol';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone.trim() || !password.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir le numéro et le mot de passe');
      return;
    }
    setLoading(true);
    try {
      const ok = await login(phone, password);
      if (ok) {
        router.replace('/(tabs)');
      } else {
        Alert.alert('Accès refusé', 'Numéro ou mot de passe incorrect');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#1A1A1A', '#2D2D2D', '#1A1A1A']}
        style={StyleSheet.absoluteFill}
      />
      {/* Yellow decorative circles */}
      <MotiView
        from={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 0.15, scale: 1 }}
        transition={{ type: 'timing', duration: 800 }}
        style={styles.circle1}
      />
      <MotiView
        from={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 0.1, scale: 1 }}
        transition={{ type: 'timing', duration: 1000, delay: 200 }}
        style={styles.circle2}
      />

      <KeyboardAvoidingView
        style={[styles.container, { paddingTop: insets.top }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <MotiView
          from={{ opacity: 0, translateY: -30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 600 }}
          style={styles.hero}
        >
          <View style={styles.logoCircle}>
            <Text style={{ fontSize: 52 }}>🛺</Text>
          </View>
          <Text style={styles.title}>Bajaj Manager</Text>
          <Text style={styles.subtitle}>Gestion premium · Mahajanga</Text>
          <View style={styles.yellowLine} />
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 40 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 550, delay: 200 }}
          style={styles.form}
        >
          <Text style={styles.formTitle}>Connexion</Text>

          <Text style={styles.label}>Numéro de téléphone</Text>
          <View style={styles.inputRow}>
            <IconSymbol name="phone.fill" size={20} color={Colors.light.primaryDark} />
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="0340000000"
              placeholderTextColor={Colors.light.textMuted}
              keyboardType="phone-pad"
              autoCapitalize="none"
            />
          </View>

          <Text style={styles.label}>Mot de passe</Text>
          <View style={styles.inputRow}>
            <IconSymbol name="lock.fill" size={20} color={Colors.light.primaryDark} />
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={Colors.light.textMuted}
              secureTextEntry={!showPwd}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPwd(!showPwd)}>
              <IconSymbol
                name={showPwd ? 'eye.slash.fill' : 'eye.fill'}
                size={20}
                color={Colors.light.textMuted}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#1A1A1A" />
            ) : (
              <Text style={styles.btnText}>Se connecter</Text>
            )}
          </TouchableOpacity>
        </MotiView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { flex: 1 },
  circle1: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.light.primary,
  },
  circle2: {
    position: 'absolute',
    bottom: 100,
    left: -50,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: Colors.light.primary,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: Colors.light.primary,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 6,
  },
  yellowLine: {
    width: 48,
    height: 3,
    backgroundColor: Colors.light.primary,
    borderRadius: 2,
    marginTop: 14,
  },
  form: {
    flex: 1,
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 28,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    marginBottom: 8,
    marginTop: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    paddingHorizontal: 14,
    gap: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.light.text,
  },
  btn: {
    backgroundColor: Colors.light.primary,
    borderRadius: Radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 32,
    
  },
  btnDisabled: { opacity: 0.6 },
  btnText: {
    color: '#1A1A1A',
    fontSize: 17,
    fontWeight: '800',
  },
});
