import React, { useState } from 'react';
import { Alert, ActivityIndicator } from 'react-native';
import { View, Text } from 'tamagui';
import { pickAndUploadPhoto, takeAndUploadPhoto } from '../services/photoService';
import useThemeStore from '../stores/themeStore';
import useToastStore from '../stores/toastStore';
import { lightColors, darkColors } from '../constants/theme';
import { getShadows } from '../constants/theme';

export default function PhotoUploadButton({ userId, onPhotoUploaded }) {
  const [uploading, setUploading] = useState(false);
  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;
  const shadows = getShadows(isDark);
  const showToast = useToastStore((s) => s.showToast);

  const handlePhotoUpload = () => {
    Alert.alert('Update Profile Photo', 'Choose an option', [
      {
        text: 'Take Photo',
        onPress: () => handleTakePhoto(),
      },
      {
        text: 'Choose from Library',
        onPress: () => handlePickPhoto(),
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]);
  };

  const handleTakePhoto = async () => {
    setUploading(true);
    try {
      const photoUrl = await takeAndUploadPhoto(userId);
      if (photoUrl) {
        onPhotoUploaded?.(photoUrl);
        showToast({ message: 'Photo updated successfully', type: 'success' });
      }
    } catch (error) {
      showToast({
        message: error.message || 'Failed to upload photo',
        type: 'error',
      });
    } finally {
      setUploading(false);
    }
  };

  const handlePickPhoto = async () => {
    setUploading(true);
    try {
      const photoUrl = await pickAndUploadPhoto(userId);
      if (photoUrl) {
        onPhotoUploaded?.(photoUrl);
        showToast({ message: 'Photo updated successfully', type: 'success' });
      }
    } catch (error) {
      showToast({
        message: error.message || 'Failed to upload photo',
        type: 'error',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <View
      position="absolute"
      bottom={10}
      right={10}
      width={36}
      height={36}
      borderRadius={18}
      backgroundColor={colors.primary}
      justifyContent="center"
      alignItems="center"
      onPress={handlePhotoUpload}
      disabled={uploading}
      pressStyle={{ opacity: 0.8 }}
      animation="fast"
      cursor="pointer"
      {...shadows.md}
    >
      {uploading ? (
        <ActivityIndicator size="small" color={colors.cardBackground} />
      ) : (
        <Text fontSize={18}>{'\uD83D\uDCF7'}</Text>
      )}
    </View>
  );
}
