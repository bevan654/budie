import React, { useState, useEffect, useMemo } from 'react';
import {
  TouchableOpacity,
  TextInput,
  Dimensions,
  Alert,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { YStack, XStack, Text, View, ScrollView } from 'tamagui';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import useAuthStore from '../../stores/authStore';
import useThemeStore from '../../stores/themeStore';
import useToastStore from '../../stores/toastStore';
import { lightColors, darkColors } from '../../constants/theme';
import { spacing, borderRadius, fonts, getInputStyles } from '../../constants/theme';

import { useProfile } from '../../hooks/useProfile';
import { validateAge, validateRequired } from '../../utils/validation';
import { getErrorMessage } from '../../utils/errorMessages';
import LoadingSpinner from '../../components/LoadingSpinner';
import PhotoUploadButton from '../../components/PhotoUploadButton';


const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PHOTO_HEIGHT = 360;

export default function ProfileScreen() {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    course: '',
    course_year: '',
    study_time: '',
    study_method: '',
    current_mood: '',
    age: '',
    pronouns: '',
    bio: '',
  });

  const router = useRouter();
  const insets = useSafeAreaInsets();

  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;
  const userId = useAuthStore((s) => s.userId);
  const showToast = useToastStore((s) => s.showToast);
  const inputStyles = getInputStyles(colors);

  const { profile, loading, updateProfile: updateProfileService, refetch } = useProfile(userId);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        course: profile.course || '',
        course_year: profile.course_year || '',
        study_time: profile.study_time || '',
        study_method: profile.study_method || '',
        current_mood: profile.current_mood || '',
        age: profile.age?.toString() || '',
        pronouns: profile.pronouns || '',
        bio: profile.bio || '',
      });
    }
  }, [profile]);

  const completionPercentage = useMemo(() => {
    if (!profile) return 0;
    const fields = [
      'name',
      'course',
      'course_year',
      'study_time',
      'study_method',
      'current_mood',
      'age',
      'pronouns',
      'bio',
      'photo_url',
    ];
    const filled = fields.filter(
      (f) => profile[f] && String(profile[f]).trim() !== ''
    ).length;
    return Math.round((filled / fields.length) * 100);
  }, [profile]);

  const isFormDirty = () => {
    if (!profile) return false;
    return (
      formData.name !== (profile.name || '') ||
      formData.course !== (profile.course || '') ||
      formData.course_year !== (profile.course_year || '') ||
      formData.study_time !== (profile.study_time || '') ||
      formData.study_method !== (profile.study_method || '') ||
      formData.current_mood !== (profile.current_mood || '') ||
      formData.age !== (profile.age?.toString() || '') ||
      formData.pronouns !== (profile.pronouns || '') ||
      formData.bio !== (profile.bio || '')
    );
  };

  const handleSave = async () => {
    Keyboard.dismiss();
    const nameValidation = validateRequired(formData.name, 'Name');
    if (!nameValidation.valid) {
      showToast({ message: nameValidation.message, type: 'error' });
      return;
    }

    const ageValidation = validateAge(formData.age);
    if (!ageValidation.valid) {
      showToast({ message: ageValidation.message, type: 'error' });
      return;
    }

    setSaving(true);
    try {
      await updateProfileService({
        name: formData.name,
        course: formData.course,
        course_year: formData.course_year,
        study_time: formData.study_time,
        study_method: formData.study_method,
        current_mood: formData.current_mood,
        age: parseInt(formData.age),
        pronouns: formData.pronouns,
        bio: formData.bio,
      });

      setEditing(false);
      showToast({ message: 'Profile updated successfully', type: 'success' });
    } catch (error) {
      showToast({ message: getErrorMessage(error), type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    Keyboard.dismiss();
    if (isFormDirty()) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              if (profile) {
                setFormData({
                  name: profile.name || '',
                  course: profile.course || '',
                  course_year: profile.course_year || '',
                  study_time: profile.study_time || '',
                  study_method: profile.study_method || '',
                  current_mood: profile.current_mood || '',
                  age: profile.age?.toString() || '',
                  pronouns: profile.pronouns || '',
                  bio: profile.bio || '',
                });
              }
              setEditing(false);
            },
          },
        ]
      );
    } else {
      setEditing(false);
    }
  };

  const handlePhotoUpload = () => {
    refetch();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const renderInfoRow = (icon, label, value) => {
    if (!value) return null;
    return (
      <XStack alignItems="center" paddingVertical={13}>
        <Ionicons
          name={icon}
          size={18}
          color={colors.textTertiary}
          style={{ marginRight: 14, width: 20, textAlign: 'center' }}
        />
        <Text fontSize={15} color={colors.textSecondary} width={70}>
          {label}
        </Text>
        <Text
          flex={1}
          fontSize={15}
          fontFamily={fonts.medium}
          color={colors.textPrimary}
          textAlign="right"
        >
          {value}
        </Text>
      </XStack>
    );
  };

  const renderEditField = (label, key, options = {}) => (
    <YStack marginBottom={spacing.lg}>
      <Text
        fontSize={13}
        fontFamily={fonts.medium}
        color={colors.textSecondary}
        marginBottom={spacing.xs + 2}
      >
        {label}
      </Text>
      <TextInput
        style={[
          inputStyles.default,
          options.multiline && { height: 100, textAlignVertical: 'top' },
        ]}
        value={formData[key]}
        onChangeText={(text) => setFormData({ ...formData, [key]: text })}
        placeholderTextColor={colors.textTertiary}
        placeholder={options.placeholder || `Enter ${label.toLowerCase()}`}
        keyboardType={options.keyboardType || 'default'}
        multiline={options.multiline || false}
        numberOfLines={options.numberOfLines || 1}
      />
    </YStack>
  );

  return (
    <ScrollView
      flex={1}
      backgroundColor={colors.background}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Hero Photo */}
      <View width={SCREEN_WIDTH} height={PHOTO_HEIGHT}>
        <Image
          source={{ uri: profile?.photo_url || 'https://via.placeholder.com/400' }}
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: colors.imagePlaceholder,
          }}
          contentFit="cover"
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.1)', 'transparent', 'rgba(0,0,0,0.6)']}
          locations={[0, 0.3, 1]}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: PHOTO_HEIGHT * 0.55,
          }}
        />

        {/* Settings Button */}
        <TouchableOpacity
          onPress={() => router.push('/settings')}
          style={{
            position: 'absolute',
            top: insets.top + 6,
            right: 16,
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: 'rgba(0,0,0,0.3)',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10,
          }}
        >
          <Ionicons name="settings-outline" size={20} color="#fff" />
        </TouchableOpacity>

        {/* Hero Info */}
        <YStack position="absolute" bottom={22} left={22} right={22}>
          <Text
            fontSize={28}
            fontFamily={fonts.bold}
            color="#fff"
            letterSpacing={-0.3}
          >
            {profile?.name}
            {profile?.age ? `, ${profile.age}` : ''}
          </Text>
          {profile?.pronouns ? (
            <Text
              fontSize={15}
              color="rgba(255,255,255,0.8)"
              fontFamily={fonts.medium}
              marginTop={2}
            >
              {profile.pronouns}
            </Text>
          ) : null}
        </YStack>

        {/* Photo Upload */}
        <PhotoUploadButton userId={userId} onUploadComplete={handlePhotoUpload} />
      </View>

      {/* Action Row */}
      <XStack paddingHorizontal={22} paddingTop={spacing.lg} paddingBottom={spacing.xs} gap={10}>
        {editing ? (
          <>
            <TouchableOpacity
              onPress={handleCancel}
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 12,
                borderRadius: borderRadius.md,
                borderWidth: 1.5,
                borderColor: colors.border,
              }}
            >
              <Text fontSize={15} fontFamily={fonts.semiBold} color={colors.textSecondary}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              style={{
                flex: 1.5,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 12,
                borderRadius: borderRadius.md,
                backgroundColor: colors.primary,
                opacity: saving ? 0.5 : 1,
              }}
            >
              <Ionicons name="checkmark" size={18} color="#fff" style={{ marginRight: 6 }} />
              <Text fontSize={15} fontFamily={fonts.semiBold} color="#fff">
                {saving ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            onPress={() => setEditing(true)}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 12,
              borderRadius: borderRadius.md,
              borderWidth: 1.5,
              borderColor: colors.primary,
            }}
          >
            <Ionicons
              name="create-outline"
              size={18}
              color={colors.primary}
              style={{ marginRight: 6 }}
            />
            <Text fontSize={15} fontFamily={fonts.semiBold} color={colors.primary}>
              Edit Profile
            </Text>
          </TouchableOpacity>
        )}
      </XStack>

      {/* Completion Bar */}
      {completionPercentage < 100 && (
        <YStack paddingHorizontal={22} paddingTop={spacing.lg}>
          <XStack justifyContent="space-between" alignItems="center" marginBottom={6}>
            <Text fontSize={13} fontFamily={fonts.medium} color={colors.textTertiary}>
              Profile completion
            </Text>
            <Text fontSize={13} fontFamily={fonts.bold} color={colors.primary}>
              {completionPercentage}%
            </Text>
          </XStack>
          <View
            height={4}
            borderRadius={2}
            backgroundColor={colors.border}
            overflow="hidden"
          >
            <View
              height="100%"
              borderRadius={2}
              backgroundColor={colors.primary}
              width={`${completionPercentage}%`}
            />
          </View>
        </YStack>
      )}

      {/* Body */}
      <YStack paddingHorizontal={22} paddingTop={spacing.xxl}>
        {editing ? (
          <>
            {/* Edit: Personal */}
            <Text
              fontSize={12}
              fontFamily={fonts.semiBold}
              color={colors.textTertiary}
              textTransform="uppercase"
              letterSpacing={0.8}
              marginBottom={spacing.md}
            >
              Personal
            </Text>
            {renderEditField('Name', 'name')}
            {renderEditField('Age', 'age', { keyboardType: 'numeric' })}
            {renderEditField('Pronouns', 'pronouns', {
              placeholder: 'e.g. he/him, she/her',
            })}

            <View height={0.5} backgroundColor={colors.border} marginVertical={spacing.xxl} />

            {/* Edit: Academic */}
            <Text
              fontSize={12}
              fontFamily={fonts.semiBold}
              color={colors.textTertiary}
              textTransform="uppercase"
              letterSpacing={0.8}
              marginBottom={spacing.md}
            >
              Academic
            </Text>
            {renderEditField('Course', 'course')}
            {renderEditField('Year', 'course_year', { placeholder: 'e.g. 2nd Year' })}

            <View height={0.5} backgroundColor={colors.border} marginVertical={spacing.xxl} />

            {/* Edit: Study */}
            <Text
              fontSize={12}
              fontFamily={fonts.semiBold}
              color={colors.textTertiary}
              textTransform="uppercase"
              letterSpacing={0.8}
              marginBottom={spacing.md}
            >
              Study Preferences
            </Text>
            {renderEditField('Study Time', 'study_time', {
              placeholder: 'e.g. Mornings, Evenings',
            })}
            {renderEditField('Study Method', 'study_method', {
              placeholder: 'e.g. Group Study, Library',
            })}
            {renderEditField('Mood', 'current_mood', {
              placeholder: 'e.g. Focused, Chill',
            })}

            <View height={0.5} backgroundColor={colors.border} marginVertical={spacing.xxl} />

            {/* Edit: Bio */}
            <Text
              fontSize={12}
              fontFamily={fonts.semiBold}
              color={colors.textTertiary}
              textTransform="uppercase"
              letterSpacing={0.8}
              marginBottom={spacing.md}
            >
              About Me
            </Text>
            {renderEditField('Bio', 'bio', {
              multiline: true,
              numberOfLines: 4,
              placeholder: 'Tell others about yourself...',
            })}
          </>
        ) : (
          <>
            {/* View: Academic */}
            <Text
              fontSize={12}
              fontFamily={fonts.semiBold}
              color={colors.textTertiary}
              textTransform="uppercase"
              letterSpacing={0.8}
              marginBottom={spacing.md}
            >
              Academic
            </Text>
            {renderInfoRow('school-outline', 'Course', profile?.course)}
            {renderInfoRow('layers-outline', 'Year', profile?.course_year)}

            <View height={0.5} backgroundColor={colors.border} marginVertical={spacing.xxl} />

            {/* View: Study Preferences */}
            <Text
              fontSize={12}
              fontFamily={fonts.semiBold}
              color={colors.textTertiary}
              textTransform="uppercase"
              letterSpacing={0.8}
              marginBottom={spacing.md}
            >
              Study Preferences
            </Text>
            <XStack flexWrap="wrap" gap={8}>
              {profile?.study_time ? (
                <XStack
                  alignItems="center"
                  gap={6}
                  backgroundColor={colors.primaryLight}
                  paddingHorizontal={14}
                  paddingVertical={8}
                  borderRadius={9999}
                >
                  <Ionicons name="time-outline" size={14} color={colors.primary} />
                  <Text fontSize={13} fontFamily={fonts.semiBold} color={colors.primary}>
                    {profile.study_time}
                  </Text>
                </XStack>
              ) : null}
              {profile?.study_method ? (
                <XStack
                  alignItems="center"
                  gap={6}
                  backgroundColor={colors.primaryLight}
                  paddingHorizontal={14}
                  paddingVertical={8}
                  borderRadius={9999}
                >
                  <Ionicons name="people-outline" size={14} color={colors.primary} />
                  <Text fontSize={13} fontFamily={fonts.semiBold} color={colors.primary}>
                    {profile.study_method}
                  </Text>
                </XStack>
              ) : null}
              {profile?.current_mood ? (
                <XStack
                  alignItems="center"
                  gap={6}
                  backgroundColor={colors.primaryLight}
                  paddingHorizontal={14}
                  paddingVertical={8}
                  borderRadius={9999}
                >
                  <Ionicons name="happy-outline" size={14} color={colors.primary} />
                  <Text fontSize={13} fontFamily={fonts.semiBold} color={colors.primary}>
                    {profile.current_mood}
                  </Text>
                </XStack>
              ) : null}
            </XStack>

            {/* View: Bio */}
            {profile?.bio ? (
              <>
                <View
                  height={0.5}
                  backgroundColor={colors.border}
                  marginVertical={spacing.xxl}
                />
                <Text
                  fontSize={12}
                  fontFamily={fonts.semiBold}
                  color={colors.textTertiary}
                  textTransform="uppercase"
                  letterSpacing={0.8}
                  marginBottom={spacing.md}
                >
                  About Me
                </Text>
                <Text fontSize={15} color={colors.textSecondary} lineHeight={23}>
                  {profile.bio}
                </Text>
              </>
            ) : null}
          </>
        )}
      </YStack>

      {/* Bottom spacer */}
      <View height={40} />
    </ScrollView>
  );
}
