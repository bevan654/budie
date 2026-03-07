import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { pickAndUploadPhoto, takeAndUploadPhoto } from '../services/photoService';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';

export default function PhotoUploadButton({ userId, onUploadComplete }) {
  const [uploading, setUploading] = useState(false);
  const { colors, shadows } = useTheme();
  const { showToast } = useToast();
  const styles = createStyles(colors, shadows);

  const handlePhotoUpload = () => {
    Alert.alert(
      'Update Profile Photo',
      'Choose an option',
      [
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
      ]
    );
  };

  const handleTakePhoto = async () => {
    setUploading(true);
    try {
      const photoUrl = await takeAndUploadPhoto(userId);
      if (photoUrl) {
        onUploadComplete?.(photoUrl);
        showToast({ message: 'Photo updated successfully', type: 'success' });
      }
    } catch (error) {
      showToast({ message: error.message || 'Failed to upload photo', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handlePickPhoto = async () => {
    setUploading(true);
    try {
      const photoUrl = await pickAndUploadPhoto(userId);
      if (photoUrl) {
        onUploadComplete?.(photoUrl);
        showToast({ message: 'Photo updated successfully', type: 'success' });
      }
    } catch (error) {
      showToast({ message: error.message || 'Failed to upload photo', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handlePhotoUpload}
      disabled={uploading}
    >
      {uploading ? (
        <ActivityIndicator size="small" color={colors.cardBackground} />
      ) : (
        <Text style={styles.buttonText}>{'\uD83D\uDCF7'}</Text>
      )}
    </TouchableOpacity>
  );
}

const createStyles = (colors, shadows) => StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  buttonText: {
    fontSize: 18,
  },
});
