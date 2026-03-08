import React, { useEffect } from 'react';
import { Dimensions } from 'react-native';
import { YStack, XStack } from 'tamagui';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import useThemeStore from '../stores/themeStore';
import { lightColors, darkColors } from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function SkeletonBlock({ width, height, borderRadius = 8, style }) {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.7, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.imagePlaceholder,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

function Card() {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;

  return (
    <YStack
      flex={1}
      borderRadius={16}
      overflow="hidden"
      marginHorizontal={16}
      backgroundColor={colors.cardBackground}
    >
      <SkeletonBlock width="100%" height={360} borderRadius={16} />
      <YStack padding={16}>
        <SkeletonBlock width="60%" height={24} borderRadius={6} />
        <SkeletonBlock
          width="40%"
          height={16}
          borderRadius={6}
          style={{ marginTop: 10 }}
        />
        <XStack gap={8} marginTop={14}>
          <SkeletonBlock width={80} height={28} borderRadius={14} />
          <SkeletonBlock width={60} height={28} borderRadius={14} />
          <SkeletonBlock width={70} height={28} borderRadius={14} />
        </XStack>
      </YStack>
    </YStack>
  );
}

function ChatRow() {
  return (
    <XStack alignItems="center" paddingVertical={14} gap={14}>
      <SkeletonBlock width={52} height={52} borderRadius={26} />
      <YStack flex={1}>
        <SkeletonBlock width="50%" height={16} borderRadius={4} />
        <SkeletonBlock
          width="75%"
          height={14}
          borderRadius={4}
          style={{ marginTop: 8 }}
        />
      </YStack>
      <SkeletonBlock width={40} height={12} borderRadius={4} />
    </XStack>
  );
}

function ChatRowList() {
  return (
    <YStack paddingHorizontal={20} paddingTop={12}>
      {[1, 2, 3, 4, 5].map((i) => (
        <ChatRow key={i} />
      ))}
    </YStack>
  );
}

function ProfileGrid() {
  const itemWidth = (SCREEN_WIDTH - 48 - 12) / 2;

  return (
    <XStack flexWrap="wrap" paddingHorizontal={24} gap={12} paddingTop={12}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <YStack key={i} marginBottom={12}>
          <SkeletonBlock
            width={itemWidth}
            height={itemWidth * 1.2}
            borderRadius={12}
          />
          <SkeletonBlock
            width="70%"
            height={14}
            borderRadius={4}
            style={{ marginTop: 8 }}
          />
          <SkeletonBlock
            width="50%"
            height={12}
            borderRadius={4}
            style={{ marginTop: 4 }}
          />
        </YStack>
      ))}
    </XStack>
  );
}

const SkeletonLoader = Object.assign(SkeletonBlock, {
  Card,
  ChatRow: ChatRowList,
  ProfileGrid,
});

export default SkeletonLoader;
