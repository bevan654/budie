import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { typography, spacing, borderRadius } from '../constants/theme';
import Button from './Button';
import { hapticSuccess } from '../utils/haptics';

const { width } = Dimensions.get('window');

export default function MatchModal({ visible, onClose, currentUserProfile, matchedProfile, onSendMessage }) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const heartScale = useRef(new Animated.Value(1)).current;
  const leftTilt = useRef(new Animated.Value(0)).current;
  const rightTilt = useRef(new Animated.Value(0)).current;
  const { colors } = useTheme();
  const styles = createStyles(colors);

  useEffect(() => {
    if (visible) {
      hapticSuccess();
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(leftTilt, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(rightTilt, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start(() => {
        Animated.sequence([
          Animated.timing(heartScale, { toValue: 1.25, duration: 200, useNativeDriver: true }),
          Animated.timing(heartScale, { toValue: 1, duration: 200, useNativeDriver: true }),
          Animated.timing(heartScale, { toValue: 1.2, duration: 180, useNativeDriver: true }),
          Animated.timing(heartScale, { toValue: 1, duration: 180, useNativeDriver: true }),
        ]).start();
      });
    } else {
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
      heartScale.setValue(1);
      leftTilt.setValue(0);
      rightTilt.setValue(0);
    }
  }, [visible]);

  if (!matchedProfile || !currentUserProfile) return null;

  const leftRotate = leftTilt.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-3deg'],
  });

  const rightRotate = rightTilt.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '3deg'],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.title}>Study Buddy Found!</Text>
          <Text style={styles.subtitle}>
            You and {matchedProfile.name} want to study together
          </Text>

          <View style={styles.profilesContainer}>
            <Animated.View style={[styles.profileImageWrapper, { transform: [{ rotate: leftRotate }] }]}>
              <Image
                source={{ uri: currentUserProfile.photo_url || 'https://via.placeholder.com/400' }}
                style={styles.profileImage}
              />
            </Animated.View>
            <Animated.View style={[styles.heartContainer, { transform: [{ scale: heartScale }] }]}>
              <Text style={styles.heartIcon}>{'\u2665'}</Text>
            </Animated.View>
            <Animated.View style={[styles.profileImageWrapper, { transform: [{ rotate: rightRotate }] }]}>
              <Image
                source={{ uri: matchedProfile.photo_url || 'https://via.placeholder.com/400' }}
                style={styles.profileImage}
              />
            </Animated.View>
          </View>

          <View style={styles.actions}>
            <Button
              title="Say Hello"
              onPress={onSendMessage}
              variant="primary"
              style={styles.button}
            />
            <Button
              title="Keep Browsing"
              onPress={onClose}
              variant="outline"
              style={styles.button}
            />
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const createStyles = (colors) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: width * 0.85,
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.xxxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  profilesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  profileImageWrapper: {
    borderRadius: 60,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.backgroundSecondary,
  },
  heartContainer: {
    marginHorizontal: spacing.lg,
  },
  heartIcon: {
    fontSize: 36,
    color: colors.primary,
  },
  actions: {
    width: '100%',
    gap: spacing.md,
  },
  button: {
    width: '100%',
  },
});
