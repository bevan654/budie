import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useSignUp } from '../contexts/SignUpContext';
import { typography, spacing, borderRadius } from '../constants/theme';
import SignUpProgressBar from '../components/SignUpProgressBar';

const BIO_MAX_LENGTH = 300;

export default function SignUpStepPhotoBio({ navigation }) {
  const { formData, updateFields } = useSignUp();
  const [photoUri, setPhotoUri] = useState(formData.photoUri);
  const [bio, setBio] = useState(formData.bio || '');
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const handlePickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'We need photo library access to set your profile photo.');
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
      Alert.alert('Permission Required', 'We need camera access to take your profile photo.');
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
      ...(photoUri ? [{ text: 'Remove Photo', onPress: () => setPhotoUri(null), style: 'destructive' }] : []),
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleContinue = () => {
    updateFields({ photoUri, bio: bio.trim() });
    navigation.navigate('SignUpStep4Account');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        <SignUpProgressBar currentStep={6} />

        <View style={styles.header}>
          <View style={styles.iconWrap}>
            <Ionicons name="camera-outline" size={24} color={colors.primary} />
          </View>
          <Text style={styles.heading}>Your profile</Text>
          <Text style={styles.subheading}>Add a photo and tell others about yourself.</Text>
        </View>

        {/* Photo Picker */}
        <TouchableOpacity style={styles.photoContainer} onPress={handlePhotoPress} activeOpacity={0.7}>
          {photoUri ? (
            <View style={styles.photoWrapper}>
              <Image source={{ uri: photoUri }} style={styles.photo} />
              <View style={styles.photoEditBadge}>
                <Ionicons name="pencil" size={14} color={colors.white} />
              </View>
            </View>
          ) : (
            <View style={[styles.photoPlaceholder, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
              <Ionicons name="camera" size={32} color={colors.textTertiary} />
              <Text style={[styles.photoPlaceholderText, { color: colors.textTertiary }]}>Add Photo</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Bio Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>About Me</Text>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.bioInput}
              placeholder="Tell others about yourself..."
              placeholderTextColor={colors.textTertiary}
              value={bio}
              onChangeText={(text) => setBio(text.slice(0, BIO_MAX_LENGTH))}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
          <Text style={styles.charCount}>
            {bio.length}/{BIO_MAX_LENGTH}
          </Text>
        </View>

        <TouchableOpacity style={styles.continueButton} onPress={handleContinue} activeOpacity={0.7}>
          <Text style={styles.continueText}>Continue</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 8 }} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipButton} onPress={handleContinue} activeOpacity={0.7}>
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xxl,
    paddingTop: 60,
    paddingBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  header: {
    marginBottom: spacing.xxl,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  heading: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subheading: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  photoWrapper: {
    position: 'relative',
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  photoEditBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  photoPlaceholderText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    marginTop: 4,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.xs + 2,
    textTransform: 'uppercase',
  },
  inputWrap: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
  },
  bioInput: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: colors.textPrimary,
    paddingVertical: 14,
    minHeight: 100,
  },
  charCount: {
    fontSize: 12,
    color: colors.textTertiary,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: borderRadius.md,
    marginTop: spacing.xl,
  },
  continueText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#fff',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: spacing.sm,
  },
  skipText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: colors.textTertiary,
  },
});
