// ─── Design Tokens — Relocation Intelligence ─
// Light theme

export const THEME = {
  colors: {
    // Brand
    primary: '#3730A3',        // indigo-800
    primaryActive: '#4F46E5',  // indigo-600 — pressed/active states
    primaryLight: '#EEF2FF',   // indigo-50  — tag backgrounds, tinted surfaces

    // Backgrounds
    background: '#FFFFFF',      // pure white page background
    surface: '#F8FAFC',         // slate-50   — cards, elevated surfaces
    surfaceElevated: '#F1F5F9', // slate-100  — nested surfaces

    // Text
    text: '#0F172A',           // slate-900  — primary body text
    textSecondary: '#5b6068',  // slate-500  — labels, captions
    textMuted: '#94A3B8',      // slate-400  — placeholder, disabled

    // UI
    border: '#E2E8F0',         // slate-200  — input borders, dividers
    error: '#EF4444',          // red-500
    success: '#22C55E',        // green-500
    successLight: '#DCFCE7',   // green-100  — success tinted backgrounds
    warning: '#F59E0B',        // amber-500

    // Score colors
    scoreExcellent: '#22C55E',
    scoreGood: '#84CC16',
    scoreFair: '#F59E0B',
    scorePoor: '#EF4444',
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  borderRadius: {
    sm: 6,
    md: 12,
    lg: 20,
    full: 9999,
  },

  fontSize: {
    xxs: 9,
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    xxl: 30,
    hero: 38,
  },

  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  shadow: {
    sm: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
    },
  },
} as const;

export type Theme = typeof THEME;
