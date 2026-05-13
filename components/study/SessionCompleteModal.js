import React, { useEffect, useMemo, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { typography, spacing, borderRadius } from '../../constants/theme';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const CONFETTI_COLORS = [
  '#F97316', // orange
  '#FACC15', // yellow
  '#22C55E', // green
  '#06B6D4', // cyan
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#EF4444', // red
];

const CONFETTI_COUNT = 60;

function formatDuration(seconds) {
  const s = Math.max(0, Math.round(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  if (m > 0) return `${m}m ${r}s`;
  return `${r}s`;
}

function congratsLine(seconds) {
  const m = seconds / 60;
  if (m >= 240) return 'Marathon. Genuinely outstanding effort.';
  if (m >= 120) return 'Massive session — you should be proud.';
  if (m >= 60) return 'A full hour locked in. Excellent work.';
  if (m >= 30) return 'Solid focus. Keep that momentum.';
  if (m >= 10) return 'Nice — every minute compounds.';
  return 'Small step, but you showed up. That counts.';
}

function ConfettiPiece({ index }) {
  const fall = useRef(new Animated.Value(0)).current;
  const drift = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  const config = useMemo(() => {
    const startX = Math.random() * SCREEN_W;
    const endX = startX + (Math.random() * 160 - 80);
    const size = 6 + Math.random() * 8;
    const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];
    const delay = Math.random() * 600;
    const duration = 1800 + Math.random() * 1600;
    const rotateMax = 360 + Math.random() * 720;
    return { startX, endX, size, color, delay, duration, rotateMax };
  }, [index]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fall, {
        toValue: 1,
        duration: config.duration,
        delay: config.delay,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(drift, {
        toValue: 1,
        duration: config.duration,
        delay: config.delay,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }),
      Animated.timing(rotate, {
        toValue: 1,
        duration: config.duration,
        delay: config.delay,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const translateY = fall.interpolate({
    inputRange: [0, 1],
    outputRange: [-40, SCREEN_H + 40],
  });
  const translateX = drift.interpolate({
    inputRange: [0, 1],
    outputRange: [0, config.endX - config.startX],
  });
  const rotation = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', `${config.rotateMax}deg`],
  });
  const opacity = fall.interpolate({
    inputRange: [0, 0.85, 1],
    outputRange: [1, 1, 0],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: config.startX,
        top: 0,
        width: config.size,
        height: config.size * 0.5,
        backgroundColor: config.color,
        borderRadius: 1,
        transform: [{ translateY }, { translateX }, { rotate: rotation }],
        opacity,
      }}
    />
  );
}

export default function SessionCompleteModal({ visible, durationSeconds, onClose }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const pop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      pop.setValue(0);
      Animated.spring(pop, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  const scale = pop.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] });
  const opacity = pop.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        {/* Confetti layer — sits behind the card but fills the screen */}
        <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
          {Array.from({ length: CONFETTI_COUNT }).map((_, i) => (
            <ConfettiPiece key={i} index={i} />
          ))}
        </View>

        <Animated.View style={[styles.card, { transform: [{ scale }], opacity }]}>
          <View style={styles.iconWrap}>
            <Ionicons name="trophy" size={32} color="#F97316" />
          </View>

          <Text style={styles.title}>Great work!</Text>
          <Text style={styles.subtitle}>{congratsLine(durationSeconds)}</Text>

          <View style={styles.durationBlock}>
            <Text style={styles.durationLabel}>You studied for</Text>
            <Text style={styles.durationValue}>{formatDuration(durationSeconds)}</Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={onClose} activeOpacity={0.85}>
            <Text style={styles.buttonText}>Done</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.55)',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
    },
    card: {
      width: '100%',
      maxWidth: 380,
      backgroundColor: colors.cardBackground,
      borderRadius: borderRadius.xl || 20,
      paddingTop: 28,
      paddingBottom: 22,
      paddingHorizontal: 24,
      alignItems: 'center',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    iconWrap: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: '#FFEDD5',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.md,
    },
    title: {
      fontSize: 24,
      fontFamily: 'Inter_700Bold',
      color: colors.textPrimary,
      letterSpacing: -0.5,
      marginBottom: 6,
    },
    subtitle: {
      fontSize: 14,
      fontFamily: 'Inter_500Medium',
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: spacing.xl,
      paddingHorizontal: 8,
    },
    durationBlock: {
      alignItems: 'center',
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.xl,
      borderRadius: borderRadius.lg,
      backgroundColor: colors.backgroundSecondary,
      width: '100%',
      marginBottom: spacing.xl,
    },
    durationLabel: {
      fontSize: 12,
      fontFamily: 'Inter_500Medium',
      color: colors.textTertiary,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: 6,
    },
    durationValue: {
      fontSize: 38,
      fontFamily: 'Inter_700Bold',
      color: colors.textPrimary,
      letterSpacing: -1,
    },
    button: {
      width: '100%',
      backgroundColor: colors.primary,
      paddingVertical: 14,
      borderRadius: borderRadius.full,
      alignItems: 'center',
    },
    buttonText: {
      fontSize: 15,
      fontFamily: 'Inter_600SemiBold',
      color: '#FFFFFF',
    },
  });
