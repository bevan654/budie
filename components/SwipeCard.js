import React, { useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { View, YStack, XStack, Text } from 'tamagui';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import useThemeStore from '../stores/themeStore';
import { lightColors, darkColors } from '../constants/theme';
import { spacing, borderRadius } from '../constants/theme';

export default function SwipeCard({ profile, onPress }) {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <View
      flex={1}
      borderRadius={borderRadius.lg}
      backgroundColor={colors.black}
      overflow="hidden"
      onPress={onPress}
      pressStyle={{ opacity: 0.95 }}
      cursor="pointer"
    >
      <Image
        source={{ uri: profile.photo_url || 'https://via.placeholder.com/400' }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          opacity: imageLoaded ? 1 : 0,
        }}
        contentFit="cover"
        transition={200}
        onLoad={() => setImageLoaded(true)}
      />

      {!imageLoaded && (
        <YStack
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          backgroundColor={colors.imagePlaceholder}
          justifyContent="center"
          alignItems="center"
        >
          <ActivityIndicator color={colors.textTertiary} />
        </YStack>
      )}

      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.02)', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.85)']}
        locations={[0, 0.35, 0.65, 1]}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />

      <YStack
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        padding={spacing.xl}
        paddingBottom={110}
      >
        <XStack alignItems="baseline" gap={spacing.sm}>
          <Text
            fontSize={26}
            fontFamily="Inter_700Bold"
            color={colors.white}
            letterSpacing={-0.2}
          >
            {profile.name}
          </Text>
          <Text
            fontSize={20}
            fontFamily="Inter_400Regular"
            color="rgba(255,255,255,0.8)"
          >
            {profile.age}
          </Text>
        </XStack>

        <Text
          fontSize={13}
          color="rgba(255,255,255,0.55)"
          fontFamily="Inter_400Regular"
          marginTop={2}
          marginBottom={spacing.md}
        >
          {profile.pronouns}
        </Text>

        <XStack alignItems="center" marginBottom={spacing.md}>
          <Text
            fontSize={14}
            color="rgba(255,255,255,0.75)"
            fontFamily="Inter_500Medium"
          >
            {profile.course}
          </Text>
          <View
            width={3}
            height={3}
            borderRadius={1.5}
            backgroundColor="rgba(255,255,255,0.35)"
            marginHorizontal={spacing.sm}
          />
          <Text
            fontSize={14}
            color="rgba(255,255,255,0.75)"
            fontFamily="Inter_500Medium"
          >
            Year {profile.course_year}
          </Text>
        </XStack>

        <XStack flexWrap="wrap" gap={6}>
          <View
            backgroundColor="rgba(255,255,255,0.15)"
            paddingHorizontal={spacing.md}
            paddingVertical={spacing.xs + 2}
            borderRadius={borderRadius.sm}
          >
            <Text
              fontSize={12}
              fontFamily="Inter_500Medium"
              color="rgba(255,255,255,0.85)"
            >
              {profile.study_time}
            </Text>
          </View>
          <View
            backgroundColor="rgba(255,255,255,0.15)"
            paddingHorizontal={spacing.md}
            paddingVertical={spacing.xs + 2}
            borderRadius={borderRadius.sm}
          >
            <Text
              fontSize={12}
              fontFamily="Inter_500Medium"
              color="rgba(255,255,255,0.85)"
            >
              {profile.study_method}
            </Text>
          </View>
          <View
            backgroundColor={`${colors.primary}73`}
            paddingHorizontal={spacing.md}
            paddingVertical={spacing.xs + 2}
            borderRadius={borderRadius.sm}
          >
            <Text
              fontSize={12}
              fontFamily="Inter_500Medium"
              color={colors.white}
            >
              {profile.current_mood}
            </Text>
          </View>
        </XStack>
      </YStack>
    </View>
  );
}
