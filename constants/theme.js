export const lightColors = {
  primary: '#1E319D',
  primaryLight: '#E8EAF6',
  background: '#FAFAFA',
  backgroundSecondary: '#F1F3F8',
  cardBackground: '#FFFFFF',
  border: '#E8EAF6',
  borderDark: '#D1D5DB',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textLight: '#D1D5DB',
  error: '#DC2626',
  errorLight: '#FEE2E2',
  success: '#059669',
  successLight: '#ECFDF5',
  white: '#FFFFFF',
  black: '#000000',
  grey: '#6B7280',
  greyLight: '#F3F4F6',
  imagePlaceholder: '#E5E7EB',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  purple: '#8B5CF6',
  purpleLight: '#EDE9FE',
  likeGreen: '#00D46A',
  dislikeRed: '#FF4458',
};

export const darkColors = {
  primary: '#6C7BF0',
  primaryLight: '#1E2A5E',
  background: '#0F1117',
  backgroundSecondary: '#1A1D2E',
  cardBackground: '#1A1D2E',
  border: '#2A2D3E',
  borderDark: '#3A3D4E',
  textPrimary: '#F1F3F8',
  textSecondary: '#9CA3AF',
  textTertiary: '#6B7280',
  textLight: '#3A3D4E',
  error: '#F87171',
  errorLight: '#3B1515',
  success: '#34D399',
  successLight: '#0D2818',
  white: '#FFFFFF',
  black: '#000000',
  grey: '#9CA3AF',
  greyLight: '#1A1D2E',
  imagePlaceholder: '#2A2D3E',
  warning: '#FBBF24',
  warningLight: '#78350F',
  purple: '#A78BFA',
  purpleLight: '#2E1065',
  likeGreen: '#00D46A',
  dislikeRed: '#FF4458',
};

// Default export for backward compat (ErrorBoundary class component)
export const colors = lightColors;

export const fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extraBold: 'Inter_800ExtraBold',
};

export const typography = {
  h1: { fontSize: 28, fontFamily: fonts.bold, letterSpacing: -0.3 },
  h2: { fontSize: 24, fontFamily: fonts.bold, letterSpacing: -0.2 },
  h3: { fontSize: 20, fontFamily: fonts.semiBold, letterSpacing: -0.1 },
  h4: { fontSize: 17, fontFamily: fonts.semiBold, letterSpacing: 0 },
  h5: { fontSize: 15, fontFamily: fonts.semiBold, letterSpacing: 0 },
  h6: { fontSize: 13, fontFamily: fonts.semiBold, letterSpacing: 0.1 },
  body: { fontSize: 15, fontFamily: fonts.regular, lineHeight: 22 },
  bodyLarge: { fontSize: 16, fontFamily: fonts.regular, lineHeight: 24 },
  bodySmall: { fontSize: 13, fontFamily: fonts.regular, lineHeight: 18 },
  label: { fontSize: 13, fontFamily: fonts.medium, letterSpacing: 0.2 },
  caption: { fontSize: 11, fontFamily: fonts.regular, letterSpacing: 0.1 },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const borderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  xxl: 22,
  full: 9999,
};

export const getShadows = (isDark) => ({
  sm: {
    shadowColor: isDark ? '#000' : '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0.3 : 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: isDark ? '#000' : '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.4 : 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  lg: {
    shadowColor: isDark ? '#000' : '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.5 : 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
});

export const shadows = getShadows(false);

export const getButtonStyles = (colors) => ({
  primary: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  secondary: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  outline: {
    backgroundColor: 'transparent',
    borderRadius: borderRadius.md,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  danger: {
    backgroundColor: 'transparent',
    borderRadius: borderRadius.md,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: colors.error,
  },
});

export const buttonStyles = getButtonStyles(lightColors);

export const getInputStyles = (colors) => ({
  default: {
    backgroundColor: colors.backgroundSecondary,
    padding: 14,
    borderRadius: borderRadius.md,
    fontSize: 15,
    fontFamily: fonts.regular,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
});

export const inputStyles = getInputStyles(lightColors);

export const getCardStyles = (colors) => ({
  default: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
});

export const cardStyles = getCardStyles(lightColors);
