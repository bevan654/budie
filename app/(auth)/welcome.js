import React from 'react';
import { YStack, XStack, Text, View } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useThemeStore from '../../stores/themeStore';
import useSignupStore from '../../stores/signupStore';
import { lightColors, darkColors } from '../../constants/theme';

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;
  const resetForm = useSignupStore((s) => s.resetForm);

  const handleGetStarted = () => {
    resetForm();
    router.push('/(auth)/signup/step1-email');
  };

  return (
    <YStack
      flex={1}
      backgroundColor={colors.background}
      paddingHorizontal={24}
      paddingTop={insets.top}
      paddingBottom={insets.bottom}
    >
      {/* Content */}
      <YStack flex={1} justifyContent="center">
        {/* Logo */}
        <View
          width={64}
          height={64}
          borderRadius={18}
          backgroundColor={colors.primaryLight}
          justifyContent="center"
          alignItems="center"
          marginBottom={24}
          animation="medium"
          enterStyle={{ opacity: 0, scale: 0.8 }}
        >
          <Ionicons name="school" size={36} color={colors.primary} />
        </View>

        {/* Brand */}
        <Text
          fontSize={40}
          fontFamily="Inter_700Bold"
          color={colors.primary}
          letterSpacing={-0.5}
          marginBottom={12}
          animation="medium"
          enterStyle={{ opacity: 0 }}
          animateDelay={150}
        >
          budie
        </Text>

        {/* Heading */}
        <Text
          fontSize={28}
          fontFamily="Inter_700Bold"
          color={colors.textPrimary}
          letterSpacing={-0.3}
          lineHeight={36}
          marginBottom={12}
          animation="medium"
          enterStyle={{ opacity: 0 }}
          animateDelay={300}
        >
          {'Find your perfect\nstudy partner'}
        </Text>

        {/* Subheading */}
        <Text
          fontSize={16}
          fontFamily="Inter_400Regular"
          color={colors.textSecondary}
          lineHeight={24}
          animation="medium"
          enterStyle={{ opacity: 0 }}
          animateDelay={400}
        >
          Connect with students at Australian universities who share your study
          style, schedule, and goals.
        </Text>
      </YStack>

      {/* Footer */}
      <YStack
        paddingBottom={48}
        animation="medium"
        enterStyle={{ opacity: 0, y: 20 }}
        animateDelay={500}
      >
        {/* Get Started Button */}
        <View
          backgroundColor={colors.primary}
          paddingVertical={16}
          borderRadius={10}
          marginBottom={12}
          pressStyle={{ opacity: 0.7 }}
          onPress={handleGetStarted}
        >
          <XStack alignItems="center" justifyContent="center">
            <Text
              fontSize={16}
              fontFamily="Inter_600SemiBold"
              color="#fff"
            >
              Get Started
            </Text>
            <Ionicons
              name="arrow-forward"
              size={18}
              color="#fff"
              style={{ marginLeft: 8 }}
            />
          </XStack>
        </View>

        {/* Login Button */}
        <View
          borderWidth={1.5}
          borderColor={colors.border}
          backgroundColor={colors.cardBackground}
          paddingVertical={14}
          borderRadius={10}
          pressStyle={{ opacity: 0.7 }}
          onPress={() => router.push('/(auth)/login')}
        >
          <XStack justifyContent="center" alignItems="center">
            <Text
              fontSize={14}
              fontFamily="Inter_400Regular"
              color={colors.textSecondary}
            >
              Already have an account?{' '}
            </Text>
            <Text
              fontSize={14}
              fontFamily="Inter_600SemiBold"
              color={colors.primary}
            >
              Log In
            </Text>
          </XStack>
        </View>
      </YStack>
    </YStack>
  );
}
