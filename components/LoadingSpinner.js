import React from 'react';
import { ActivityIndicator } from 'react-native';
import { YStack, Text } from 'tamagui';
import useThemeStore from '../stores/themeStore';
import { lightColors, darkColors } from '../constants/theme';
import { spacing } from '../constants/theme';

export default function LoadingSpinner({ message }) {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;

  return (
    <YStack
      flex={1}
      justifyContent="center"
      alignItems="center"
      backgroundColor={colors.background}
    >
      <ActivityIndicator size="large" color={colors.primary} />
      {message && (
        <Text
          fontSize={14}
          color={colors.textSecondary}
          fontFamily="Inter_400Regular"
          marginTop={spacing.lg}
        >
          {message}
        </Text>
      )}
    </YStack>
  );
}
