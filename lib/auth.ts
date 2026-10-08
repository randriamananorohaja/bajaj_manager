/**
 * Authentification propriétaire (utilisateur unique)
 * Session stockée en SQLite — pas besoin d'AsyncStorage
 */
import { getDb, generateId, nowIso } from './database';

/** Identifiants propriétaire (à changer selon besoin) */
export const OWNER_CREDENTIALS = {
  phone: '0340000000',
  password: 'bajaj2026',
  name: 'Propriétaire',
};

async function ensureSessionTable() {
  const db = await getDb();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS session (
      id TEXT PRIMARY KEY NOT NULL,
      phone TEXT NOT NULL,
      name TEXT NOT NULL,
      logged_in_at TEXT NOT NULL
    );
  `);
}

export async function login(phone: string, password: string): Promise<boolean> {
  const p = phone.replace(/\s+/g, '').trim();
  const pwd = password.trim();
  if (p !== OWNER_CREDENTIALS.phone || pwd !== OWNER_CREDENTIALS.password) {
    return false;
  }
  await ensureSessionTable();
  const db = await getDb();
  await db.runAsync('DELETE FROM session');
  await db.runAsync(
    'INSERT INTO session (id, phone, name, logged_in_at) VALUES (?, ?, ?, ?)',
    [generateId(), p, OWNER_CREDENTIALS.name, nowIso()]
  );
  return true;
}

export async function logout(): Promise<void> {
  try {
    await ensureSessionTable();
    const db = await getDb();
    await db.runAsync('DELETE FROM session');
  } catch {
    // ignore
  }
}

export async function isLoggedIn(): Promise<boolean> {
  try {
    await ensureSessionTable();
    const db = await getDb();
    const row = await db.getFirstAsync<{ id: string }>('SELECT id FROM session LIMIT 1');
    return !!row;
  } catch {
    return false;
  }
}

export async function getSession(): Promise<{ phone: string; name: string } | null> {
  try {
    await ensureSessionTable();
    const db = await getDb();
    const row = await db.getFirstAsync<{ phone: string; name: string }>(
      'SELECT phone, name FROM session LIMIT 1'
    );
    return row ?? null;
  } catch {
    return null;
  }
}
