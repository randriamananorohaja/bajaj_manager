/**
 * API Bajaj Manager — couche d'accès aux données (SQLite local)
 */
import { getDb, generateId, nowIso } from './database';
import type {
  Bajaj,
  Chauffeur,
  Versement,
  Frais,
  BajajStatut,
  ChauffeurStatut,
  VersementStatut,
  FraisType,
} from './types';
import { VERSEMENT_JOURNALIER } from '@/constants/theme';

// ─── Chauffeurs ──────────────────────────────────────────

export async function getChauffeurs(): Promise<Chauffeur[]> {
  const db = await getDb();
  return (
    (await db.getAllAsync<Chauffeur>(
      'SELECT * FROM chauffeurs ORDER BY nom ASC, prenom ASC'
    )) ?? []
  );
}

export async function getChauffeur(id: string): Promise<Chauffeur | null> {
  const db = await getDb();
  return (
    (await db.getFirstAsync<Chauffeur>('SELECT * FROM chauffeurs WHERE id = ?', [id])) ?? null
  );
}

export async function createChauffeur(
  data: Partial<Chauffeur> & { nom: string; prenom: string }
): Promise<Chauffeur | null> {
  const db = await getDb();
  const id = generateId();
  const now = nowIso();
  await db.runAsync(
    `INSERT INTO chauffeurs (id, nom, prenom, telephone, adresse, cin, photo, statut, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.nom,
      data.prenom,
      data.telephone ?? '',
      data.adresse ?? null,
      data.cin ?? null,
      data.photo ?? null,
      data.statut ?? 'actif',
      now,
      now,
    ]
  );
  return getChauffeur(id);
}

export async function updateChauffeur(
  id: string,
  updates: Partial<Chauffeur>
): Promise<Chauffeur | null> {
  const db = await getDb();
  const allowed = ['nom', 'prenom', 'telephone', 'adresse', 'cin', 'photo', 'statut'];
  const fields: string[] = [];
  const values: any[] = [];
  for (const [k, v] of Object.entries(updates)) {
    if (!allowed.includes(k)) continue;
    fields.push(`${k} = ?`);
    values.push(v);
  }
  if (fields.length === 0) return getChauffeur(id);
  fields.push('updated_at = ?');
  values.push(nowIso());
  values.push(id);
  await db.runAsync(`UPDATE chauffeurs SET ${fields.join(', ')} WHERE id = ?`, values);
  return getChauffeur(id);
}

export async function deleteChauffeur(id: string): Promise<boolean> {
  const db = await getDb();
  // Désassigner des Bajaj
  await db.runAsync('UPDATE bajajs SET chauffeur_id = NULL WHERE chauffeur_id = ?', [id]);
  const result = await db.runAsync('DELETE FROM chauffeurs WHERE id = ?', [id]);
  return (result.changes ?? 0) > 0;
}

// ─── Bajajs ──────────────────────────────────────────────

export async function getBajajs(): Promise<Bajaj[]> {
  const db = await getDb();
  return (
    (await db.getAllAsync<Bajaj>('SELECT * FROM bajajs ORDER BY matricule ASC')) ?? []
  );
}

export async function getBajaj(id: string): Promise<Bajaj | null> {
  const db = await getDb();
  return (await db.getFirstAsync<Bajaj>('SELECT * FROM bajajs WHERE id = ?', [id])) ?? null;
}

export async function createBajaj(
  data: Partial<Bajaj> & { marque: string; matricule: string }
): Promise<Bajaj | null> {
  const db = await getDb();
  const id = generateId();
  const now = nowIso();
  await db.runAsync(
    `INSERT INTO bajajs (id, marque, matricule, chauffeur_id, statut, photo, notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.marque,
      data.matricule,
      data.chauffeur_id ?? null,
      data.statut ?? 'en_service',
      data.photo ?? null,
      data.notes ?? null,
      now,
      now,
    ]
  );
  return getBajaj(id);
}

export async function updateBajaj(id: string, updates: Partial<Bajaj>): Promise<Bajaj | null> {
  const db = await getDb();
  const allowed = ['marque', 'matricule', 'chauffeur_id', 'statut', 'photo', 'notes'];
  const fields: string[] = [];
  const values: any[] = [];
  for (const [k, v] of Object.entries(updates)) {
    if (!allowed.includes(k)) continue;
    fields.push(`${k} = ?`);
    values.push(v);
  }
  if (fields.length === 0) return getBajaj(id);
  fields.push('updated_at = ?');
  values.push(nowIso());
  values.push(id);
  await db.runAsync(`UPDATE bajajs SET ${fields.join(', ')} WHERE id = ?`, values);
  return getBajaj(id);
}

export async function deleteBajaj(id: string): Promise<boolean> {
  const db = await getDb();
  await db.runAsync('DELETE FROM versements WHERE bajaj_id = ?', [id]);
  await db.runAsync('DELETE FROM frais WHERE bajaj_id = ?', [id]);
  const result = await db.runAsync('DELETE FROM bajajs WHERE id = ?', [id]);
  return (result.changes ?? 0) > 0;
}

