import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Colors, Radius } from '@/constants/theme';
import { logout, getSession } from '@/lib/auth';
import { exportVersementsCsv, exportFraisCsv } from '@/lib/export';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function PlusScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [ownerName, setOwnerName] = useState('Propriétaire');
  const [exporting, setExporting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getSession().then((s) => {
        if (s?.name) setOwnerName(s.name);
      });
    }, [])
  );

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Voulez-vous vraiment vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Se déconnecter',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/login');
        },
      },
    ]);
  };

  const handleExportVersements = async () => {
    setExporting(true);
    try {
      await exportVersementsCsv();
    } finally {
      setExporting(false);
    }
  };

  const handleExportFrais = async () => {
    setExporting(true);
    try {
      await exportFraisCsv();
    } finally {
      setExporting(false);
    }
  };

  const menu = [
    {
      section: 'Gestion',
      items: [
        {
          icon: 'wrench.and.screwdriver.fill',
          label: 'Frais & Entretiens',
          value: 'Visite, vidange, réparation',
          route: '/ajouter-frais',
        },
        {
          icon: 'location.fill',
          label: 'GPS — Suivi Bajaj',
          value: 'Enregistrer / consulter positions',
          route: '/gps',
        },
        {
          icon: 'chart.bar.fill',
          label: 'Statistiques',
          value: 'Mensuel · bénéfice · détails',
          route: '/stats',
        },
        {
          icon: 'clock.arrow.circlepath',
          label: 'Historique',
          value: 'Tous les versements et frais',
          route: '/historique',
        },
        {
          icon: 'bell.fill',
          label: 'Notifications',
          route: '/notifications',
        },
      ],
    },
    {
      section: 'Export Excel',
      items: [
        {
          icon: 'square.and.arrow.up',
          label: 'Exporter versements',
          value: 'Fichier CSV ouvrable dans Excel',
          action: 'export_versements',
        },
        {
          icon: 'square.and.arrow.up',
          label: 'Exporter frais',
          value: 'Fichier CSV ouvrable dans Excel',
          action: 'export_frais',
        },
      ],
    },
    {
      section: 'Application',
      items: [
        { icon: 'info.circle', label: 'À propos', value: 'Bajaj Manager v1.0' },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.headerTitle}>Plus</Text>
        <Text style={styles.headerSub}>{ownerName}</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {exporting && (
          <View style={styles.exportBanner}>
            <ActivityIndicator color={Colors.light.primary} />
            <Text style={styles.exportText}>Export en cours…</Text>
          </View>
        )}

        {menu.map((section, si) => (
          <View key={si} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.section}</Text>
            {section.items.map((item: any, ii: number) => (
              <TouchableOpacity
                key={ii}
                style={styles.menuItem}
                activeOpacity={0.7}
                onPress={() => {
                  if (item.route) router.push(item.route as any);
                  else if (item.action === 'export_versements') handleExportVersements();
                  else if (item.action === 'export_frais') handleExportFrais();
                }}
              >
                <View style={styles.menuIcon}>
                  <IconSymbol name={item.icon as any} size={20} color={Colors.light.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  {item.value ? (
                    <Text style={styles.menuValue}>{item.value}</Text>
                  ) : null}
                </View>
                <IconSymbol name="chevron.right" size={16} color={Colors.light.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        ))}

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <IconSymbol
            name="rectangle.portrait.and.arrow.right"
            size={20}
            color={Colors.light.danger}
          />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  header: {
    backgroundColor: Colors.light.header,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: { color: '#F5C400', fontSize: 20, fontWeight: '800', letterSpacing: 0.3 },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 2 },
  exportBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    margin: 16,
    padding: 12,
    backgroundColor: '#FFF8E1',
    borderRadius: Radius.md,
  },
  exportText: { fontSize: 14, color: Colors.light.primary, fontWeight: '600' },
  section: { marginTop: 20, paddingHorizontal: 16 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.textMuted,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: Radius.md,
    padding: 14,
    marginBottom: 8,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFF8E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { fontSize: 15, fontWeight: '600', color: Colors.light.text },
  menuValue: { fontSize: 12, color: Colors.light.textMuted, marginTop: 2 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 32,
    marginHorizontal: 16,
    paddingVertical: 14,
    borderRadius: Radius.md,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutText: { fontSize: 15, fontWeight: '600', color: Colors.light.danger },
});
