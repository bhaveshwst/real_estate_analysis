import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const palette = {
  // Primary brand
  navy: '#0C2340',
  navyLight: '#1A3A5C',
  teal: '#0F6E56',
  tealLight: '#E1F5EE',
  tealMuted: '#9FE1CB',

  // Neutrals
  white: '#FFFFFF',
  gray50: '#F8F9FA',
  gray100: '#F1F3F5',
  gray200: '#E9ECEF',
  gray300: '#DEE2E6',
  gray400: '#ADB5BD',
  gray500: '#6C757D',
  gray600: '#495057',
  gray700: '#343A40',
  gray800: '#212529',
  black: '#000000',

  // Semantic
  success: '#0F6E56',
  warning: '#BA7517',
  danger: '#A32D2D',
  info: '#185FA5',

  // Semantic backgrounds
  successBg: '#E1F5EE',
  warningBg: '#FAEEDA',
  dangerBg: '#FCEBEB',
  infoBg: '#E6F1FB',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
} as const;

export const typography = {
  // Display
  displayLg: { fontSize: 32, lineHeight: 40, fontWeight: '700' as const },
  displayMd: { fontSize: 26, lineHeight: 34, fontWeight: '700' as const },
  displaySm: { fontSize: 22, lineHeight: 28, fontWeight: '600' as const },
  // Headings
  headingLg: { fontSize: 20, lineHeight: 28, fontWeight: '600' as const },
  headingMd: { fontSize: 18, lineHeight: 24, fontWeight: '600' as const },
  headingSm: { fontSize: 16, lineHeight: 22, fontWeight: '600' as const },
  // Body
  bodyLg: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
  bodyMd: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const },
  bodySm: { fontSize: 12, lineHeight: 18, fontWeight: '400' as const },
  // Labels
  labelLg: { fontSize: 14, lineHeight: 20, fontWeight: '500' as const },
  labelMd: { fontSize: 12, lineHeight: 16, fontWeight: '500' as const },
  labelSm: { fontSize: 10, lineHeight: 14, fontWeight: '500' as const },
} as const;

export const shadow = {
  sm: {
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
} as const;

export const layout = {
  screenWidth: SCREEN_WIDTH,
  containerPadding: spacing.lg,
  cardPadding: spacing.lg,
  inputHeight: 48,
  buttonHeight: 48,
  tabBarHeight: 84,
  headerHeight: 56,
} as const;
