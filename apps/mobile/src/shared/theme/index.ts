// ─── Design Tokens — Relocation Intelligence ─
// Dark-first mobile theme

export const THEME = {
  colors: {
    // Brand
    primary: '#6366f1',      // indigo-500
    primaryDark: '#4f46e5',  // indigo-600
    accent: '#22d3ee',       // cyan-400

    // Backgrounds
    background: '#0f172a',   // slate-900
    surface: '#1e293b',      // slate-800
    surfaceElevated: '#334155', // slate-700

    // Text
    text: '#f1f5f9',         // slate-100
    textSecondary: '#94a3b8', // slate-400
    textMuted: '#64748b',    // slate-500

    // UI
    border: '#334155',       // slate-700
    error: '#ef4444',        // red-500
    success: '#22c55e',      // green-500
    warning: '#f59e0b',      // amber-500

    // Score colors
    scoreExcellent: '#22c55e',
    scoreGood: '#84cc16',
    scoreFair: '#f59e0b',
    scorePoor: '#ef4444',
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
} as const;

export type Theme = typeof THEME;
