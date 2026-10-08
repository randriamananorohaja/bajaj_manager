export type BajajStatut = 'en_service' | 'en_panne' | 'reparation';
export type ChauffeurStatut = 'actif' | 'inactif';
export type VersementStatut = 'complet' | 'partiel' | 'impaye';
export type FraisType = 'visite' | 'vidange' | 'reparation' | 'autre';

export interface Bajaj {
  id: string;
  marque: string;
  matricule: string;
  chauffeur_id: string | null;
  statut: BajajStatut | string;
  photo?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Chauffeur {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  adresse?: string | null;
  cin?: string | null;
  photo?: string | null;
  statut: ChauffeurStatut | string;
  created_at: string;
  updated_at: string;
}

export interface Versement {
  id: string;
  bajaj_id: string;
  chauffeur_id: string;
  date: string;
  heure: string;
  montant_recu: number;
  montant_attendu: number;
  montant_restant: number;
  statut: VersementStatut | string;
  note?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Frais {
  id: string;
  type: FraisType | string;
  bajaj_id: string;
  chauffeur_id?: string | null;
  date: string;
  heure: string;
  description?: string | null;
  piece?: string | null;
  montant: number;
  cause?: string | null;
  photo?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Position {
  id: string;
  bajaj_id: string;
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  note?: string | null;
  created_at: string;
}

export const BAJAJ_STATUTS: { value: BajajStatut; label: string }[] = [
  { value: 'en_service', label: 'En service' },
  { value: 'en_panne', label: 'En panne' },
  { value: 'reparation', label: 'En réparation' },
];

export const FRAIS_TYPES: { value: FraisType; label: string }[] = [
  { value: 'visite', label: 'Visite technique' },
  { value: 'vidange', label: 'Vidange' },
  { value: 'reparation', label: 'Réparation' },
  { value: 'autre', label: 'Autre' },
];

export const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
] as const;
