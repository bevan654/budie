import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { XStack, Text } from 'tamagui';
import useThemeStore from '../stores/themeStore';
import { lightColors, darkColors } from '../constants/theme';
import { borderRadius, spacing } from '../constants/theme';
import { hapticSelection } from '../utils/haptics';

export default function FilterChip({ label, selected, onPress }) {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;

  const handlePress = () => {
    hapticSelection();
    onPress?.();
  };

  return (
    <XStack
      alignItems="center"
      paddingHorizontal={16}
      paddingVertical={10}
      borderRadius={borderRadius.full}
      backgroundColor={selected ? colors.primary : colors.backgroundSecondary}
      borderWidth={1.5}
      borderColor={selected ? colors.primary : colors.border}
      marginRight={spacing.sm}
      marginBottom={spacing.sm}
      pressStyle={{ opacity: 0.7 }}
      animation="fast"
      onPress={handlePress}
      cursor="pointer"
    >
      {selected && (
        <Ionicons
          name="checkmark"
          size={14}
          color={colors.white}
          style={{ marginRight: 4 }}
        />
      )}
      <Text
        fontSize={14}
        fontFamily={selected ? 'Inter_600SemiBold' : 'Inter_500Medium'}
        color={selected ? colors.white : colors.textSecondary}
      >
        {label}
      </Text>
    </XStack>
  );
}
