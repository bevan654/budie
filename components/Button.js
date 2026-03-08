import React from 'react';
import { ActivityIndicator } from 'react-native';
import { View, Text } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import useThemeStore from '../stores/themeStore';
import { lightColors, darkColors } from '../constants/theme';
import { borderRadius } from '../constants/theme';
import { hapticLight, hapticWarning } from '../utils/haptics';

export default function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  style,
}) {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;

  const getVariantProps = () => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: colors.backgroundSecondary,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colors.borderDark,
        };
      case 'danger':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colors.error,
        };
      default:
        return {
          backgroundColor: colors.primary,
        };
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'secondary':
      case 'outline':
        return colors.textPrimary;
      case 'danger':
        return colors.error;
      default:
        return colors.white;
    }
  };

  const handlePress = () => {
    if (disabled || loading) return;
    if (variant === 'danger') {
      hapticWarning();
    } else {
      hapticLight();
    }
    onPress?.();
  };

  const textColor = getTextColor();
  const variantProps = getVariantProps();

  const renderIcon = () => {
    if (!icon) return null;
    return <Ionicons name={icon} size={18} color={textColor} />;
  };

  return (
    <View
      flexDirection="row"
      alignItems="center"
      justifyContent="center"
      gap={8}
      borderRadius={borderRadius.md}
      paddingVertical={14}
      paddingHorizontal={24}
      opacity={disabled || loading ? 0.5 : 1}
      animation="fast"
      pressStyle={{ scale: 0.97 }}
      onPress={handlePress}
      disabled={disabled || loading}
      cursor={disabled || loading ? 'not-allowed' : 'pointer'}
      {...variantProps}
      {...style}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <>
          {icon && iconPosition === 'left' && renderIcon()}
          <Text
            fontSize={15}
            fontFamily="Inter_600SemiBold"
            textAlign="center"
            letterSpacing={0.2}
            color={textColor}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && renderIcon()}
        </>
      )}
    </View>
  );
}
