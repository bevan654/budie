import React from 'react';
import { XStack, YStack, Text, View } from 'tamagui';
import useThemeStore from '../stores/themeStore';
import { lightColors, darkColors } from '../constants/theme';
import { spacing } from '../constants/theme';

export default function SignUpProgressBar({ currentStep, totalSteps = 7 }) {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;

  return (
    <YStack marginBottom={spacing.xxl}>
      <Text
        fontSize={11}
        fontFamily="Inter_400Regular"
        letterSpacing={0.1}
        color={colors.textTertiary}
        marginBottom={spacing.sm}
      >
        Step {currentStep} of {totalSteps}
      </Text>
      <XStack gap={4}>
        {Array.from({ length: totalSteps }, (_, i) => (
          <View
            key={i}
            flex={1}
            height={4}
            borderRadius={2}
            backgroundColor={i < currentStep ? colors.primary : colors.border}
          />
        ))}
      </XStack>
    </YStack>
  );
}
