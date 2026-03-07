import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useSignUp } from '../contexts/SignUpContext';
import { typography, spacing, borderRadius } from '../constants/theme';

export default function WelcomeScreen({ navigation }) {
  const { colors } = useTheme();
  const { resetForm } = useSignUp();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const brandOpacity = useRef(new Animated.Value(0)).current;
  const headingOpacity = useRef(new Animated.Value(0)).current;
  const subheadingOpacity = useRef(new Animated.Value(0)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;
  const footerTranslateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(logoScale, { toValue: 1, damping: 15, stiffness: 200, useNativeDriver: true }),
    ]).start();

    setTimeout(() => {
      Animated.timing(brandOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }, 150);

    setTimeout(() => {
      Animated.timing(headingOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }, 300);

    setTimeout(() => {
      Animated.timing(subheadingOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }, 400);

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(footerOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(footerTranslateY, { toValue: 0, damping: 20, stiffness: 200, useNativeDriver: true }),
      ]).start();
    }, 500);
  }, []);

  const handleGetStarted = () => {
    resetForm();
    navigation.navigate('SignUpStep1Email');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.View style={[styles.logoWrap, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
          <Ionicons name="school" size={36} color={colors.primary} />
        </Animated.View>
        <Animated.Text style={[styles.brand, { opacity: brandOpacity }]}>budie</Animated.Text>
        <Animated.Text style={[styles.heading, { opacity: headingOpacity }]}>
          Find your perfect{'\n'}study partner
        </Animated.Text>
        <Animated.Text style={[styles.subheading, { opacity: subheadingOpacity }]}>
          Connect with students at Australian universities who share your study style, schedule, and goals.
        </Animated.Text>
      </View>

      <Animated.View style={[styles.footer, { opacity: footerOpacity, transform: [{ translateY: footerTranslateY }] }]}>
        <TouchableOpacity style={styles.getStartedButton} onPress={handleGetStarted} activeOpacity={0.7}>
          <Text style={styles.getStartedText}>Get Started</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 8 }} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.7}
        >
          <Text style={styles.loginText}>Already have an account? </Text>
          <Text style={styles.loginBold}>Log In</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xxl,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  logoWrap: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  brand: {
    fontSize: 40,
    fontFamily: 'Inter_700Bold',
    color: colors.primary,
    letterSpacing: -0.5,
    marginBottom: spacing.md,
  },
  heading: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    color: colors.textPrimary,
    letterSpacing: -0.3,
    lineHeight: 36,
    marginBottom: spacing.md,
  },
  subheading: {
    ...typography.bodyLarge,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  footer: {
    paddingBottom: 48,
  },
  getStartedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  getStartedText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#fff',
  },
  loginButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.cardBackground,
  },
  loginText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: colors.textSecondary,
  },
  loginBold: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: colors.primary,
  },
});
