import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Alert,
  Keyboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import { typography, spacing, borderRadius } from '../constants/theme';
import { validateAge, validateRequired } from '../utils/validation';
import { getErrorMessage } from '../utils/errorMessages';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LoadingSpinner from '../components/LoadingSpinner';
import PhotoUploadButton from '../components/PhotoUploadButton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PHOTO_HEIGHT = 360;

export default function ProfileScreen({ navigation }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    course: '',
    course_year: '',
    study_time: '',
    study_method: '',
    current_mood: '',
    age: '',
    pronouns: '',
    bio: '',
  });

  const { userId } = useAuth();
  const { profile, loading, updateProfile: updateProfileService, refetch } = useProfile(userId);
  const { colors, inputStyles } = useTheme();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors, inputStyles, insets), [colors, inputStyles, insets]);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        course: profile.course || '',
        course_year: profile.course_year || '',
        study_time: profile.study_time || '',
        study_method: profile.study_method || '',
        current_mood: profile.current_mood || '',
        age: profile.age?.toString() || '',
        pronouns: profile.pronouns || '',
        bio: profile.bio || '',
      });
    }
  }, [profile]);

  const completionPercentage = useMemo(() => {
    if (!profile) return 0;
    const fields = ['name', 'course', 'course_year', 'study_time', 'study_method', 'current_mood', 'age', 'pronouns', 'bio', 'photo_url'];
    const filled = fields.filter(f => profile[f] && String(profile[f]).trim() !== '').length;
    return Math.round((filled / fields.length) * 100);
  }, [profile]);

  const isFormDirty = () => {
    if (!profile) return false;
    return (
      formData.name !== (profile.name || '') ||
      formData.course !== (profile.course || '') ||
      formData.course_year !== (profile.course_year || '') ||
      formData.study_time !== (profile.study_time || '') ||
      formData.study_method !== (profile.study_method || '') ||
      formData.current_mood !== (profile.current_mood || '') ||
      formData.age !== (profile.age?.toString() || '') ||
      formData.pronouns !== (profile.pronouns || '') ||
      formData.bio !== (profile.bio || '')
    );
  };

  const handleSave = async () => {
    Keyboard.dismiss();
    const nameValidation = validateRequired(formData.name, 'Name');
    if (!nameValidation.valid) {
      showToast({ message: nameValidation.message, type: 'error' });
      return;
    }

    const ageValidation = validateAge(formData.age);
    if (!ageValidation.valid) {
      showToast({ message: ageValidation.message, type: 'error' });
      return;
    }

    setSaving(true);
    try {
      await updateProfileService({
        name: formData.name,
        course: formData.course,
        course_year: formData.course_year,
        study_time: formData.study_time,
        study_method: formData.study_method,
        current_mood: formData.current_mood,
        age: parseInt(formData.age),
        pronouns: formData.pronouns,
        bio: formData.bio,
      });

      setEditing(false);
      showToast({ message: 'Profile updated successfully', type: 'success' });
    } catch (error) {
      showToast({ message: getErrorMessage(error), type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    Keyboard.dismiss();
    if (isFormDirty()) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              if (profile) {
                setFormData({
                  name: profile.name || '',
                  course: profile.course || '',
                  course_year: profile.course_year || '',
                  study_time: profile.study_time || '',
                  study_method: profile.study_method || '',
                  current_mood: profile.current_mood || '',
                  age: profile.age?.toString() || '',
                  pronouns: profile.pronouns || '',
                  bio: profile.bio || '',
                });
              }
              setEditing(false);
            },
          },
        ]
      );
    } else {
      setEditing(false);
    }
  };

  const handlePhotoUpload = () => {
    refetch();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const renderInfoRow = (icon, label, value) => {
    if (!value) return null;
    return (
      <View style={styles.infoRow}>
        <Ionicons name={icon} size={18} color={colors.textTertiary} style={styles.infoRowIcon} />
        <Text style={styles.infoRowLabel}>{label}</Text>
        <Text style={styles.infoRowValue}>{value}</Text>
      </View>
    );
  };

  const renderEditField = (label, key, options = {}) => (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.fieldInput, options.multiline && styles.textArea]}
        value={formData[key]}
        onChangeText={(text) => setFormData({ ...formData, [key]: text })}
        placeholderTextColor={colors.textTertiary}
        placeholder={options.placeholder || `Enter ${label.toLowerCase()}`}
        keyboardType={options.keyboardType || 'default'}
        multiline={options.multiline || false}
        numberOfLines={options.numberOfLines || 1}
      />
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      {/* Hero Photo */}
      <View style={styles.heroContainer}>
        <Image
          source={{ uri: profile?.photo_url || 'https://via.placeholder.com/400' }}
          style={styles.heroImage}
        />
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Ionicons name="settings-outline" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={styles.heroInfo}>
          <Text style={styles.heroName}>
            {profile?.name}{profile?.age ? `, ${profile.age}` : ''}
          </Text>
          {profile?.pronouns ? (
            <Text style={styles.heroPronouns}>{profile.pronouns}</Text>
          ) : null}
        </View>
        <PhotoUploadButton userId={userId} onUploadComplete={handlePhotoUpload} />
      </View>

      {/* Action Row */}
      <View style={styles.actionRow}>
        {editing ? (
          <>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, saving && { opacity: 0.5 }]}
              onPress={handleSave}
              disabled={saving}
            >
              <Ionicons name="checkmark" size={18} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save'}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(true)}>
            <Ionicons name="create-outline" size={18} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Completion Bar */}
      {completionPercentage < 100 && (
        <View style={styles.completionWrap}>
          <View style={styles.completionRow}>
            <Text style={styles.completionLabel}>Profile completion</Text>
            <Text style={styles.completionPct}>{completionPercentage}%</Text>
          </View>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${completionPercentage}%` }]} />
          </View>
        </View>
      )}

      <View style={styles.body}>
        {editing ? (
          <>
            {/* Edit: Personal */}
            <Text style={styles.sectionLabel}>Personal</Text>
            {renderEditField('Name', 'name')}
            {renderEditField('Age', 'age', { keyboardType: 'numeric' })}
            {renderEditField('Pronouns', 'pronouns', { placeholder: 'e.g. he/him, she/her' })}

            <View style={styles.divider} />

            {/* Edit: Academic */}
            <Text style={styles.sectionLabel}>Academic</Text>
            {renderEditField('Course', 'course')}
            {renderEditField('Year', 'course_year', { placeholder: 'e.g. 2nd Year' })}

            <View style={styles.divider} />

            {/* Edit: Study */}
            <Text style={styles.sectionLabel}>Study Preferences</Text>
            {renderEditField('Study Time', 'study_time', { placeholder: 'e.g. Mornings, Evenings' })}
            {renderEditField('Study Method', 'study_method', { placeholder: 'e.g. Group Study, Library' })}
            {renderEditField('Mood', 'current_mood', { placeholder: 'e.g. Focused, Chill' })}

            <View style={styles.divider} />

            {/* Edit: Bio */}
            <Text style={styles.sectionLabel}>About Me</Text>
            {renderEditField('Bio', 'bio', { multiline: true, numberOfLines: 4, placeholder: 'Tell others about yourself...' })}
          </>
        ) : (
          <>
            {/* View: Academic */}
            <Text style={styles.sectionLabel}>Academic</Text>
            {renderInfoRow('school-outline', 'Course', profile?.course)}
            {renderInfoRow('layers-outline', 'Year', profile?.course_year)}

            <View style={styles.divider} />

            {/* View: Study Preferences */}
            <Text style={styles.sectionLabel}>Study Preferences</Text>
            <View style={styles.chipRow}>
              {profile?.study_time ? (
                <View style={styles.chip}>
                  <Ionicons name="time-outline" size={14} color={colors.primary} />
                  <Text style={styles.chipText}>{profile.study_time}</Text>
                </View>
              ) : null}
              {profile?.study_method ? (
                <View style={styles.chip}>
                  <Ionicons name="people-outline" size={14} color={colors.primary} />
                  <Text style={styles.chipText}>{profile.study_method}</Text>
                </View>
              ) : null}
              {profile?.current_mood ? (
                <View style={styles.chip}>
                  <Ionicons name="happy-outline" size={14} color={colors.primary} />
                  <Text style={styles.chipText}>{profile.current_mood}</Text>
                </View>
              ) : null}
            </View>

            {/* View: Bio */}
            {profile?.bio ? (
              <>
                <View style={styles.divider} />
                <Text style={styles.sectionLabel}>About Me</Text>
                <Text style={styles.bioText}>{profile.bio}</Text>
              </>
            ) : null}
          </>
        )}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const createStyles = (colors, inputStyles, insets) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Hero
  heroContainer: {
    width: SCREEN_WIDTH,
    height: PHOTO_HEIGHT,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.imagePlaceholder,
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: PHOTO_HEIGHT * 0.55,
  },
  heroInfo: {
    position: 'absolute',
    bottom: 22,
    left: 22,
    right: 22,
  },
  heroName: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
    letterSpacing: -0.3,
  },
  heroPronouns: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    fontFamily: 'Inter_500Medium',
    marginTop: 2,
  },
  settingsButton: {
    position: 'absolute',
    top: insets.top + 6,
    right: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  // Actions
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: 22,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xs,
    gap: 10,
  },
  editBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  editBtnText: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: colors.primary,
  },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  cancelBtnText: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: colors.textSecondary,
  },
  saveBtn: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
  },
  saveBtnText: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: '#fff',
  },

  // Completion
  completionWrap: {
    paddingHorizontal: 22,
    paddingTop: spacing.lg,
  },
  completionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  completionLabel: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: colors.textTertiary,
  },
  completionPct: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    color: colors.primary,
  },
  progressBg: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: colors.primary,
  },

  // Body
  body: {
    paddingHorizontal: 22,
    paddingTop: spacing.xxl,
  },

  // Section Labels
  sectionLabel: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.md,
  },

  // Divider
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: spacing.xxl,
  },

  // Info Rows
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
  },
  infoRowIcon: {
    marginRight: 14,
    width: 20,
    textAlign: 'center',
  },
  infoRowLabel: {
    fontSize: 15,
    color: colors.textSecondary,
    width: 70,
  },
  infoRowValue: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    color: colors.textPrimary,
    textAlign: 'right',
  },

  // Chips
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
  },
  chipText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: colors.primary,
  },

  // Bio
  bioText: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 23,
  },

  // Edit fields
  field: {
    marginBottom: spacing.lg,
  },
  fieldLabel: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: colors.textSecondary,
    marginBottom: spacing.xs + 2,
  },
  fieldInput: {
    ...inputStyles.default,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
});
