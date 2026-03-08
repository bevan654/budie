import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Keyboard, TextInput } from 'react-native';
import { YStack, XStack, Text, ScrollView, View } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useThemeStore from '../../stores/themeStore';
import useAuthStore from '../../stores/authStore';
import useToastStore from '../../stores/toastStore';
import { lightColors, darkColors } from '../../constants/theme';
import { validateEmail, validatePassword } from '../../utils/validation';
import { getErrorMessage } from '../../utils/errorMessages';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;
  const signIn = useAuthStore((s) => s.signIn);
  const showToast = useToastStore((s) => s.showToast);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    Keyboard.dismiss();

    if (!validateEmail(email)) {
      showToast({ message: 'Please enter a valid email address', type: 'error' });
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      showToast({ message: passwordValidation.message, type: 'error' });
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
    } catch (error) {
      showToast({ message: getErrorMessage(error), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <ScrollView
        flex={1}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          paddingHorizontal: 24,
          paddingTop: insets.top + 30,
          paddingBottom: insets.bottom + 40,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <YStack marginBottom={36}>
          <View
            width={52}
            height={52}
            borderRadius={14}
            backgroundColor={colors.primaryLight}
            justifyContent="center"
            alignItems="center"
            marginBottom={16}
          >
            <Ionicons name="school" size={28} color={colors.primary} />
          </View>

          <Text
            fontSize={32}
            fontFamily="Inter_700Bold"
            color={colors.primary}
            letterSpacing={-0.5}
            marginBottom={8}
          >
            budie
          </Text>

          <Text
            fontSize={24}
            fontFamily="Inter_700Bold"
            color={colors.textPrimary}
            letterSpacing={-0.2}
            marginBottom={4}
          >
            Welcome back
          </Text>

          <Text
            fontSize={15}
            fontFamily="Inter_400Regular"
            color={colors.textSecondary}
            lineHeight={22}
          >
            Log in to find your study partners
          </Text>
        </YStack>

        {/* Form */}
        <YStack width="100%">
          {/* Email */}
          <YStack marginBottom={20}>
            <Text
              fontSize={13}
              fontFamily="Inter_500Medium"
              color={colors.textSecondary}
              letterSpacing={0.2}
              textTransform="uppercase"
              marginBottom={6}
            >
              Email
            </Text>
            <XStack
              alignItems="center"
              backgroundColor={colors.backgroundSecondary}
              borderRadius={10}
              borderWidth={1}
              borderColor={colors.border}
              paddingHorizontal={14}
            >
              <Ionicons
                name="mail-outline"
                size={18}
                color={colors.textTertiary}
                style={{ marginRight: 10 }}
              />
              <TextInput
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  fontSize: 15,
                  fontFamily: 'Inter_400Regular',
                  color: colors.textPrimary,
                }}
                placeholder="Enter your email"
                placeholderTextColor={colors.textTertiary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </XStack>
          </YStack>

          {/* Password */}
          <YStack marginBottom={20}>
            <XStack
              justifyContent="space-between"
              alignItems="center"
              marginBottom={6}
            >
              <Text
                fontSize={13}
                fontFamily="Inter_500Medium"
                color={colors.textSecondary}
                letterSpacing={0.2}
                textTransform="uppercase"
              >
                Password
              </Text>
              <View
                pressStyle={{ opacity: 0.7 }}
                onPress={() =>
                  showToast({
                    message:
                      'Password reset is coming soon. For now, contact support@budie.app for assistance.',
                    type: 'info',
                  })
                }
              >
                <Text
                  fontSize={13}
                  fontFamily="Inter_500Medium"
                  color={colors.primary}
                >
                  Forgot password?
                </Text>
              </View>
            </XStack>
            <XStack
              alignItems="center"
              backgroundColor={colors.backgroundSecondary}
              borderRadius={10}
              borderWidth={1}
              borderColor={colors.border}
              paddingHorizontal={14}
            >
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color={colors.textTertiary}
                style={{ marginRight: 10 }}
              />
              <TextInput
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  fontSize: 15,
                  fontFamily: 'Inter_400Regular',
                  color: colors.textPrimary,
                }}
                placeholder="Enter your password"
                placeholderTextColor={colors.textTertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <View
                padding={4}
                marginLeft={4}
                pressStyle={{ opacity: 0.7 }}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.textTertiary}
                />
              </View>
            </XStack>
          </YStack>

          {/* Submit Button */}
          <View
            backgroundColor={colors.primary}
            paddingVertical={16}
            borderRadius={10}
            marginTop={8}
            opacity={loading ? 0.5 : 1}
            pressStyle={{ opacity: 0.7 }}
            onPress={handleLogin}
            disabled={loading}
          >
            <XStack alignItems="center" justifyContent="center">
              <Text
                fontSize={16}
                fontFamily="Inter_600SemiBold"
                color="#fff"
              >
                {loading ? 'Logging In...' : 'Log In'}
              </Text>
              {!loading && (
                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color="#fff"
                  style={{ marginLeft: 8 }}
                />
              )}
            </XStack>
          </View>
        </YStack>

        {/* Footer */}
        <YStack marginTop={36}>
          {/* Divider */}
          <XStack alignItems="center" marginBottom={24}>
            <View flex={1} height={1} backgroundColor={colors.border} />
            <Text
              marginHorizontal={16}
              fontSize={13}
              fontFamily="Inter_500Medium"
              color={colors.textTertiary}
            >
              or
            </Text>
            <View flex={1} height={1} backgroundColor={colors.border} />
          </XStack>

          {/* Sign Up Button */}
          <View
            borderWidth={1.5}
            borderColor={colors.border}
            backgroundColor={colors.cardBackground}
            paddingVertical={14}
            borderRadius={10}
            pressStyle={{ opacity: 0.7 }}
            onPress={() => router.push('/(auth)/signup/step1-email')}
          >
            <XStack justifyContent="center" alignItems="center">
              <Text
                fontSize={14}
                fontFamily="Inter_400Regular"
                color={colors.textSecondary}
              >
                Don't have an account?{' '}
              </Text>
              <Text
                fontSize={14}
                fontFamily="Inter_600SemiBold"
                color={colors.primary}
              >
                Sign Up
              </Text>
            </XStack>
          </View>
        </YStack>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
