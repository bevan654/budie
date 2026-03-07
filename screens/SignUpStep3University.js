import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useSignUp } from '../contexts/SignUpContext';
import { typography, spacing, borderRadius } from '../constants/theme';
import { validateRequired } from '../utils/validation';
import { UNIVERSITIES, YEAR_OPTIONS } from '../constants/universities';
import SignUpProgressBar from '../components/SignUpProgressBar';
import PickerModal from '../components/PickerModal';

export default function SignUpStep3University({ navigation }) {
  const { formData, updateFields } = useSignUp();
  const [university, setUniversity] = useState(formData.university);
  const [course, setCourse] = useState(formData.course);
  const [yearOfStudy, setYearOfStudy] = useState(formData.yearOfStudy);
  const [showUniPicker, setShowUniPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleContinue = () => {
    const uniCheck = validateRequired(university, 'University');
    if (!uniCheck.valid) {
      Alert.alert('Validation Error', uniCheck.message);
      return;
    }

    const courseCheck = validateRequired(course, 'Course');
    if (!courseCheck.valid) {
      Alert.alert('Validation Error', courseCheck.message);
      return;
    }

    const yearCheck = validateRequired(yearOfStudy, 'Year of study');
    if (!yearCheck.valid) {
      Alert.alert('Validation Error', yearCheck.message);
      return;
    }

    updateFields({
      university,
      course: course.trim(),
      yearOfStudy,
    });
    navigation.navigate('SignUpStepPreferences');
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

        <SignUpProgressBar currentStep={3} />

        <View style={styles.header}>
          <View style={styles.iconWrap}>
            <Ionicons name="business-outline" size={24} color={colors.primary} />
          </View>
          <Text style={styles.heading}>Your studies</Text>
          <Text style={styles.subheading}>Help us match you with the right study partners.</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>University</Text>
            <TouchableOpacity style={styles.inputWrap} onPress={() => setShowUniPicker(true)} activeOpacity={0.7}>
              <Ionicons name="business-outline" size={18} color={colors.textTertiary} style={styles.inputIcon} />
              <Text style={[styles.pickerText, !university && { color: colors.textTertiary }]}>
                {university || 'Select your university'}
              </Text>
              <Ionicons name="chevron-down" size={18} color={colors.textTertiary} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Course / Degree</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="book-outline" size={18} color={colors.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g. Bachelor of Computer Science"
                placeholderTextColor={colors.textTertiary}
                value={course}
                onChangeText={setCourse}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Year of Study</Text>
            <TouchableOpacity style={styles.inputWrap} onPress={() => setShowYearPicker(true)} activeOpacity={0.7}>
              <Ionicons name="layers-outline" size={18} color={colors.textTertiary} style={styles.inputIcon} />
              <Text style={[styles.pickerText, !yearOfStudy && { color: colors.textTertiary }]}>
                {yearOfStudy || 'Select year of study'}
              </Text>
              <Ionicons name="chevron-down" size={18} color={colors.textTertiary} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.continueButton} onPress={handleContinue} activeOpacity={0.7}>
          <Text style={styles.continueText}>Continue</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </ScrollView>

      <PickerModal
        visible={showUniPicker}
        onClose={() => setShowUniPicker(false)}
        title="Select University"
        data={UNIVERSITIES}
        onSelect={setUniversity}
        selectedValue={university}
        searchable
      />
      <PickerModal
        visible={showYearPicker}
        onClose={() => setShowYearPicker(false)}
        title="Select Year of Study"
        data={YEAR_OPTIONS}
        onSelect={setYearOfStudy}
        selectedValue={yearOfStudy}
      />
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
    marginBottom: spacing.xxxl,
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
  form: {
    flex: 1,
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    minHeight: 48,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: colors.textPrimary,
  },
  pickerText: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: colors.textPrimary,
    paddingVertical: 13,
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
});
