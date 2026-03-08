import React from 'react';
import { YStack, Text } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import useThemeStore from '../stores/themeStore';
import { lightColors, darkColors } from '../constants/theme';
import { spacing } from '../constants/theme';
import Button from './Button';

export default function EmptyState({
  icon,
  title,
  subtitle,
  actionTitle,
  onActionPress,
}) {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;

  return (
    <YStack
      alignItems="center"
      paddingVertical={spacing.xxxl * 2}
      animation="medium"
      enterStyle={{ opacity: 0, scale: 0.95 }}
      opacity={1}
      scale={1}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={48}
          color={colors.textTertiary}
          style={{ marginBottom: spacing.lg }}
        />
      )}
      <Text
        fontSize={16}
        fontFamily="Inter_400Regular"
        lineHeight={24}
        color={colors.textSecondary}
        marginBottom={spacing.sm}
      >
        {title}
      </Text>
      {subtitle && (
        <Text
          fontSize={13}
          fontFamily="Inter_400Regular"
          lineHeight={18}
          color={colors.textTertiary}
          textAlign="center"
          marginBottom={spacing.xl}
        >
          {subtitle}
        </Text>
      )}
      {actionTitle && onActionPress && (
        <Button
          title={actionTitle}
          onPress={onActionPress}
          variant="primary"
          style={{ minWidth: 140 }}
        />
      )}
    </YStack>
  );
}
