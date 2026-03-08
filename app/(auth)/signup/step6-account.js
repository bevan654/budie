import React, { useState, useMemo } from 'react';
import { KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import { YStack, XStack, Text, ScrollView, View } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useThemeStore from '../../../stores/themeStore';
import useSignupStore from '../../../stores/signupStore';
import useToastStore from '../../../stores/toastStore';
import { lightColors, darkColors } from '../../../constants/theme';
import { validatePassword } from '../../../utils/validation';
import SignUpProgressBar from '../../../components/SignUpProgressBar';

export default function Step6Account() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;
  const formData = useSignupStore((s) => s.formData);
  const updateFields = useSignupStore((s) => s.updateFields);
  const showToast = useToastStore((s) => s.showToast);

  const [password, setPassword] = useState(formData.password);
  const [confirmPassword, setConfirmPassword] = useState(formData.confirmPassword);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const passwordStrength = useMemo(() => {
    if (!password) return { level: 0, label: '', color: colors.border };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score <= 1) return { level: 1, label: 'Weak', color: colors.error };
    if (score === 2) return { level: 2, label: 'Fair', color: '#F59E0B' };
    if (score === 3) return { level: 3, label: 'Good', color: '#3B82F6' };
    return { level: 4, label: 'Strong', color: colors.success };
  }, [password, colors]);

  const handleContinue = () => {
    const check = validatePassword(password);
    if (!check.valid) {
      showToast({ message: check.message, type: 'error' });
      return;
    }

    if (password !== confirmPassword) {
      showToast({ message: 'Passwords do not match', type: 'error' });
      return;
    }

    updateFields({ password, confirmPassword });
    router.push('/(auth)/signup/step7-review');
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
          paddingHorizontal: 24,
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 40,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back Button */}
        <View
          width={40}
          height={40}
          justifyContent="center"
          marginBottom={12}
          pressStyle={{ opacity: 0.7 }}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </View>

        <SignUpProgressBar currentStep={6} />

        {/* Header */}
        <YStack marginBottom={32}>
          <View
            width={52}
            height={52}
            borderRadius={14}
            backgroundColor={colors.primaryLight}
            justifyContent="center"
            alignItems="center"
            marginBottom={16}
          >
            <Ionicons
              name="lock-closed-outline"
              size={24}
              color={colors.primary}
            />
          </View>

          <Text
            fontSize={24}
            fontFamily="Inter_700Bold"
            color={colors.textPrimary}
            letterSpacing={-0.2}
            marginBottom={4}
          >
            Secure your account
          </Text>

          <Text
            fontSize={15}
            fontFamily="Inter_400Regular"
            color={colors.textSecondary}
            lineHeight={22}
          >
            Create a strong password to protect your account.
          </Text>
        </YStack>

        {/* Form */}
        <YStack flex={1}>
          {/* Password */}
          <YStack marginBottom={20}>
            <Text
              fontSize={13}
              fontFamily="Inter_500Medium"
              color={colors.textSecondary}
              letterSpacing={0.2}
              textTransform="uppercase"
              marginBottom={6}
            >
              Password
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
                  paddingHorizontal: 0,
                }}
                placeholder="Create a password"
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

            {/* Password Strength Indicator */}
            {password.length > 0 && (
              <XStack alignItems="center" marginTop={8} gap={8}>
                <XStack flex={1} gap={4}>
                  {[1, 2, 3, 4].map((i) => (
                    <View
                      key={i}
                      flex={1}
                      height={4}
                      borderRadius={2}
                      backgroundColor={
                        i <= passwordStrength.level
                          ? passwordStrength.color
                          : colors.border
                      }
                    />
                  ))}
                </XStack>
                <Text
                  fontSize={12}
                  fontFamily="Inter_600SemiBold"
                  color={passwordStrength.color}
                  width={44}
                  textAlign="right"
                >
                  {passwordStrength.label}
                </Text>
              </XStack>
            )}
          </YStack>

          {/* Confirm Password */}
          <YStack marginBottom={20}>
            <Text
              fontSize={13}
              fontFamily="Inter_500Medium"
              color={colors.textSecondary}
              letterSpacing={0.2}
              textTransform="uppercase"
              marginBottom={6}
            >
              Confirm Password
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
                name="shield-checkmark-outline"
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
                  paddingHorizontal: 0,
                }}
                placeholder="Re-enter your password"
                placeholderTextColor={colors.textTertiary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirm}
                autoCapitalize="none"
              />
              <View
                padding={4}
                marginLeft={4}
                pressStyle={{ opacity: 0.7 }}
                onPress={() => setShowConfirm(!showConfirm)}
              >
                <Ionicons
                  name={showConfirm ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.textTertiary}
                />
              </View>
            </XStack>

            {/* Mismatch Warning */}
            {confirmPassword.length > 0 && password !== confirmPassword && (
              <Text
                fontSize={12}
                fontFamily="Inter_500Medium"
                color={colors.error}
                marginTop={4}
              >
                Passwords do not match
              </Text>
            )}
          </YStack>
        </YStack>

        {/* Continue Button */}
        <View
          backgroundColor={colors.primary}
          paddingVertical={16}
          borderRadius={10}
          marginTop={20}
          pressStyle={{ opacity: 0.7 }}
          onPress={handleContinue}
        >
          <XStack alignItems="center" justifyContent="center">
            <Text
              fontSize={16}
              fontFamily="Inter_600SemiBold"
              color="#fff"
            >
              Continue
            </Text>
            <Ionicons
              name="arrow-forward"
              size={18}
              color="#fff"
              style={{ marginLeft: 8 }}
            />
          </XStack>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
