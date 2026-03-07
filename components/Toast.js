import React, { useEffect, useRef } from 'react';
import { Text, TouchableOpacity, StyleSheet, Platform, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { hapticSuccess, hapticError, hapticWarning } from '../utils/haptics';

const ICON_MAP = {
  success: 'checkmark-circle',
  error: 'alert-circle',
  info: 'information-circle',
};

const HAPTIC_MAP = {
  success: hapticSuccess,
  error: hapticError,
  info: hapticWarning,
};

export default function Toast({ message, type = 'info', onDismiss }) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const colorMap = {
    success: colors.success,
    error: colors.error,
    info: colors.primary,
  };

  const bgMap = {
    success: colors.successLight,
    error: colors.errorLight,
    info: colors.primaryLight,
  };

  useEffect(() => {
    HAPTIC_MAP[type]?.();
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        damping: 20,
        stiffness: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { top: insets.top + 8 },
        { transform: [{ translateY }], opacity },
      ]}
    >
      <TouchableOpacity
        style={[styles.toast, { backgroundColor: bgMap[type], borderColor: colorMap[type] }]}
        onPress={handleDismiss}
        activeOpacity={0.9}
      >
        <Ionicons name={ICON_MAP[type]} size={20} color={colorMap[type]} />
        <Text style={[styles.message, { color: colorMap[type] }]} numberOfLines={2}>
          {message}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 99999,
    elevation: 99999,
    alignItems: 'center',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    width: '100%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    lineHeight: 20,
  },
});
