import React, { useEffect } from 'react';
import { Modal, Dimensions } from 'react-native';
import { YStack, XStack, Text, View } from 'tamagui';
import { Image } from 'expo-image';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import useThemeStore from '../stores/themeStore';
import { lightColors, darkColors } from '../constants/theme';
import { spacing, borderRadius } from '../constants/theme';
import { hapticSuccess } from '../utils/haptics';
import Button from './Button';

const { width } = Dimensions.get('window');

export default function MatchModal({
  visible,
  onClose,
  currentUserProfile,
  matchedProfile,
  onSendMessage,
}) {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;

  const containerScale = useSharedValue(0);
  const containerOpacity = useSharedValue(0);
  const heartScale = useSharedValue(1);
  const leftTilt = useSharedValue(0);
  const rightTilt = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      hapticSuccess();
      containerOpacity.value = withTiming(1, { duration: 300 });
      containerScale.value = withSpring(1, { damping: 12, stiffness: 100 });
      leftTilt.value = withTiming(-3, { duration: 400 });
      rightTilt.value = withTiming(3, { duration: 400 });

      // Heart pulse after main animation
      setTimeout(() => {
        heartScale.value = withSequence(
          withTiming(1.25, { duration: 200 }),
          withTiming(1, { duration: 200 }),
          withTiming(1.2, { duration: 180 }),
          withTiming(1, { duration: 180 })
        );
      }, 400);
    } else {
      containerScale.value = 0;
      containerOpacity.value = 0;
      heartScale.value = 1;
      leftTilt.value = 0;
      rightTilt.value = 0;
    }
  }, [visible]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: containerScale.value }],
  }));

  const leftImageStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${leftTilt.value}deg` }],
  }));

  const rightImageStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rightTilt.value}deg` }],
  }));

  const heartAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  if (!matchedProfile || !currentUserProfile) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View
        style={[
          {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            justifyContent: 'center',
            alignItems: 'center',
          },
          overlayStyle,
        ]}
      >
        <Animated.View
          style={[
            {
              width: width * 0.85,
              backgroundColor: colors.cardBackground,
              borderRadius: borderRadius.lg,
              padding: spacing.xxxl,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: colors.border,
            },
            cardStyle,
          ]}
        >
          <Text
            fontSize={28}
            fontFamily="Inter_700Bold"
            letterSpacing={-0.3}
            color={colors.textPrimary}
            marginBottom={spacing.sm}
          >
            Study Buddy Found!
          </Text>
          <Text
            fontSize={15}
            fontFamily="Inter_400Regular"
            lineHeight={22}
            color={colors.textSecondary}
            textAlign="center"
            marginBottom={spacing.xxl}
          >
            You and {matchedProfile.name} want to study together
          </Text>

          <XStack
            alignItems="center"
            justifyContent="center"
            marginBottom={spacing.xxl}
          >
            {/* Left profile image */}
            <Animated.View
              style={[
                {
                  borderRadius: 60,
                  borderWidth: 2,
                  borderColor: colors.primary,
                },
                leftImageStyle,
              ]}
            >
              <Image
                source={{
                  uri:
                    currentUserProfile.photo_url ||
                    'https://via.placeholder.com/400',
                }}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  backgroundColor: colors.backgroundSecondary,
                }}
                contentFit="cover"
                transition={200}
              />
            </Animated.View>

            {/* Heart */}
            <Animated.View
              style={[
                { marginHorizontal: spacing.lg },
                heartAnimStyle,
              ]}
            >
              <Text fontSize={36} color={colors.primary}>
                {'\u2665'}
              </Text>
            </Animated.View>

            {/* Right profile image */}
            <Animated.View
              style={[
                {
                  borderRadius: 60,
                  borderWidth: 2,
                  borderColor: colors.primary,
                },
                rightImageStyle,
              ]}
            >
              <Image
                source={{
                  uri:
                    matchedProfile.photo_url ||
                    'https://via.placeholder.com/400',
                }}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  backgroundColor: colors.backgroundSecondary,
                }}
                contentFit="cover"
                transition={200}
              />
            </Animated.View>
          </XStack>

          <YStack width="100%" gap={spacing.md}>
            <Button
              title="Say Hello"
              onPress={onSendMessage}
              variant="primary"
            />
            <Button
              title="Keep Browsing"
              onPress={onClose}
              variant="outline"
            />
          </YStack>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