// ─── Versements ──────────────────────────────────────────

export async function getVersements(): Promise<Versement[]> {
  const db = await getDb();
  return (
    (await db.getAllAsync<Versement>(
      'SELECT * FROM versements ORDER BY date DESC, heure DESC'
    )) ?? []
  );
}

export async function getVersementsByDate(date: string): Promise<Versement[]> {
  const db = await getDb();
  return (
    (await db.getAllAsync<Versement>(
      'SELECT * FROM versements WHERE date = ? ORDER BY heure DESC',
      [date]
    )) ?? []
  );
}

export async function getVersement(id: string): Promise<Versement | null> {
  const db = await getDb();
  return (
    (await db.getFirstAsync<Versement>('SELECT * FROM versements WHERE id = ?', [id])) ?? null
  );
}

function computeStatut(recu: number, attendu: number): VersementStatut {
  if (recu >= attendu) return 'complet';
  if (recu > 0) return 'partiel';
  return 'impaye';
}

export async function createVersement(
  data: Partial<Versement> & {
    bajaj_id: string;
    chauffeur_id: string;
    date: string;
    montant_recu: number;
  }
): Promise<Versement | null> {
  const db = await getDb();
  const id = generateId();
  const now = nowIso();
  const attendu = data.montant_attendu ?? VERSEMENT_JOURNALIER;
  const recu = data.montant_recu;
  const restant = Math.max(0, attendu - recu);
  const statut = computeStatut(recu, attendu);
  const heure =
    data.heure ??
    new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  await db.runAsync(
    `INSERT INTO versements (
      id, bajaj_id, chauffeur_id, date, heure, montant_recu, montant_attendu,
      montant_restant, statut, note, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.bajaj_id,
      data.chauffeur_id,
      data.date,
      heure,
      recu,
      attendu,
      restant,
      statut,
      data.note ?? null,
      now,
      now,
    ]
  );
  return getVersement(id);
}

export async function updateVersement(
  id: string,
  updates: Partial<Versement>
): Promise<Versement | null> {
  const db = await getDb();
  const current = await getVersement(id);
  if (!current) return null;

  const recu = updates.montant_recu ?? current.montant_recu;
  const attendu = updates.montant_attendu ?? current.montant_attendu;
  const restant = Math.max(0, attendu - recu);
  const statut = computeStatut(recu, attendu);

  const allowed = ['bajaj_id', 'chauffeur_id', 'date', 'heure', 'note'];
  const fields: string[] = [
    'montant_recu = ?',
    'montant_attendu = ?',
    'montant_restant = ?',
    'statut = ?',
  ];
  const values: any[] = [recu, attendu, restant, statut];

  for (const [k, v] of Object.entries(updates)) {
    if (!allowed.includes(k)) continue;
    fields.push(`${k} = ?`);
    values.push(v);
  }
  fields.push('updated_at = ?');
  values.push(nowIso());
  values.push(id);
  await db.runAsync(`UPDATE versements SET ${fields.join(', ')} WHERE id = ?`, values);
  return getVersement(id);
}

export async function deleteVersement(id: string): Promise<boolean> {
  const db = await getDb();
  const result = await db.runAsync('DELETE FROM versements WHERE id = ?', [id]);
  return (result.changes ?? 0) > 0;
}

// ─── Frais ───────────────────────────────────────────────

export async function getFrais(): Promise<Frais[]> {
  const db = await getDb();
  return (
    (await db.getAllAsync<Frais>('SELECT * FROM frais ORDER BY date DESC, heure DESC')) ?? []
  );
}

export async function getFraisItem(id: string): Promise<Frais | null> {
  const db = await getDb();
  return (await db.getFirstAsync<Frais>('SELECT * FROM frais WHERE id = ?', [id])) ?? null;
}

export async function createFrais(
  data: Partial<Frais> & { type: FraisType | string; bajaj_id: string; date: string; montant: number }
): Promise<Frais | null> {
  const db = await getDb();
  const id = generateId();
  const now = nowIso();
  const heure =
    data.heure ??
    new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  await db.runAsync(
    `INSERT INTO frais (
      id, type, bajaj_id, chauffeur_id, date, heure, description, piece,
      montant, cause, photo, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.type,
      data.bajaj_id,
      data.chauffeur_id ?? null,
      data.date,
      heure,
      data.description ?? null,
      data.piece ?? null,
      data.montant,
      data.cause ?? null,
      data.photo ?? null,
      now,
      now,
    ]
  );
  return getFraisItem(id);
}

