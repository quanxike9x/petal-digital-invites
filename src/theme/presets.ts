import type { ThemePreset, ThemeTokens } from '../types/theme';

/**
 * DEFAULT BASE THEME TOKENS
 */
export const DEFAULT_THEME_TOKENS: ThemeTokens = {
  id: 'luxury-gold',
  name: 'Luxury Gold',
  typography: {
    fontFamily: 'Playfair Display, serif',
    headingFontFamily: 'Playfair Display, serif',
    fontSize: {
      xs: '12px',
      sm: '14px',
      md: '16px',
      lg: '20px',
      xl: '24px',
      '2xl': '32px',
      '3xl': '48px',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.8,
    },
    letterSpacing: {
      normal: '0em',
      wide: '0.05em',
      wider: '0.1em',
    },
  },
  colors: {
    primary: '#d4af37',
    secondary: '#8a6d1c',
    accent: '#f3e5ab',
    surface: '#ffffff',
    background: '#faf8f5',
    text: '#1c1917',
    textSecondary: '#78716c',
    border: '#e7e5e4',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  radius: {
    none: '0px',
    sm: '4px',
    md: '8px',
    lg: '16px',
    xl: '24px',
    full: '9999px',
  },
  shadow: {
    none: 'none',
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  },
  animation: {},
};

/**
 * BUILT-IN MARKETPLACE-READY THEME PRESETS LIST
 */
export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'luxury-gold',
    name: 'Luxury Gold',
    description: 'Phong cách sang trọng cổ điển với tông Vàng Kim & Kem hoàng gia',
    thumbnail: 'linear-gradient(135deg, #1c1917 0%, #d4af37 50%, #faf8f5 100%)',
    tokens: DEFAULT_THEME_TOKENS,
  },
  {
    id: 'minimal-white',
    name: 'Minimal White',
    description: 'Phong cách tối giản hiện đại với phông nền Trắng tinh khôi & Đen xám',
    thumbnail: 'linear-gradient(135deg, #0f172a 0%, #38bdf8 50%, #f8fafc 100%)',
    tokens: {
      ...DEFAULT_THEME_TOKENS,
      id: 'minimal-white',
      name: 'Minimal White',
      typography: {
        ...DEFAULT_THEME_TOKENS.typography,
        fontFamily: 'Be Vietnam Pro, sans-serif',
        headingFontFamily: 'Be Vietnam Pro, sans-serif',
      },
      colors: {
        primary: '#0f172a',
        secondary: '#475569',
        accent: '#38bdf8',
        surface: '#ffffff',
        background: '#f8fafc',
        text: '#020617',
        textSecondary: '#64748b',
        border: '#e2e8f0',
      },
    },
  },
  {
    id: 'forest-green',
    name: 'Forest Green',
    description: 'Phong cách thiên nhiên tươi mát với tông Xanh Lá Xông & Xanh Sage',
    thumbnail: 'linear-gradient(135deg, #1b4332 0%, #52b788 50%, #f4f7f5 100%)',
    tokens: {
      ...DEFAULT_THEME_TOKENS,
      id: 'forest-green',
      name: 'Forest Green',
      typography: {
        ...DEFAULT_THEME_TOKENS.typography,
        fontFamily: 'Montserrat, sans-serif',
        headingFontFamily: 'Montserrat, sans-serif',
      },
      colors: {
        primary: '#1b4332',
        secondary: '#2d6a4f',
        accent: '#52b788',
        surface: '#ffffff',
        background: '#f4f7f5',
        text: '#081c15',
        textSecondary: '#52b788',
        border: '#d8f3dc',
      },
    },
  },
  {
    id: 'classic-rose',
    name: 'Classic Rose',
    description: 'Phong cách lãng mạn mộng mơ với sắc Hồng San Hô & Hồng Phấn',
    thumbnail: 'linear-gradient(135deg, #e63946 0%, #ffb703 50%, #fff0f3 100%)',
    tokens: {
      ...DEFAULT_THEME_TOKENS,
      id: 'classic-rose',
      name: 'Classic Rose',
      typography: {
        ...DEFAULT_THEME_TOKENS.typography,
        fontFamily: 'Playfair Display, serif',
        headingFontFamily: 'Dancing Script, cursive',
      },
      colors: {
        primary: '#e63946',
        secondary: '#b5179e',
        accent: '#ffb703',
        surface: '#ffffff',
        background: '#fff0f3',
        text: '#590d22',
        textSecondary: '#a30015',
        border: '#ffccd5',
      },
    },
  },
  {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    description: 'Phong cách biển cả thanh lịch với Xanh Hải Quân & Xanh Ngọc',
    thumbnail: 'linear-gradient(135deg, #1d3557 0%, #457b9d 50%, #f1faee 100%)',
    tokens: {
      ...DEFAULT_THEME_TOKENS,
      id: 'ocean-blue',
      name: 'Ocean Blue',
      typography: {
        ...DEFAULT_THEME_TOKENS.typography,
        fontFamily: 'Be Vietnam Pro, sans-serif',
        headingFontFamily: 'Be Vietnam Pro, sans-serif',
      },
      colors: {
        primary: '#1d3557',
        secondary: '#457b9d',
        accent: '#a8dadc',
        surface: '#ffffff',
        background: '#f1faee',
        text: '#1d3557',
        textSecondary: '#457b9d',
        border: '#a8dadc',
      },
    },
  },
];
