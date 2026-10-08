import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const AVATAR_COLORS = ['#EA580C', '#22C55E', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#EF4444'];

type Props = {
  firstName: string;
  lastName: string;
  size?: number;
  uri?: string | null;
};

export function Avatar({ firstName, lastName, size = 44, uri }: Props) {
  const initials = `${(firstName || '?').charAt(0)}${(lastName || '?').charAt(0)}`.toUpperCase();
  const colorIndex =
    ((firstName || '').charCodeAt(0) + (lastName || '').charCodeAt(0)) % AVATAR_COLORS.length;
  const bg = AVATAR_COLORS[colorIndex];

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg }}
      />
    );
  }

  return (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: bg },
      ]}
    >
      <Text style={[styles.initials, { fontSize: size * 0.36 }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: { alignItems: 'center', justifyContent: 'center' },
  initials: { color: '#fff', fontWeight: '700' },
});
