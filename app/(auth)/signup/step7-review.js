import React, { useState } from 'react';
import { Linking, Alert } from 'react-native';
import { YStack, XStack, Text, ScrollView, View } from 'tamagui';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useThemeStore from '../../../stores/themeStore';
import useSignupStore from '../../../stores/signupStore';
import useAuthStore from '../../../stores/authStore';
import useToastStore from '../../../stores/toastStore';
import { lightColors, darkColors } from '../../../constants/theme';
import { parseDobToISO } from '../../../utils/dobHelpers';
import { getErrorMessage } from '../../../utils/errorMessages';
import { uploadPhoto } from '../../../services/photoService';
import SignUpProgressBar from '../../../components/SignUpProgressBar';

export default function Step7Review() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;
  const formData = useSignupStore((s) => s.formData);
  const updateField = useSignupStore((s) => s.updateField);
  const resetForm = useSignupStore((s) => s.resetForm);
  const signUp = useAuthStore((s) => s.signUp);
  const showToast = useToastStore((s) => s.showToast);

  const [loading, setLoading] = useState(false);

  const handleCreateAccount = async () => {
    if (!formData.consentTC || !formData.consentPrivacy) {
      showToast({
        message:
          'You must agree to the Terms & Conditions and Privacy Policy to create an account.',
        type: 'error',
      });
      return;
    }

    setLoading(true);
    try {
      const isoDate = parseDobToISO(formData.dob);
      const { data } = await signUp(formData.email, formData.password, {
        first_name: formData.firstName,
        last_name: formData.lastName,
        name: `${formData.firstName} ${formData.lastName}`,
        dob: isoDate,
        university: formData.university,
        course: formData.course,
        course_year: formData.yearOfStudy,
        study_time: formData.studyTime?.join(', ') || 'Afternoons',
        study_method: formData.studyMethod?.join(', ') || 'Group Study',
        current_mood: formData.currentMood?.join(', ') || 'Focused',
        bio: formData.bio || '',
      });

      if (data?.user) {
        if (data.user.identities && data.user.identities.length === 0) {
          showToast({
            message: 'This email is already registered. Please log in instead.',
            type: 'info',
          });
          resetForm();
          router.push('/(auth)/login');
        } else if (data.session) {
          if (formData.photoUri) {
            try {
              await uploadPhoto(formData.photoUri, data.user.id);
            } catch (photoError) {
              console.warn('Photo upload failed:', photoError.message);
            }
          }
          resetForm();
          showToast({ message: 'Account created successfully!', type: 'success' });
          router.push('/(auth)/login');
        } else {
          resetForm();
          Alert.alert(
            'Check your email',
            'Please check your university email to confirm your account before logging in.'
          );
          router.push('/(auth)/login');
        }
      } else {
        showToast({
          message: 'Signup completed but no user data returned. Try logging in.',
          type: 'info',
        });
        resetForm();
        router.push('/(auth)/login');
      }
    } catch (error) {
      showToast({ message: getErrorMessage(error), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const renderRow = (label, value) => (
    <XStack
      justifyContent="space-between"
      alignItems="center"
      paddingVertical={10}
      borderBottomWidth={0.5}
      borderBottomColor={colors.border}
    >
      <Text fontSize={14} color={colors.textSecondary}>
        {label}
      </Text>
      <Text
        fontSize={14}
        fontFamily="Inter_500Medium"
        color={colors.textPrimary}
        flexShrink={1}
        textAlign="right"
        marginLeft={12}
      >
        {value || '--'}
      </Text>
    </XStack>
  );

  const renderSectionHeader = (icon, title, editRoute) => (
    <XStack alignItems="center" marginBottom={12}>
      <View
        width={30}
        height={30}
        borderRadius={8}
        backgroundColor={colors.primaryLight}
        justifyContent="center"
        alignItems="center"
        marginRight={10}
      >
        <Ionicons name={icon} size={16} color={colors.primary} />
      </View>
      <Text
        fontSize={15}
        fontFamily="Inter_600SemiBold"
        color={colors.textPrimary}
        flex={1}
        textTransform="uppercase"
        letterSpacing={0.5}
      >
        {title}
      </Text>
      {editRoute && (
        <View pressStyle={{ opacity: 0.7 }} onPress={() => router.push(editRoute)}>
          <Text
            fontSize={14}
            fontFamily="Inter_600SemiBold"
            color={colors.primary}
          >
            Edit
          </Text>
        </View>
      )}
    </XStack>
  );

  return (
    <ScrollView
      flex={1}
      backgroundColor={colors.background}
      contentContainerStyle={{
        paddingHorizontal: 24,
        paddingTop: insets.top + 20,
        paddingBottom: insets.bottom + 40,
      }}
      showsVerticalScrollIndicator={false}
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

      <SignUpProgressBar currentStep={7} />

      {/* Header */}
      <YStack marginBottom={24}>
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
            name="checkmark-circle-outline"
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
          Review your profile
        </Text>

        <Text
          fontSize={15}
          fontFamily="Inter_400Regular"
          color={colors.textSecondary}
          lineHeight={22}
        >
          Make sure everything looks right before creating your account.
        </Text>
      </YStack>

      {/* Personal Info Section */}
      <YStack
        backgroundColor={colors.cardBackground}
        borderRadius={14}
        padding={20}
        marginBottom={12}
        borderWidth={1}
        borderColor={colors.border}
      >
        {renderSectionHeader(
          'person-outline',
          'Personal Info',
          '/(auth)/signup/step2-name'
        )}
        {renderRow('Name', `${formData.firstName} ${formData.lastName}`)}
        {renderRow('Date of Birth', formData.dob)}
        {renderRow('Email', formData.email)}
      </YStack>

      {/* Study Details Section */}
      <YStack
        backgroundColor={colors.cardBackground}
        borderRadius={14}
        padding={20}
        marginBottom={12}
        borderWidth={1}
        borderColor={colors.border}
      >
        {renderSectionHeader(
          'school-outline',
          'Study Details',
          '/(auth)/signup/step3-university'
        )}
        {renderRow('University', formData.university)}
        {renderRow('Course', formData.course)}
        {renderRow('Year', formData.yearOfStudy)}
      </YStack>

      {/* Study Preferences Section */}
      <YStack
        backgroundColor={colors.cardBackground}
        borderRadius={14}
        padding={20}
        marginBottom={12}
        borderWidth={1}
        borderColor={colors.border}
      >
        {renderSectionHeader(
          'bulb-outline',
          'Study Preferences',
          '/(auth)/signup/step4-preferences'
        )}
        {renderRow('Study Time', formData.studyTime?.join(', ') || '--')}
        {renderRow('Study Method', formData.studyMethod?.join(', ') || '--')}
        {renderRow('Mood', formData.currentMood?.join(', ') || '--')}
      </YStack>

      {/* Profile Section */}
      <YStack
        backgroundColor={colors.cardBackground}
        borderRadius={14}
        padding={20}
        marginBottom={12}
        borderWidth={1}
        borderColor={colors.border}
      >
        {renderSectionHeader(
          'camera-outline',
          'Profile',
          '/(auth)/signup/step5-photobio'
        )}
        {formData.photoUri ? (
          <XStack
            justifyContent="space-between"
            alignItems="center"
            paddingVertical={10}
            borderBottomWidth={0.5}
            borderBottomColor={colors.border}
          >
            <Text fontSize={14} color={colors.textSecondary}>
              Photo
            </Text>
            <Image
              source={{ uri: formData.photoUri }}
              style={{ width: 40, height: 40, borderRadius: 20 }}
              contentFit="cover"
            />
          </XStack>
        ) : (
          renderRow('Photo', 'Not set')
        )}
        {renderRow('Bio', formData.bio || 'Not set')}
      </YStack>

      {/* Consent */}
      <YStack marginTop={12} marginBottom={24} gap={14}>
        <View
          pressStyle={{ opacity: 0.7 }}
          onPress={() => updateField('consentTC', !formData.consentTC)}
        >
          <XStack alignItems="center">
            <View
              width={22}
              height={22}
              borderRadius={6}
              borderWidth={1.5}
              borderColor={
                formData.consentTC ? colors.primary : colors.borderDark
              }
              backgroundColor={
                formData.consentTC ? colors.primary : colors.backgroundSecondary
              }
              justifyContent="center"
              alignItems="center"
              marginRight={12}
            >
              {formData.consentTC && (
                <Ionicons name="checkmark" size={14} color="#fff" />
              )}
            </View>
            <Text
              flex={1}
              fontSize={14}
              color={colors.textSecondary}
              lineHeight={20}
            >
              I agree to the{' '}
              <Text
                color={colors.primary}
                fontFamily="Inter_600SemiBold"
                onPress={() => Linking.openURL('https://budie.app/terms')}
              >
                Terms & Conditions
              </Text>
            </Text>
          </XStack>
        </View>

        <View
          pressStyle={{ opacity: 0.7 }}
          onPress={() => updateField('consentPrivacy', !formData.consentPrivacy)}
        >
          <XStack alignItems="center">
            <View
              width={22}
              height={22}
              borderRadius={6}
              borderWidth={1.5}
              borderColor={
                formData.consentPrivacy ? colors.primary : colors.borderDark
              }
              backgroundColor={
                formData.consentPrivacy
                  ? colors.primary
                  : colors.backgroundSecondary
              }
              justifyContent="center"
              alignItems="center"
              marginRight={12}
            >
              {formData.consentPrivacy && (
                <Ionicons name="checkmark" size={14} color="#fff" />
              )}
            </View>
            <Text
              flex={1}
              fontSize={14}
              color={colors.textSecondary}
              lineHeight={20}
            >
              I agree to the{' '}
              <Text
                color={colors.primary}
                fontFamily="Inter_600SemiBold"
                onPress={() => Linking.openURL('https://budie.app/privacy')}
              >
                Privacy Policy
              </Text>
            </Text>
          </XStack>
        </View>
      </YStack>

      {/* Create Account Button */}
      <View
        backgroundColor={colors.primary}
        paddingVertical={16}
        borderRadius={10}
        opacity={
          !formData.consentTC || !formData.consentPrivacy || loading ? 0.5 : 1
        }
        pressStyle={{ opacity: 0.7 }}
        onPress={handleCreateAccount}
        disabled={loading}
      >
        <XStack alignItems="center" justifyContent="center">
          <Text
            fontSize={16}
            fontFamily="Inter_600SemiBold"
            color="#fff"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
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

      {/* Bottom Spacer */}
      <View height={40} />
    </ScrollView>
  );
}
