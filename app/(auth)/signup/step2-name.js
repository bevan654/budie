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
import { validateRequired, validateDob } from '../../../utils/validation';
import { formatDobInput, parseDobToISO } from '../../../utils/dobHelpers';
import SignUpProgressBar from '../../../components/SignUpProgressBar';

export default function Step2Name() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;
  const formData = useSignupStore((s) => s.formData);
  const updateFields = useSignupStore((s) => s.updateFields);
  const showToast = useToastStore((s) => s.showToast);

  const [firstName, setFirstName] = useState(formData.firstName);
  const [lastName, setLastName] = useState(formData.lastName);
  const [dob, setDob] = useState(formData.dob);

  const handleDobChange = (text) => {
    setDob(formatDobInput(text));
  };

  const handleContinue = () => {
    const firstCheck = validateRequired(firstName, 'First name');
    if (!firstCheck.valid) {
      showToast({ message: firstCheck.message, type: 'error' });
      return;
    }

    const lastCheck = validateRequired(lastName, 'Last name');
    if (!lastCheck.valid) {
      showToast({ message: lastCheck.message, type: 'error' });
      return;
    }

    const isoDate = parseDobToISO(dob);
    const dobCheck = validateDob(isoDate);
    if (!dobCheck.valid) {
      showToast({ message: dobCheck.message, type: 'error' });
      return;
    }

    updateFields({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      dob,
    });
    router.push('/(auth)/signup/step3-university');
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

        <SignUpProgressBar currentStep={2} />

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
            <Ionicons name="person-outline" size={24} color={colors.primary} />
          </View>

          <Text
            fontSize={24}
            fontFamily="Inter_700Bold"
            color={colors.textPrimary}
            letterSpacing={-0.2}
            marginBottom={4}
          >
            What's your name?
          </Text>

          <Text
            fontSize={15}
            fontFamily="Inter_400Regular"
            color={colors.textSecondary}
            lineHeight={22}
          >
            Tell us a bit about yourself.
          </Text>
        </YStack>

        {/* Form */}
        <YStack flex={1}>
          {/* First & Last Name Row */}
          <XStack gap={10} marginBottom={16}>
            <YStack flex={1}>
              <Text
                fontSize={13}
                fontFamily="Inter_500Medium"
                color={colors.textSecondary}
                letterSpacing={0.2}
                textTransform="uppercase"
                marginBottom={6}
              >
                First Name
              </Text>
              <XStack
                alignItems="center"
                backgroundColor={colors.backgroundSecondary}
                borderRadius={10}
                borderWidth={1}
                borderColor={colors.border}
                paddingHorizontal={14}
              >
                <TextInput
                  style={{
                    flex: 1,
                    paddingVertical: 14,
                    fontSize: 15,
                    fontFamily: 'Inter_400Regular',
                    color: colors.textPrimary,
                    paddingHorizontal: 0,
                  }}
                  placeholder="First name"
                  placeholderTextColor={colors.textTertiary}
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                />
              </XStack>
            </YStack>

            <YStack flex={1}>
              <Text
                fontSize={13}
                fontFamily="Inter_500Medium"
                color={colors.textSecondary}
                letterSpacing={0.2}
                textTransform="uppercase"
                marginBottom={6}
              >
                Last Name
              </Text>
              <XStack
                alignItems="center"
                backgroundColor={colors.backgroundSecondary}
                borderRadius={10}
                borderWidth={1}
                borderColor={colors.border}
                paddingHorizontal={14}
              >
                <TextInput
                  style={{
                    flex: 1,
                    paddingVertical: 14,
                    fontSize: 15,
                    fontFamily: 'Inter_400Regular',
                    color: colors.textPrimary,
                    paddingHorizontal: 0,
                  }}
                  placeholder="Last name"
                  placeholderTextColor={colors.textTertiary}
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                />
              </XStack>
            </YStack>
          </XStack>

          {/* Date of Birth */}
          <YStack marginBottom={16}>
            <Text
              fontSize={13}
              fontFamily="Inter_500Medium"
              color={colors.textSecondary}
              letterSpacing={0.2}
              textTransform="uppercase"
              marginBottom={6}
            >
              Date of Birth
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
                name="calendar-outline"
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
                placeholder="DD/MM/YYYY"
                placeholderTextColor={colors.textTertiary}
                value={dob}
                onChangeText={handleDobChange}
                keyboardType="number-pad"
                maxLength={10}
              />
            </XStack>
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