export async function updateFrais(id: string, updates: Partial<Frais>): Promise<Frais | null> {
  const db = await getDb();
  const allowed = [
    'type',
    'bajaj_id',
    'chauffeur_id',
    'date',
    'heure',
    'description',
    'piece',
    'montant',
    'cause',
    'photo',
  ];
  const fields: string[] = [];
  const values: any[] = [];
  for (const [k, v] of Object.entries(updates)) {
    if (!allowed.includes(k)) continue;
    fields.push(`${k} = ?`);
    values.push(v);
  }
  if (fields.length === 0) return getFraisItem(id);
  fields.push('updated_at = ?');
  values.push(nowIso());
  values.push(id);
  await db.runAsync(`UPDATE frais SET ${fields.join(', ')} WHERE id = ?`, values);
  return getFraisItem(id);
}

export async function deleteFrais(id: string): Promise<boolean> {
  const db = await getDb();
  const result = await db.runAsync('DELETE FROM frais WHERE id = ?', [id]);
  return (result.changes ?? 0) > 0;
}

// ─── Stats Dashboard ─────────────────────────────────────

export async function getDashboardStats() {
  const db = await getDb();
  const today = new Date().toISOString().slice(0, 10);

  const bajajs = (await db.getAllAsync<Bajaj>('SELECT * FROM bajajs')) ?? [];
  const chauffeurs =
    (await db.getAllAsync<Chauffeur>("SELECT * FROM chauffeurs WHERE statut = 'actif'")) ?? [];
  const versementsToday =
    (await db.getAllAsync<Versement>('SELECT * FROM versements WHERE date = ?', [today])) ?? [];

  const totalRecu = versementsToday.reduce((s, v) => s + v.montant_recu, 0);
  const totalAttendu = bajajs.filter((b) => b.statut === 'en_service').length * VERSEMENT_JOURNALIER;
  const impayes = versementsToday.filter((v) => v.statut !== 'complet').length;
  const complets = versementsToday.filter((v) => v.statut === 'complet').length;

  return {
    bajajCount: bajajs.length,
    bajajEnService: bajajs.filter((b) => b.statut === 'en_service').length,
    chauffeurCount: chauffeurs.length,
    versementsToday: versementsToday.length,
    totalRecu,
    totalAttendu,
    impayes,
    complets,
    versementsTodayList: versementsToday,
  };
}

// ─── Positions GPS ───────────────────────────────────────

export async function getPositions(bajajId?: string): Promise<import('./types').Position[]> {
  const db = await getDb();
  if (bajajId) {
    return (
      (await db.getAllAsync(
        'SELECT * FROM positions WHERE bajaj_id = ? ORDER BY created_at DESC',
        [bajajId]
      )) ?? []
    );
  }
  return (
    (await db.getAllAsync('SELECT * FROM positions ORDER BY created_at DESC LIMIT 100')) ?? []
  );
}

export async function getLatestPosition(bajajId: string): Promise<import('./types').Position | null> {
  const db = await getDb();
  return (
    (await db.getFirstAsync(
      'SELECT * FROM positions WHERE bajaj_id = ? ORDER BY created_at DESC LIMIT 1',
      [bajajId]
    )) ?? null
  );
}

export async function savePosition(data: {
  bajaj_id: string;
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  note?: string | null;
}): Promise<import('./types').Position | null> {
  const db = await getDb();
  const id = generateId();
  const now = nowIso();
  await db.runAsync(
    `INSERT INTO positions (id, bajaj_id, latitude, longitude, accuracy, note, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, data.bajaj_id, data.latitude, data.longitude, data.accuracy ?? null, data.note ?? null, now]
  );
  return (
    (await db.getFirstAsync('SELECT * FROM positions WHERE id = ?', [id])) ?? null
  );
}

export async function deletePosition(id: string): Promise<boolean> {
  const db = await getDb();
  const result = await db.runAsync('DELETE FROM positions WHERE id = ?', [id]);
  return (result.changes ?? 0) > 0;
}

// ─── Stats mensuelles ────────────────────────────────────

export async function getMonthlyStats(year: number, month: number) {
  const db = await getDb();
  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  const versements =
    (await db.getAllAsync<import('./types').Versement>(
      `SELECT * FROM versements WHERE date LIKE ?`,
      [`${prefix}%`]
    )) ?? [];
  const fraisList =
    (await db.getAllAsync<import('./types').Frais>(
      `SELECT * FROM frais WHERE date LIKE ?`,
      [`${prefix}%`]
    )) ?? [];

  const totalRecu = versements.reduce((s, v) => s + v.montant_recu, 0);
  const totalFrais = fraisList.reduce((s, f) => s + f.montant, 0);
  const complets = versements.filter((v) => v.statut === 'complet').length;
  const partiels = versements.filter((v) => v.statut === 'partiel').length;
  const impayes = versements.filter((v) => v.statut === 'impaye').length;

  return {
    totalRecu,
    totalFrais,
    benefice: totalRecu - totalFrais,
    versementsCount: versements.length,
    complets,
    partiels,
    impayes,
    fraisCount: fraisList.length,
  };
}
