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
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../contexts/ThemeContext';
import { typography, spacing, borderRadius } from '../constants/theme';
import { validateEduEmail, validatePassword, validateRequired, validateDob } from '../utils/validation';
import { getErrorMessage } from '../utils/errorMessages';

const UNIVERSITIES = [
  'Australian Catholic University',
  'Australian National University',
  'Bond University',
  'Central Queensland University',
  'Charles Darwin University',
  'Charles Sturt University',
  'Curtin University',
  'Deakin University',
  'Edith Cowan University',
  'Federation University Australia',
  'Flinders University',
  'Griffith University',
  'James Cook University',
  'La Trobe University',
  'Macquarie University',
  'Monash University',
  'Murdoch University',
  'Queensland University of Technology',
  'RMIT University',
  'Southern Cross University',
  'Swinburne University of Technology',
  'University of Adelaide',
  'University of Canberra',
  'University of Melbourne',
  'University of New England',
  'University of New South Wales',
  'University of Newcastle',
  'University of Notre Dame Australia',
  'University of Queensland',
  'University of South Australia',
  'University of Southern Queensland',
  'University of Sydney',
  'University of Tasmania',
  'University of Technology Sydney',
  'University of the Sunshine Coast',
  'University of Western Australia',
  'University of Wollongong',
  'Victoria University',
  'Western Sydney University',
];

const YEAR_OPTIONS = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year+', 'Honours', 'Postgraduate'];

