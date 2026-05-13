import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import { useSignUp } from '../contexts/SignUpContext';
import { typography, spacing, borderRadius } from '../constants/theme';
import { parseDobToISO } from '../utils/dobHelpers';
import { getErrorMessage } from '../utils/errorMessages';
import SignUpProgressBar from '../components/SignUpProgressBar';
import { uploadPhoto } from '../services/photoService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SignUpStep5Review({ navigation }) {
  const { formData, updateField, resetForm } = useSignUp();
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const { colors } = useTheme();
  const { showToast } = useToast();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleCreateAccount = async () => {
    if (!formData.consentTC || !formData.consentPrivacy) {
      showToast({ message: 'You must agree to the Terms & Conditions and Privacy Policy to create an account.', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const isoDate = parseDobToISO(formData.dob);
      const { data } = await signUp(formData.email, formData.password, {
        first_name: formData.firstName,
        last_name: formData.lastName,
        name: `${formData.firstName} ${formData.lastName}`,
        dob: isoDate,
        university: formData.university,
        course: formData.course,
        course_year: formData.yearOfStudy,
        study_time: formData.studyTime?.join(', ') || 'Afternoons',
        current_mood: formData.currentMood?.join(', ') || 'Focused',
        bio: formData.bio || '',
        prompts: formData.prompts || [],
        subjects: formData.subjects || [],
        interests: formData.interests || [],
        availability: formData.availability || [],
      });

      if (data?.user) {
        if (data.user.identities && data.user.identities.length === 0) {
          showToast({ message: 'This email is already registered. Please log in instead.', type: 'info' });
          resetForm();
          navigation.navigate('Login');
        } else if (data.session) {
          if (formData.photoUri) {
            try {
              await uploadPhoto(formData.photoUri, data.user.id);
            } catch (photoError) {
              console.warn('Photo upload failed:', photoError.message);
            }
          }
          try {
            await AsyncStorage.setItem('@budie_show_complete_profile_prompt', '1');
          } catch (e) {
            console.warn('Failed to set complete-profile flag:', e.message);
          }
          resetForm();
          showToast({ message: 'Account created successfully!', type: 'success' });
          navigation.navigate('Login');
        } else {
          if (formData.photoUri) {
            try {
              await AsyncStorage.setItem(
                `pendingPhoto:${formData.email.toLowerCase()}`,
                formData.photoUri
              );
            } catch (e) {
              console.warn('Failed to stash pending photo:', e.message);
            }
          }
          try {
            await AsyncStorage.setItem('@budie_show_complete_profile_prompt', '1');
          } catch (e) {
            console.warn('Failed to set complete-profile flag:', e.message);
          }
          resetForm();
          Alert.alert(
            'Check your email',
            'Please check your university email to confirm your account before logging in.'
          );
          navigation.navigate('Login');
        }
      } else {
        showToast({ message: 'Signup completed but no user data returned. Try logging in.', type: 'info' });
        resetForm();
        navigation.navigate('Login');
      }
    } catch (error) {
      showToast({ message: getErrorMessage(error), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const renderRow = (label, value) => (
    <View style={styles.reviewRow}>
      <Text style={styles.reviewLabel}>{label}</Text>
      <Text style={styles.reviewValue}>{value || '--'}</Text>
    </View>
  );

  const renderSectionHeader = (icon, title, editStep) => (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionIconWrap}>
        <Ionicons name={icon} size={16} color={colors.primary} />
      </View>
      <Text style={styles.sectionTitle}>{title}</Text>
      {editStep && (
        <TouchableOpacity onPress={() => navigation.navigate(editStep)} activeOpacity={0.6}>
          <Text style={styles.editLink}>Edit</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
      </TouchableOpacity>

      <SignUpProgressBar currentStep={6} />

      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Ionicons name="checkmark-circle-outline" size={24} color={colors.primary} />
        </View>
        <Text style={styles.heading}>Review your details</Text>
        <Text style={styles.subheading}>Make sure everything looks right before creating your account.</Text>
      </View>

      {/* Personal Info */}
      <View style={styles.section}>
        {renderSectionHeader('person-outline', 'Personal Info', 'SignUpStep2Name')}
        {renderRow('Name', `${formData.firstName} ${formData.lastName}`)}
        {renderRow('Date of Birth', formData.dob)}
        {renderRow('Email', formData.email)}
      </View>

      {/* Study Details */}
      <View style={styles.section}>
        {renderSectionHeader('school-outline', 'Study Details', 'SignUpStep3University')}
        {renderRow('University', formData.university)}
        {renderRow('Course', formData.course)}
        {renderRow('Year', formData.yearOfStudy)}
      </View>

      {/* Profile */}
      <View style={styles.section}>
        {renderSectionHeader('camera-outline', 'Profile', 'SignUpStepPhotoBio')}
        {formData.photoUri ? (
          <View style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>Photo</Text>
            <Image
              source={{ uri: formData.photoUri }}
              style={{ width: 40, height: 40, borderRadius: 20 }}
            />
          </View>
        ) : (
          renderRow('Photo', 'Not set')
        )}
        {renderRow('Bio', formData.bio || 'Not set')}
      </View>

      {/* Consent */}
      <View style={styles.consentSection}>
        <TouchableOpacity
          style={styles.consentRow}
          onPress={() => updateField('consentTC', !formData.consentTC)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, formData.consentTC && styles.checkboxChecked]}>
            {formData.consentTC && <Ionicons name="checkmark" size={14} color="#fff" />}
          </View>
          <Text style={styles.consentText}>
            I agree to the <Text style={styles.consentLink} onPress={() => Linking.openURL('https://budie.app/terms')}>Terms & Conditions</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.consentRow}
          onPress={() => updateField('consentPrivacy', !formData.consentPrivacy)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, formData.consentPrivacy && styles.checkboxChecked]}>
            {formData.consentPrivacy && <Ionicons name="checkmark" size={14} color="#fff" />}
          </View>
          <Text style={styles.consentText}>
            I agree to the <Text style={styles.consentLink} onPress={() => Linking.openURL('https://budie.app/privacy')}>Privacy Policy</Text>
          </Text>
        </TouchableOpacity>
      </View>

      {/* Submit */}
      <TouchableOpacity
        style={[
          styles.submitButton,
          (!formData.consentTC || !formData.consentPrivacy || loading) && { opacity: 0.5 },
        ]}
        onPress={handleCreateAccount}
        disabled={loading}
        activeOpacity={0.7}
      >
        {loading ? (
          <Text style={styles.submitText}>Creating Account...</Text>
        ) : (
          <>
            <Text style={styles.submitText}>Create Account</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 8 }} />
          </>
        )}
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
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

  // Sections
  section: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  sectionTitle: {
    ...typography.h5,
    color: colors.textPrimary,
    flex: 1,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  editLink: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: colors.primary,
  },

  // Review Rows
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  reviewLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  reviewValue: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: colors.textPrimary,
    flexShrink: 1,
    textAlign: 'right',
    marginLeft: spacing.md,
  },

  // Consent
  consentSection: {
    marginTop: spacing.md,
    marginBottom: spacing.xxl,
    gap: 14,
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.borderDark,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  consentText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  consentLink: {
    color: colors.primary,
    fontFamily: 'Inter_600SemiBold',
  },

  // Submit
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: borderRadius.md,
  },
  submitText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#fff',
  },
});
