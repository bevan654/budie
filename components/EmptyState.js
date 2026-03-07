import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { spacing, typography } from '../constants/theme';
import Button from './Button';

export default function EmptyState({
  title,
  subtitle,
  icon,
  iconColor,
  actionTitle,
  onActionPress,
  style
}) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }, style]}>
      {icon && (
        <Ionicons
          name={icon}
          size={48}
          color={iconColor || colors.textTertiary}
          style={styles.icon}
        />
      )}
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {actionTitle && onActionPress && (
        <Button
          title={actionTitle}
          onPress={onActionPress}
          variant="primary"
          style={styles.button}
        />
      )}
    </Animated.View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl * 2,
  },
  icon: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.bodyLarge,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  button: {
    minWidth: 140,
  },
});
