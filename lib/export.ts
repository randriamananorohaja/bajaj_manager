/**
 * Export CSV des versements et frais (ouvrable dans Excel)
 */
import { Alert, Platform } from 'react-native';
import { getVersements, getFrais, getBajajs, getChauffeurs } from './api';

let FileSystem: any = null;
let Sharing: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  FileSystem = require('expo-file-system');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Sharing = require('expo-sharing');
} catch {
  /* optional */
}

function csvEscape(v: string | number | null | undefined): string {
  const s = String(v ?? '');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function exportVersementsCsv(): Promise<boolean> {
  try {
    const [versements, bajajs, chauffeurs] = await Promise.all([
      getVersements(),
      getBajajs(),
      getChauffeurs(),
    ]);

    const bajajMap = Object.fromEntries(bajajs.map((b) => [b.id, b.matricule]));
    const chMap = Object.fromEntries(
      chauffeurs.map((c) => [c.id, `${c.prenom} ${c.nom}`])
    );

    const header = [
      'Date',
      'Heure',
      'Matricule',
      'Chauffeur',
      'Montant reçu',
      'Montant attendu',
      'Reste',
      'Statut',
      'Note',
    ].join(',');

    const rows = versements.map((v) =>
      [
        v.date,
        v.heure,
        bajajMap[v.bajaj_id] ?? '',
        chMap[v.chauffeur_id] ?? '',
        v.montant_recu,
        v.montant_attendu,
        v.montant_restant,
        v.statut,
        v.note ?? '',
      ]
        .map(csvEscape)
        .join(',')
    );

    const csv = '\uFEFF' + [header, ...rows].join('\n'); // BOM for Excel
    return await shareCsv(csv, `versements_${new Date().toISOString().slice(0, 10)}.csv`);
  } catch (e) {
    Alert.alert('Erreur', 'Impossible d\'exporter les versements');
    return false;
  }
}

export async function exportFraisCsv(): Promise<boolean> {
  try {
    const [frais, bajajs] = await Promise.all([getFrais(), getBajajs()]);
    const bajajMap = Object.fromEntries(bajajs.map((b) => [b.id, b.matricule]));

    const header = [
      'Date',
      'Heure',
      'Type',
      'Matricule',
      'Montant',
      'Pièce',
      'Cause',
      'Description',
    ].join(',');

    const rows = frais.map((f) =>
      [
        f.date,
        f.heure,
        f.type,
        bajajMap[f.bajaj_id] ?? '',
        f.montant,
        f.piece ?? '',
        f.cause ?? '',
        f.description ?? '',
      ]
        .map(csvEscape)
        .join(',')
    );

    const csv = '\uFEFF' + [header, ...rows].join('\n');
    return await shareCsv(csv, `frais_${new Date().toISOString().slice(0, 10)}.csv`);
  } catch {
    Alert.alert('Erreur', 'Impossible d\'exporter les frais');
    return false;
  }
}

async function shareCsv(content: string, filename: string): Promise<boolean> {
  if (!FileSystem || !Sharing) {
    Alert.alert(
      'Export',
      'Les modules expo-file-system et expo-sharing sont requis.\nInstallez-les avec :\nnpx expo install expo-file-system expo-sharing'
    );
    return false;
  }

  const dir = FileSystem.cacheDirectory || FileSystem.documentDirectory;
  const path = `${dir}${filename}`;
  await FileSystem.writeAsStringAsync(path, content, {
    encoding: FileSystem.EncodingType?.UTF8 ?? 'utf8',
  });

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    Alert.alert('Export', `Fichier enregistré : ${path}`);
    return true;
  }

  await Sharing.shareAsync(path, {
    mimeType: 'text/csv',
    dialogTitle: 'Exporter vers Excel',
    UTI: 'public.comma-separated-values-text',
  });
  return true;
}
