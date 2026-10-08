/**
 * Bajaj Manager — Design System Premium
 * Couleurs inspirées des tuk-tuk jaunes de Mahajanga
 */
import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#1A1A1A',
    textSecondary: '#5C5C5C',
    textMuted: '#9A9A9A',
    background: '#FFFBEB',
    card: '#FFFFFF',
    border: '#F5E6A3',
    tint: '#F5C400',
    primary: '#F5C400',
    primaryDark: '#D4A800',
    header: '#1A1A1A',
    headerText: '#F5C400',
    success: '#16A34A',
    warning: '#EAB308',
    danger: '#DC2626',
    icon: '#5C5C5C',
    tabIconDefault: '#9A9A9A',
    tabIconSelected: '#D4A800',
    inputBg: '#FFFDF5',
    progressBg: '#F5E6A3',
    accent: '#FFD54F',
    surface: '#FFF8E1',
  },
  dark: {
    text: '#FAFAF9',
    textSecondary: '#D6D3D1',
    textMuted: '#A8A29E',
    background: '#0C0A09',
    card: '#1C1917',
    border: '#44403C',
    tint: '#F5C400',
    primary: '#F5C400',
    primaryDark: '#D4A800',
    header: '#0C0A09',
    headerText: '#F5C400',
    success: '#22C55E',
    warning: '#EAB308',
    danger: '#EF4444',
    icon: '#A8A29E',
    tabIconDefault: '#78716C',
    tabIconSelected: '#F5C400',
    inputBg: '#1C1917',
    progressBg: '#44403C',
    accent: '#FFD54F',
    surface: '#292524',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const Radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  full: 999,
};

export const Shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  soft: {
    shadowColor: '#F5C400',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
});

export const VERSEMENT_JOURNALIER = 30000;
