import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { spacing, borderRadius } from '../constants/theme';
import { hapticSelection } from '../utils/haptics';

export default function FilterChip({ label, selected, onPress }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const handlePress = () => {
    hapticSelection();
    onPress?.();
  };

  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {selected && (
        <Ionicons
          name="checkmark"
          size={14}
          color={colors.white}
          style={styles.checkIcon}
        />
      )}
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const createStyles = (colors) => StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundSecondary,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkIcon: {
    marginRight: 4,
  },
  chipText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: colors.textSecondary,
  },
  chipTextSelected: {
    color: colors.white,
    fontFamily: 'Inter_600SemiBold',
  },
});
