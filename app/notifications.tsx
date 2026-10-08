import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';
import { Header } from '@/components/common/Header';
import { EmptyState } from '@/components/common/EmptyState';

export default function NotificationsScreen() {
  return (
    <View style={styles.container}>
      <Header title="Notifications" showBack />
      <EmptyState message="Aucune notification pour le moment" icon="bell.fill" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
});
