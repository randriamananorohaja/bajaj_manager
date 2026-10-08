import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Radius } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

type Props = {
  title: string;
  showBack?: boolean;
  rightIcon?: string;
  onRightPress?: () => void;
  rightElement?: React.ReactNode;
  transparent?: boolean;
};

export function Header({ title, showBack, rightIcon, onRightPress, rightElement, transparent }: Props) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  if (transparent) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 8 }, styles.transparent]}>
        <StatusBar barStyle="light-content" />
        <View style={styles.row}>
          {showBack ? (
            <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn} hitSlop={12}>
              <IconSymbol name="chevron.left" size={26} color="#fff" />
            </TouchableOpacity>
          ) : (
            <View style={styles.iconBtn} />
          )}
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {rightElement ? rightElement : rightIcon ? (
            <TouchableOpacity onPress={onRightPress} style={styles.iconBtn} hitSlop={12}>
              <IconSymbol name={rightIcon} size={22} color="#fff" />
            </TouchableOpacity>
          ) : (
            <View style={styles.iconBtn} />
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={{ backgroundColor: Colors.light.header }}>
      <LinearGradient
        colors={['#1A1A1A', '#2A2A2A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.container, { paddingTop: insets.top + 8 }]}
      >
        <StatusBar barStyle="light-content" />
        {/* Yellow accent line */}
        <View style={styles.accentBar} />
        <View style={styles.row}>
          {showBack ? (
            <TouchableOpacity onPress={() => router.back()} style={styles.iconBtnYellow} hitSlop={12}>
              <IconSymbol name="chevron.left" size={24} color={Colors.light.primary} />
            </TouchableOpacity>
          ) : (
            <View style={styles.iconBtn} />
          )}
          <Text style={styles.titleYellow} numberOfLines={1}>{title}</Text>
          {rightElement ? rightElement : rightIcon ? (
            <TouchableOpacity onPress={onRightPress} style={styles.iconBtnYellow} hitSlop={12}>
              <IconSymbol name={rightIcon} size={20} color={Colors.light.primary} />
            </TouchableOpacity>
          ) : (
            <View style={styles.iconBtn} />
          )}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 16,
    paddingHorizontal: 8,
  },
  transparent: {
    backgroundColor: 'transparent',
  },
  accentBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: Colors.light.primary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnYellow: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(245, 196, 0, 0.12)',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  titleYellow: {
    flex: 1,
    textAlign: 'center',
    color: Colors.light.primary,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
