import React, { useState, useEffect, useMemo } from 'react';
import { TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { YStack, XStack, Text, View, ScrollView } from 'tamagui';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import useThemeStore from '../../stores/themeStore';
import useToastStore from '../../stores/toastStore';
import { lightColors, darkColors } from '../../constants/theme';
import { spacing, borderRadius, fonts } from '../../constants/theme';

import { fetchProfile } from '../../services/profileService';
import { getErrorMessage } from '../../utils/errorMessages';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PHOTO_HEIGHT = 420;

export default function ProfileDetailScreen() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;
  const showToast = useToastStore((s) => s.showToast);

  useEffect(() => {
    if (id) {
      loadProfile();
    }
  }, [id]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await fetchProfile(id);
      setProfile(data);
    } catch (error) {
      showToast({ message: getErrorMessage(error), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <YStack flex={1} backgroundColor={colors.background} justifyContent="center" alignItems="center">
        <ActivityIndicator size="large" color={colors.primary} />
      </YStack>
    );
  }

  if (!profile) {
    return (
      <YStack flex={1} backgroundColor={colors.background} justifyContent="center" alignItems="center">
        <Text fontSize={15} color={colors.textSecondary}>
          Profile not found
        </Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text fontSize={15} color={colors.primary} fontFamily={fonts.semiBold}>
            Go back
          </Text>
        </TouchableOpacity>
      </YStack>
    );
  }

  return (
    <YStack flex={1} backgroundColor={colors.background}>
      <ScrollView flex={1} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Hero Image */}
        <View width={SCREEN_WIDTH} height={PHOTO_HEIGHT}>
          <Image
            source={{ uri: profile.photo_url || 'https://via.placeholder.com/400' }}
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: colors.imagePlaceholder,
            }}
            contentFit="cover"
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.25)', 'transparent', 'transparent', 'rgba(0,0,0,0.6)']}
            locations={[0, 0.2, 0.5, 1]}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />

          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            style={{
              position: 'absolute',
              top: insets.top + 6,
              left: 16,
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(0,0,0,0.3)',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 10,
            }}
          >
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>

          {/* Hero Info */}
          <YStack position="absolute" bottom={24} left={22} right={22}>
            <XStack alignItems="baseline" gap={8}>
              <Text
                fontSize={30}
                fontFamily={fonts.bold}
                color="#fff"
                letterSpacing={-0.3}
              >
                {profile.name}
              </Text>
              {profile.age ? (
                <Text
                  fontSize={22}
                  fontFamily={fonts.regular}
                  color="rgba(255,255,255,0.85)"
                >
                  {profile.age}
                </Text>
              ) : null}
            </XStack>
            {profile.pronouns ? (
              <Text
                fontSize={15}
                color="rgba(255,255,255,0.75)"
                fontFamily={fonts.medium}
                marginTop={3}
              >
                {profile.pronouns}
              </Text>
            ) : null}
          </YStack>
        </View>

        {/* Body */}
        <YStack paddingHorizontal={22} paddingTop={spacing.xl}>
          {/* Quick Chips */}
          {(profile.course || profile.course_year) && (
            <XStack flexWrap="wrap" gap={8} marginBottom={spacing.md}>
              {profile.course ? (
                <XStack
                  alignItems="center"
                  gap={6}
                  backgroundColor={colors.primaryLight}
                  paddingHorizontal={14}
                  paddingVertical={8}
                  borderRadius={9999}
                >
                  <Ionicons name="school-outline" size={14} color={colors.primary} />
                  <Text fontSize={13} fontFamily={fonts.semiBold} color={colors.primary}>
                    {profile.course}
                  </Text>
                </XStack>
              ) : null}
              {profile.course_year ? (
                <XStack
                  alignItems="center"
                  gap={6}
                  backgroundColor={colors.primaryLight}
                  paddingHorizontal={14}
                  paddingVertical={8}
                  borderRadius={9999}
                >
                  <Ionicons name="calendar-outline" size={14} color={colors.primary} />
                  <Text fontSize={13} fontFamily={fonts.semiBold} color={colors.primary}>
                    Year {profile.course_year}
                  </Text>
                </XStack>
              ) : null}
            </XStack>
          )}

          {/* Academic */}
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
          {renderInfoRow('school-outline', 'Course', profile.course)}
          {renderInfoRow('layers-outline', 'Year', profile.course_year)}

          <View height={0.5} backgroundColor={colors.border} marginVertical={spacing.xxl} />

          {/* Study Preferences */}
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
            {profile.study_time ? (
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
            {profile.study_method ? (
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
            {profile.current_mood ? (
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

          {/* Bio */}
          {profile.bio ? (
            <>
              <View height={0.5} backgroundColor={colors.border} marginVertical={spacing.xxl} />
              <Text
                fontSize={12}
                fontFamily={fonts.semiBold}
                color={colors.textTertiary}
                textTransform="uppercase"
                letterSpacing={0.8}
                marginBottom={spacing.md}
              >
                About
              </Text>
              <Text fontSize={15} color={colors.textSecondary} lineHeight={23}>
                {profile.bio}
              </Text>
            </>
          ) : null}
        </YStack>
      </ScrollView>
    </YStack>
  );
}
