import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { XStack, YStack, Text } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useThemeStore from '../stores/themeStore';
import { lightColors, darkColors } from '../constants/theme';
import { hapticSuccess, hapticError, hapticWarning } from '../utils/haptics';

const ICON_MAP = {
  success: 'checkmark-circle',
  error: 'alert-circle',
  info: 'information-circle',
  warning: 'warning',
};

const HAPTIC_MAP = {
  success: hapticSuccess,
  error: hapticError,
  info: hapticWarning,
  warning: hapticWarning,
};

export default function Toast({ message, type = 'info', onDismiss }) {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;
  const insets = useSafeAreaInsets();

  const colorMap = {
    success: colors.success,
    error: colors.error,
    info: colors.primary,
    warning: colors.warning,
  };

  const bgMap = {
    success: colors.successLight,
    error: colors.errorLight,
    info: colors.primaryLight,
    warning: colors.warningLight,
  };

  useEffect(() => {
    HAPTIC_MAP[type]?.();
  }, [type]);

  const accentColor = colorMap[type] || colors.primary;
  const bgColor = bgMap[type] || colors.primaryLight;

  return (
    <YStack
      position="absolute"
      left={16}
      right={16}
      top={insets.top + 8}
      zIndex={99999}
      alignItems="center"
      animation="fast"
      enterStyle={{ y: -100, opacity: 0 }}
      y={0}
      opacity={1}
    >
      <XStack
        alignItems="center"
        paddingHorizontal={16}
        paddingVertical={14}
        borderRadius={12}
        borderWidth={1}
        borderColor={accentColor}
        backgroundColor={bgColor}
        gap={10}
        width="100%"
        onPress={onDismiss}
        cursor="pointer"
        {...Platform.select({
          ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
          },
          android: {
            elevation: 8,
          },
        })}
      >
        <Ionicons
          name={ICON_MAP[type] || 'information-circle'}
          size={20}
          color={accentColor}
        />
        <Text
          flex={1}
          fontSize={14}
          fontFamily="Inter_600SemiBold"
          lineHeight={20}
          color={accentColor}
          numberOfLines={2}
        >
          {message}
        </Text>
      </XStack>
    </YStack>
  );
}