export default function SignUpScreen({ navigation }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [university, setUniversity] = useState('');
  const [course, setCourse] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [consentTC, setConsentTC] = useState(false);
  const [consentPrivacy, setConsentPrivacy] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showUniPicker, setShowUniPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [uniSearch, setUniSearch] = useState('');

  const { signUp } = useAuth();
  const { colors, inputStyles } = useTheme();
  const styles = useMemo(() => createStyles(colors, inputStyles), [colors, inputStyles]);

  const filteredUnis = useMemo(() => {
    if (!uniSearch) return UNIVERSITIES;
    const lower = uniSearch.toLowerCase();
    return UNIVERSITIES.filter(u => u.toLowerCase().includes(lower));
  }, [uniSearch]);

  const passwordStrength = useMemo(() => {
    if (!password) return { level: 0, label: '', color: colors.border };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score <= 1) return { level: 1, label: 'Weak', color: colors.error };
    if (score === 2) return { level: 2, label: 'Fair', color: '#F59E0B' };
    if (score === 3) return { level: 3, label: 'Good', color: '#3B82F6' };
    return { level: 4, label: 'Strong', color: colors.success };
  }, [password, colors]);

  const formatDobInput = (text) => {
    const digits = text.replace(/\D/g, '');
    let formatted = '';
    if (digits.length > 0) formatted += digits.substring(0, 2);
    if (digits.length > 2) formatted += '/' + digits.substring(2, 4);
    if (digits.length > 4) formatted += '/' + digits.substring(4, 8);
    setDob(formatted);
  };

  const parseDobToISO = (dobStr) => {
    const parts = dobStr.split('/');
    if (parts.length !== 3) return null;
    const [day, month, year] = parts;
    if (!day || !month || !year || year.length !== 4) return null;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  const handleSignUp = async () => {
    const firstNameCheck = validateRequired(firstName, 'First name');
    if (!firstNameCheck.valid) {
      Alert.alert('Validation Error', firstNameCheck.message);
      return;
    }

    const lastNameCheck = validateRequired(lastName, 'Last name');
    if (!lastNameCheck.valid) {
      Alert.alert('Validation Error', lastNameCheck.message);
      return;
    }

    const isoDate = parseDobToISO(dob);
    const dobCheck = validateDob(isoDate);
    if (!dobCheck.valid) {
      Alert.alert('Validation Error', dobCheck.message);
      return;
    }

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

    const emailCheck = validateEduEmail(email);
    if (!emailCheck.valid) {
      Alert.alert('Validation Error', emailCheck.message);
      return;
    }

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
      Alert.alert('Validation Error', passwordCheck.message);
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Validation Error', 'Passwords do not match');
      return;
    }

    if (!consentTC || !consentPrivacy) {
      Alert.alert('Consent Required', 'You must agree to the Terms & Conditions and Privacy Policy to create an account.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await signUp(email, password, {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        name: `${firstName.trim()} ${lastName.trim()}`,
        dob: isoDate,
        university: university,
        course: course.trim(),
        course_year: yearOfStudy,
      });

      if (data?.user) {
        if (data.user.identities && data.user.identities.length === 0) {
          Alert.alert('Info', 'This email is already registered. Please log in instead.');
          navigation.navigate('Login');
        } else if (data.session) {
          Alert.alert('Success', 'Account created successfully!');
        } else {
          Alert.alert(
            'Check your email',
            'Please check your university email to confirm your account before logging in.'
          );
        }
      } else {
        Alert.alert('Info', 'Signup completed but no user data returned. Try logging in.');
      }
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const renderPickerModal = (visible, onClose, title, data, onSelect, searchable) => (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.pickerContainer}>
        <View style={styles.pickerHandleRow}>
          <View style={styles.pickerHandle} />
        </View>
        <View style={styles.pickerHeader}>
          <Text style={styles.pickerTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.pickerCloseBtn}>
            <Ionicons name="close" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
        {searchable && (
          <View style={styles.pickerSearchWrap}>
            <Ionicons name="search-outline" size={18} color={colors.textTertiary} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.pickerSearchInput}
              placeholder="Search..."
              placeholderTextColor={colors.textTertiary}
              value={uniSearch}
              onChangeText={setUniSearch}
              autoFocus
            />
          </View>
        )}
        <FlatList
          data={data}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.pickerItem}
              onPress={() => {
                onSelect(item);
                onClose();
                if (searchable) setUniSearch('');
              }}
              activeOpacity={0.6}
            >
              <Text style={styles.pickerItemText}>{item}</Text>
              {((title === 'Select University' && university === item) ||
                (title === 'Select Year of Study' && yearOfStudy === item)) && (
                <Ionicons name="checkmark" size={20} color={colors.primary} />
              )}
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      </View>
    </Modal>
  );

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
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoWrap}>
            <Ionicons name="school" size={28} color={colors.primary} />
          </View>
          <Text style={styles.brand}>budie</Text>
          <Text style={styles.heading}>Create your account</Text>
          <Text style={styles.subheading}>Connect with study partners at your university</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>

          {/* Name Row */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>First Name</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  style={styles.input}
                  placeholder="First name"
                  placeholderTextColor={colors.textTertiary}
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                />
              </View>
            </View>
            <View style={{ width: 10 }} />
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Last Name</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  style={styles.input}
                  placeholder="Last name"
                  placeholderTextColor={colors.textTertiary}
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                />
              </View>
            </View>
          </View>

          {/* Date of Birth */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Date of Birth</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="calendar-outline" size={18} color={colors.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="DD/MM/YYYY"
                placeholderTextColor={colors.textTertiary}
                value={dob}
                onChangeText={formatDobInput}
                keyboardType="number-pad"
                maxLength={10}
              />
            </View>
          </View>

          {/* University Picker */}
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

          {/* Course */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Course</Text>
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

          {/* Year of Study Picker */}
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

          {/* Divider */}
          <View style={styles.sectionDivider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerLabel}>Account Details</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>University Email</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="mail-outline" size={18} color={colors.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="you@university.edu.au"
                placeholderTextColor={colors.textTertiary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
            <Text style={styles.helperText}>Only Australian university emails (.edu.au) are accepted</Text>
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Create a password"
                placeholderTextColor={colors.textTertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textTertiary} />
              </TouchableOpacity>
            </View>
            {password.length > 0 && (
              <View style={styles.strengthContainer}>
                <View style={styles.strengthBarBg}>
                  {[1, 2, 3, 4].map((i) => (
                    <View
                      key={i}
                      style={[
                        styles.strengthSegment,
                        { backgroundColor: i <= passwordStrength.level ? passwordStrength.color : colors.border },
                      ]}
                    />
                  ))}
                </View>
                <Text style={[styles.strengthLabel, { color: passwordStrength.color }]}>
                  {passwordStrength.label}
                </Text>
              </View>
            )}
          </View>

          {/* Confirm Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Confirm Password</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="shield-checkmark-outline" size={18} color={colors.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Re-enter your password"
                placeholderTextColor={colors.textTertiary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirm}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeBtn}>
                <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textTertiary} />
              </TouchableOpacity>
            </View>
            {confirmPassword.length > 0 && password !== confirmPassword && (
              <Text style={styles.mismatchText}>Passwords do not match</Text>
            )}
          </View>

          {/* Consent Section */}
          <View style={styles.consentSection}>
            <TouchableOpacity style={styles.consentRow} onPress={() => setConsentTC(!consentTC)} activeOpacity={0.7}>
              <View style={[styles.checkbox, consentTC && styles.checkboxChecked]}>
                {consentTC && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
              <Text style={styles.consentText}>
                I agree to the <Text style={styles.consentLink}>Terms & Conditions</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.consentRow} onPress={() => setConsentPrivacy(!consentPrivacy)} activeOpacity={0.7}>
              <View style={[styles.checkbox, consentPrivacy && styles.checkboxChecked]}>
                {consentPrivacy && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
              <Text style={styles.consentText}>
                I agree to the <Text style={styles.consentLink}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!consentTC || !consentPrivacy || loading) && { opacity: 0.5 },
            ]}
            onPress={handleSignUp}
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
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerDividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.7}
          >
            <Text style={styles.loginButtonText}>Already have an account? </Text>
            <Text style={styles.loginButtonBold}>Log In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Pickers */}
      {renderPickerModal(showUniPicker, () => { setShowUniPicker(false); setUniSearch(''); }, 'Select University', filteredUnis, setUniversity, true)}
      {renderPickerModal(showYearPicker, () => setShowYearPicker(false), 'Select Year of Study', YEAR_OPTIONS, setYearOfStudy, false)}
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors, inputStyles) => StyleSheet.create({
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

  // Header
  header: {
    marginBottom: 28,
  },
  logoWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  brand: {
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
    color: colors.primary,
    letterSpacing: -0.5,
    marginBottom: spacing.xs,
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

  // Form
  form: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
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
    paddingVertical: 13,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: colors.textPrimary,
  },
  eyeBtn: {
    padding: 4,
    marginLeft: 4,
  },
  pickerText: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: colors.textPrimary,
    paddingVertical: 13,
  },
  helperText: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },

  // Section Divider
  sectionDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xxl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerLabel: {
    marginHorizontal: spacing.md,
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Strength
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: 8,
  },
  strengthBarBg: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
  },
  strengthSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    width: 44,
    textAlign: 'right',
  },

  // Mismatch
  mismatchText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: colors.error,
    marginTop: spacing.xs,
  },

  // Consent
  consentSection: {
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

  // Footer
  footer: {
    marginTop: 28,
  },
  footerDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  dividerText: {
    marginHorizontal: spacing.lg,
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: colors.textTertiary,
  },
  loginButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.cardBackground,
  },
  loginButtonText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: colors.textSecondary,
  },
  loginButtonBold: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: colors.primary,
  },

  // Picker Modal
  pickerContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  pickerHandleRow: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  },
  pickerHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  pickerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  pickerCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerSearchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.xxl,
    marginBottom: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
  },
  pickerSearchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.textPrimary,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: spacing.xxl,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  pickerItemText: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    fontFamily: 'Inter_400Regular',
  },
});
