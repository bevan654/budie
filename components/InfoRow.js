import React from 'react';
import { XStack, Text } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import useThemeStore from '../stores/themeStore';
import { lightColors, darkColors } from '../constants/theme';
import { spacing } from '../constants/theme';

export default function InfoRow({ label, value, icon }) {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;

  return (
    <XStack
      justifyContent="space-between"
      alignItems="center"
      paddingVertical={spacing.sm}
      borderBottomWidth={0.5}
      borderBottomColor={colors.border}
    >
      <XStack alignItems="center" gap={spacing.sm}>
        {icon && (
          <Ionicons name={icon} size={18} color={colors.textSecondary} />
        )}
        <Text
          fontSize={16}
          color={colors.textSecondary}
          fontFamily="Inter_400Regular"
        >
          {label}
        </Text>
      </XStack>
      <Text
        fontSize={16}
        color={colors.textPrimary}
        fontFamily="Inter_500Medium"
      >
        {value}
      </Text>
    </XStack>
  );
}
