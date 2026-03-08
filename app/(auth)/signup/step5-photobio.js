import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Alert, TextInput } from 'react-native';
import { YStack, XStack, Text, ScrollView, View } from 'tamagui';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useThemeStore from '../../../stores/themeStore';
import useSignupStore from '../../../stores/signupStore';
import { lightColors, darkColors } from '../../../constants/theme';
import SignUpProgressBar from '../../../components/SignUpProgressBar';

const BIO_MAX_LENGTH = 300;

export default function Step5PhotoBio() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;
  const formData = useSignupStore((s) => s.formData);
  const updateFields = useSignupStore((s) => s.updateFields);

  const [photoUri, setPhotoUri] = useState(formData.photoUri);
  const [bio, setBio] = useState(formData.bio || '');

  const handlePickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'We need photo library access to set your profile photo.'
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'We need camera access to take your profile photo.'
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handlePhotoPress = () => {
    Alert.alert('Profile Photo', 'Choose an option', [
      { text: 'Take Photo', onPress: handleTakePhoto },
      { text: 'Choose from Library', onPress: handlePickPhoto },
      ...(photoUri
        ? [
            {
              text: 'Remove Photo',
              onPress: () => setPhotoUri(null),
              style: 'destructive',
            },
          ]
        : []),
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleContinue = () => {
    updateFields({ photoUri, bio: bio.trim() });
    router.push('/(auth)/signup/step6-account');
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

        <SignUpProgressBar currentStep={5} />

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
            <Ionicons name="camera-outline" size={24} color={colors.primary} />
          </View>

          <Text
            fontSize={24}
            fontFamily="Inter_700Bold"
            color={colors.textPrimary}
            letterSpacing={-0.2}
            marginBottom={4}
          >
            Show yourself
          </Text>

          <Text
            fontSize={15}
            fontFamily="Inter_400Regular"
            color={colors.textSecondary}
            lineHeight={22}
          >
            Add a photo and tell others about yourself.
          </Text>
        </YStack>

        {/* Photo Picker */}
        <View
          alignItems="center"
          marginBottom={24}
          pressStyle={{ opacity: 0.7 }}
          onPress={handlePhotoPress}
        >
          {photoUri ? (
            <View position="relative">
              <Image
                source={{ uri: photoUri }}
                style={{ width: 120, height: 120, borderRadius: 60 }}
                contentFit="cover"
              />
              <View
                position="absolute"
                bottom={4}
                right={4}
                width={28}
                height={28}
                borderRadius={14}
                backgroundColor={colors.primary}
                justifyContent="center"
                alignItems="center"
              >
                <Ionicons name="pencil" size={14} color="#fff" />
              </View>
            </View>
          ) : (
            <View
              width={120}
              height={120}
              borderRadius={60}
              justifyContent="center"
              alignItems="center"
              borderWidth={2}
              borderStyle="dashed"
              backgroundColor={colors.backgroundSecondary}
              borderColor={colors.border}
            >
              <Ionicons name="camera" size={32} color={colors.textTertiary} />
              <Text
                fontSize={12}
                fontFamily="Inter_500Medium"
                color={colors.textTertiary}
                marginTop={4}
              >
                Add Photo
              </Text>
            </View>
          )}
        </View>

        {/* Bio Input */}
        <YStack marginBottom={20}>
          <Text
            fontSize={13}
            fontFamily="Inter_500Medium"
            color={colors.textSecondary}
            letterSpacing={0.2}
            textTransform="uppercase"
            marginBottom={6}
          >
            About Me
          </Text>
          <View
            backgroundColor={colors.backgroundSecondary}
            borderRadius={10}
            borderWidth={1}
            borderColor={colors.border}
            paddingHorizontal={14}
          >
            <TextInput
              style={{
                fontSize: 15,
                fontFamily: 'Inter_400Regular',
                color: colors.textPrimary,
                paddingVertical: 14,
                minHeight: 100,
                textAlignVertical: 'top',
              }}
              placeholder="Tell others about yourself..."
              placeholderTextColor={colors.textTertiary}
              value={bio}
              onChangeText={(text) => setBio(text.slice(0, BIO_MAX_LENGTH))}
              multiline
              numberOfLines={4}
            />
          </View>
          <Text
            fontSize={12}
            color={colors.textTertiary}
            textAlign="right"
            marginTop={4}
          >
            {bio.length}/{BIO_MAX_LENGTH}
          </Text>
        </YStack>

        {/* Continue Button */}
        <View
          backgroundColor={colors.primary}
          paddingVertical={16}
          borderRadius={10}
          marginTop={8}
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

        {/* Skip Button */}
        <View
          alignItems="center"
          paddingVertical={14}
          marginTop={8}
          pressStyle={{ opacity: 0.7 }}
          onPress={handleContinue}
        >
          <Text
            fontSize={14}
            fontFamily="Inter_500Medium"
            color={colors.textTertiary}
          >
            Skip for now
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
