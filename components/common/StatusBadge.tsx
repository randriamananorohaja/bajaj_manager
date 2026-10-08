import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

type Props = {
  status: 'actif' | 'inactif' | 'en_service' | 'en_panne' | 'reparation' | 'complet' | 'partiel' | 'impaye';
  size?: 'sm' | 'md';
};

const CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  actif: { label: 'Actif', color: Colors.light.success, bg: '#DCFCE7' },
  inactif: { label: 'Inactif', color: Colors.light.textMuted, bg: '#F3F4F6' },
  en_service: { label: 'En service', color: Colors.light.success, bg: '#DCFCE7' },
  en_panne: { label: 'En panne', color: Colors.light.danger, bg: '#FEE2E2' },
  reparation: { label: 'En réparation', color: Colors.light.warning, bg: '#FEF3C7' },
  complet: { label: 'Complet', color: Colors.light.success, bg: '#DCFCE7' },
  partiel: { label: 'Partiel', color: Colors.light.warning, bg: '#FEF3C7' },
  impaye: { label: 'Impayé', color: Colors.light.danger, bg: '#FEE2E2' },
};

export function StatusBadge({ status, size = 'sm' }: Props) {
  const cfg = CONFIG[status] ?? { label: status, color: Colors.light.textMuted, bg: '#F3F4F6' };
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }, size === 'md' && styles.badgeMd]}>
      <View style={[styles.dot, { backgroundColor: cfg.color }]} />
      <Text style={[styles.text, { color: cfg.color }, size === 'md' && styles.textMd]}>{cfg.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    gap: 4,
  },
  badgeMd: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
  },
  textMd: {
    fontSize: 13,
  },
});
