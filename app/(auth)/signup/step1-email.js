import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import { YStack, XStack, Text, ScrollView, View } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useThemeStore from '../../../stores/themeStore';
import useSignupStore from '../../../stores/signupStore';
import useToastStore from '../../../stores/toastStore';
import { lightColors, darkColors } from '../../../constants/theme';
import { validateEduEmail } from '../../../utils/validation';
import SignUpProgressBar from '../../../components/SignUpProgressBar';

export default function Step1Email() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;
  const formData = useSignupStore((s) => s.formData);
  const updateField = useSignupStore((s) => s.updateField);
  const showToast = useToastStore((s) => s.showToast);

  const [email, setEmail] = useState(formData.email);

  const handleContinue = () => {
    const check = validateEduEmail(email);
    if (!check.valid) {
      showToast({ message: check.message, type: 'error' });
      return;
    }
    updateField('email', email.trim().toLowerCase());
    router.push('/(auth)/signup/step2-name');
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

        <SignUpProgressBar currentStep={1} />

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
            <Ionicons name="mail-outline" size={24} color={colors.primary} />
          </View>

          <Text
            fontSize={24}
            fontFamily="Inter_700Bold"
            color={colors.textPrimary}
            letterSpacing={-0.2}
            marginBottom={4}
          >
            What's your email?
          </Text>

          <Text
            fontSize={15}
            fontFamily="Inter_400Regular"
            color={colors.textSecondary}
            lineHeight={22}
          >
            We use this to verify you're a student at an Australian university.
          </Text>
        </YStack>

        {/* Form */}
        <YStack flex={1}>
          <YStack marginBottom={16}>
            <Text
              fontSize={13}
              fontFamily="Inter_500Medium"
              color={colors.textSecondary}
              letterSpacing={0.2}
              textTransform="uppercase"
              marginBottom={6}
            >
              University Email
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
                  paddingHorizontal: 0,
                }}
                placeholder="you@university.edu.au"
                placeholderTextColor={colors.textTertiary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoFocus
              />
            </XStack>
            <Text
              fontSize={12}
              color={colors.textTertiary}
              marginTop={4}
            >
              Only Australian university emails (.edu.au) are accepted
            </Text>
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
