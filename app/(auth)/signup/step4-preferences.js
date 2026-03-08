import React, { useState } from 'react';
import { YStack, XStack, Text, ScrollView, View } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useThemeStore from '../../../stores/themeStore';
import useSignupStore from '../../../stores/signupStore';
import useToastStore from '../../../stores/toastStore';
import { lightColors, darkColors } from '../../../constants/theme';
import SignUpProgressBar from '../../../components/SignUpProgressBar';
import FilterChip from '../../../components/FilterChip';

const STUDY_TIMES = ['Morning', 'Afternoon', 'Evening', 'Night', 'Flexible'];
const STUDY_METHODS = ['Solo', 'Group', 'Hybrid', 'Library', 'Online'];
const MOODS = ['Focused', 'Chill', 'Motivated', 'Stressed', 'Social', 'Quiet'];

export default function Step4Preferences() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;
  const formData = useSignupStore((s) => s.formData);
  const updateFields = useSignupStore((s) => s.updateFields);
  const showToast = useToastStore((s) => s.showToast);

  const [studyTime, setStudyTime] = useState(formData.studyTime || []);
  const [studyMethod, setStudyMethod] = useState(formData.studyMethod || []);
  const [currentMood, setCurrentMood] = useState(formData.currentMood || []);

  const toggleSelection = (list, setList, value) => {
    if (list.includes(value)) {
      setList(list.filter((item) => item !== value));
    } else {
      setList([...list, value]);
    }
  };

  const handleContinue = () => {
    if (studyTime.length === 0) {
      showToast({ message: 'Please select at least one study time', type: 'error' });
      return;
    }
    if (studyMethod.length === 0) {
      showToast({ message: 'Please select at least one study method', type: 'error' });
      return;
    }
    if (currentMood.length === 0) {
      showToast({ message: 'Please select at least one mood', type: 'error' });
      return;
    }

    updateFields({ studyTime, studyMethod, currentMood });
    router.push('/(auth)/signup/step5-photobio');
  };

  return (
    <ScrollView
      flex={1}
      backgroundColor={colors.background}
      contentContainerStyle={{
        flexGrow: 1,
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

      <SignUpProgressBar currentStep={4} />

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
          <Ionicons name="bulb-outline" size={24} color={colors.primary} />
        </View>

        <Text
          fontSize={24}
          fontFamily="Inter_700Bold"
          color={colors.textPrimary}
          letterSpacing={-0.2}
          marginBottom={4}
        >
          Your study style
        </Text>

        <Text
          fontSize={15}
          fontFamily="Inter_400Regular"
          color={colors.textSecondary}
          lineHeight={22}
        >
          Help us find your ideal study partners.
        </Text>
      </YStack>

      {/* Sections */}
      <YStack flex={1}>
        {/* Study Time */}
        <YStack marginBottom={20}>
          <Text
            fontSize={13}
            fontFamily="Inter_500Medium"
            color={colors.textSecondary}
            letterSpacing={0.2}
            textTransform="uppercase"
            marginBottom={8}
          >
            When do you study?
          </Text>
          <XStack flexWrap="wrap">
            {STUDY_TIMES.map((time) => (
              <FilterChip
                key={time}
                label={time}
                selected={studyTime.includes(time)}
                onPress={() => toggleSelection(studyTime, setStudyTime, time)}
              />
            ))}
          </XStack>
        </YStack>

        {/* Study Method */}
        <YStack marginBottom={20}>
          <Text
            fontSize={13}
            fontFamily="Inter_500Medium"
            color={colors.textSecondary}
            letterSpacing={0.2}
            textTransform="uppercase"
            marginBottom={8}
          >
            How do you study?
          </Text>
          <XStack flexWrap="wrap">
            {STUDY_METHODS.map((method) => (
              <FilterChip
                key={method}
                label={method}
                selected={studyMethod.includes(method)}
                onPress={() => toggleSelection(studyMethod, setStudyMethod, method)}
              />
            ))}
          </XStack>
        </YStack>

        {/* Current Mood */}
        <YStack marginBottom={20}>
          <Text
            fontSize={13}
            fontFamily="Inter_500Medium"
            color={colors.textSecondary}
            letterSpacing={0.2}
            textTransform="uppercase"
            marginBottom={8}
          >
            What's your vibe?
          </Text>
          <XStack flexWrap="wrap">
            {MOODS.map((mood) => (
              <FilterChip
                key={mood}
                label={mood}
                selected={currentMood.includes(mood)}
                onPress={() => toggleSelection(currentMood, setCurrentMood, mood)}
              />
            ))}
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
  );
}
