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
import { validateRequired } from '../../../utils/validation';
import { UNIVERSITIES, YEAR_OPTIONS } from '../../../constants/universities';
import SignUpProgressBar from '../../../components/SignUpProgressBar';
import PickerModal from '../../../components/PickerModal';

export default function Step3University() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;
  const formData = useSignupStore((s) => s.formData);
  const updateFields = useSignupStore((s) => s.updateFields);
  const showToast = useToastStore((s) => s.showToast);

  const [university, setUniversity] = useState(formData.university);
  const [course, setCourse] = useState(formData.course);
  const [yearOfStudy, setYearOfStudy] = useState(formData.yearOfStudy);
  const [showUniPicker, setShowUniPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  const handleContinue = () => {
    const uniCheck = validateRequired(university, 'University');
    if (!uniCheck.valid) {
      showToast({ message: uniCheck.message, type: 'error' });
      return;
    }

    const courseCheck = validateRequired(course, 'Course');
    if (!courseCheck.valid) {
      showToast({ message: courseCheck.message, type: 'error' });
      return;
    }

    const yearCheck = validateRequired(yearOfStudy, 'Year of study');
    if (!yearCheck.valid) {
      showToast({ message: yearCheck.message, type: 'error' });
      return;
    }

    updateFields({
      university,
      course: course.trim(),
      yearOfStudy,
    });
    router.push('/(auth)/signup/step4-preferences');
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

        <SignUpProgressBar currentStep={3} />

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
            <Ionicons name="business-outline" size={24} color={colors.primary} />
          </View>

          <Text
            fontSize={24}
            fontFamily="Inter_700Bold"
            color={colors.textPrimary}
            letterSpacing={-0.2}
            marginBottom={4}
          >
            Where do you study?
          </Text>

          <Text
            fontSize={15}
            fontFamily="Inter_400Regular"
            color={colors.textSecondary}
            lineHeight={22}
          >
            Help us match you with the right study partners.
          </Text>
        </YStack>

        {/* Form */}
        <YStack flex={1}>
          {/* University Picker */}
          <YStack marginBottom={16}>
            <Text
              fontSize={13}
              fontFamily="Inter_500Medium"
              color={colors.textSecondary}
              letterSpacing={0.2}
              textTransform="uppercase"
              marginBottom={6}
            >
              University
            </Text>
            <View
              pressStyle={{ opacity: 0.7 }}
              onPress={() => setShowUniPicker(true)}
            >
              <XStack
                alignItems="center"
                backgroundColor={colors.backgroundSecondary}
                borderRadius={10}
                borderWidth={1}
                borderColor={colors.border}
                paddingHorizontal={14}
                minHeight={48}
              >
                <Ionicons
                  name="business-outline"
                  size={18}
                  color={colors.textTertiary}
                  style={{ marginRight: 10 }}
                />
                <Text
                  flex={1}
                  fontSize={15}
                  fontFamily="Inter_400Regular"
                  color={university ? colors.textPrimary : colors.textTertiary}
                  paddingVertical={13}
                >
                  {university || 'Select your university'}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={18}
                  color={colors.textTertiary}
                />
              </XStack>
            </View>
          </YStack>

          {/* Course Input */}
          <YStack marginBottom={16}>
            <Text
              fontSize={13}
              fontFamily="Inter_500Medium"
              color={colors.textSecondary}
              letterSpacing={0.2}
              textTransform="uppercase"
              marginBottom={6}
            >
              Course / Degree
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
                name="book-outline"
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
                placeholder="e.g. Bachelor of Computer Science"
                placeholderTextColor={colors.textTertiary}
                value={course}
                onChangeText={setCourse}
                autoCapitalize="words"
              />
            </XStack>
          </YStack>

          {/* Year of Study Picker */}
          <YStack marginBottom={16}>
            <Text
              fontSize={13}
              fontFamily="Inter_500Medium"
              color={colors.textSecondary}
              letterSpacing={0.2}
              textTransform="uppercase"
              marginBottom={6}
            >
              Year of Study
            </Text>
            <View
              pressStyle={{ opacity: 0.7 }}
              onPress={() => setShowYearPicker(true)}
            >
              <XStack
                alignItems="center"
                backgroundColor={colors.backgroundSecondary}
                borderRadius={10}
                borderWidth={1}
                borderColor={colors.border}
                paddingHorizontal={14}
                minHeight={48}
              >
                <Ionicons
                  name="layers-outline"
                  size={18}
                  color={colors.textTertiary}
                  style={{ marginRight: 10 }}
                />
                <Text
                  flex={1}
                  fontSize={15}
                  fontFamily="Inter_400Regular"
                  color={yearOfStudy ? colors.textPrimary : colors.textTertiary}
                  paddingVertical={13}
                >
                  {yearOfStudy || 'Select year of study'}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={18}
                  color={colors.textTertiary}
                />
              </XStack>
            </View>
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

      <PickerModal
        visible={showUniPicker}
        onClose={() => setShowUniPicker(false)}
        title="Select University"
        data={UNIVERSITIES}
        onSelect={setUniversity}
        selectedValue={university}
        searchable
      />
      <PickerModal
        visible={showYearPicker}
        onClose={() => setShowYearPicker(false)}
        title="Select Year of Study"
        data={YEAR_OPTIONS}
        onSelect={setYearOfStudy}
        selectedValue={yearOfStudy}
      />
    </KeyboardAvoidingView>
  );
}
