// Design tokens and theme configuration
export const theme = {
  colors: {
    // Background colors
    background: {
      light: 'hsl(210 40% 98%)', // slate-50
      dark: 'hsl(222.2 84% 4.9%)', // slate-900
    },
    // Surface/card colors
    surface: {
      light: 'hsl(0 0% 100%)', // white
      dark: 'hsl(222.2 19% 11%)', // slate-800
    },
    // Text colors
    text: {
      light: 'hsl(222.2 84% 4.9%)', // slate-900
      dark: 'hsl(210 40% 98%)', // slate-100
    },
    // Brand colors
    primary: '#0F172A', // navy / slate-900
    accent: '#2563EB', // blue-600
    positive: '#16A34A', // green-600
    negative: '#DC2626', // red-600
    warning: '#F59E0B', // amber-500
    info: '#06B6D4', // cyan-500
  },
  gradients: {
    accent: 'linear-gradient(135deg, rgb(37 99 235 / 0.3) 0%, rgb(99 102 241 / 0.3) 100%)',
  },
  card: {
    borderRadius: '1rem', // rounded-2xl
    padding: {
      mobile: '1.5rem', // p-6
      desktop: '2rem', // p-8
    },
    shadow: {
      light: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', // shadow-md
      dark: 'none',
    },
  },
  header: {
    height: '4rem', // 64px
  },
} as const;

// NFL team colors for logo placeholders
export const teamColors = {
  ATL: '#A71930', // Falcons red
  BAL: '#241773', // Ravens purple
  BUF: '#00338D', // Bills blue
  DAL: '#041E42', // Cowboys navy
  DET: '#0076B6', // Lions blue
  KC: '#E31837', // Chiefs red
  PHI: '#004C54', // Eagles green
  SF: '#AA0000', // 49ers red
  GB: '#203731', // Packers green
  NE: '#002244', // Patriots navy
} as const;

export type TeamCode = keyof typeof teamColors;
