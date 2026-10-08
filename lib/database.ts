/**
 * Base de données locale SQLite — Bajaj Manager
 * Fonctionne hors ligne, sans configuration externe.
 */
import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('bajaj_manager.db');
  await initSchema(db);
  return db;
}

async function initSchema(database: SQLite.SQLiteDatabase) {
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS chauffeurs (
      id TEXT PRIMARY KEY NOT NULL,
      nom TEXT NOT NULL,
      prenom TEXT NOT NULL,
      telephone TEXT NOT NULL DEFAULT '',
      adresse TEXT,
      cin TEXT,
      photo TEXT,
      statut TEXT NOT NULL DEFAULT 'actif',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS bajajs (
      id TEXT PRIMARY KEY NOT NULL,
      marque TEXT NOT NULL DEFAULT '',
      matricule TEXT NOT NULL,
      chauffeur_id TEXT,
      statut TEXT NOT NULL DEFAULT 'en_service',
      photo TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (chauffeur_id) REFERENCES chauffeurs(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS versements (
      id TEXT PRIMARY KEY NOT NULL,
      bajaj_id TEXT NOT NULL,
      chauffeur_id TEXT NOT NULL,
      date TEXT NOT NULL,
      heure TEXT NOT NULL,
      montant_recu REAL NOT NULL DEFAULT 0,
      montant_attendu REAL NOT NULL DEFAULT 30000,
      montant_restant REAL NOT NULL DEFAULT 30000,
      statut TEXT NOT NULL DEFAULT 'impaye',
      note TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (bajaj_id) REFERENCES bajajs(id) ON DELETE CASCADE,
      FOREIGN KEY (chauffeur_id) REFERENCES chauffeurs(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS frais (
      id TEXT PRIMARY KEY NOT NULL,
      type TEXT NOT NULL DEFAULT 'autre',
      bajaj_id TEXT NOT NULL,
      chauffeur_id TEXT,
      date TEXT NOT NULL,
      heure TEXT NOT NULL DEFAULT '',
      description TEXT,
      piece TEXT,
      montant REAL NOT NULL DEFAULT 0,
      cause TEXT,
      photo TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (bajaj_id) REFERENCES bajajs(id) ON DELETE CASCADE,
      FOREIGN KEY (chauffeur_id) REFERENCES chauffeurs(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS positions (
      id TEXT PRIMARY KEY NOT NULL,
      bajaj_id TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      accuracy REAL,
      note TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (bajaj_id) REFERENCES bajajs(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      body TEXT,
      icon TEXT,
      color TEXT,
      read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
  `);
}

export function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function nowIso(): string {
  return new Date().toISOString();
}
