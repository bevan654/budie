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
  Switch,
  Linking,
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
import { hapticLight } from '../utils/haptics';
import LoadingSpinner from '../components/LoadingSpinner';
import PhotoUploadButton from '../components/PhotoUploadButton';
import FilterChip from '../components/FilterChip';
import PickerModal from '../components/PickerModal';
import AppHeader from '../components/AppHeader';
import {
  PROMPT_QUESTIONS,
  INTEREST_OPTIONS,
  DAY_OPTIONS,
  MAX_PROMPTS,
  MAX_SUBJECTS,
} from '../constants/profileOptions';
import { getProfileCompleteness } from '../utils/profileCompleteness';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PHOTO_HEIGHT = Math.round(SCREEN_WIDTH * 1.15);

export default function ProfileScreen({ navigation }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    course: '',
    course_year: '',
    study_time: '',
    current_mood: '',
    age: '',
    pronouns: '',
    bio: '',
    prompts: [],
    subjects: [],
    interests: [],
    availability: [],
  });
  const [subjectInput, setSubjectInput] = useState('');
  const [pickerSlot, setPickerSlot] = useState(null);

  // Settings state
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [messageNotifs, setMessageNotifs] = useState(true);
  const [matchNotifs, setMatchNotifs] = useState(true);
  const [likeNotifs, setLikeNotifs] = useState(false);

  const { userId, signOut } = useAuth();
  const { profile, loading, updateProfile: updateProfileService, refetch } = useProfile(userId);
  const { colors, inputStyles, isDark, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors, inputStyles, insets), [colors, inputStyles, insets]);

  const hydrateForm = (p) => ({
    name: p?.name || '',
    course: p?.course || '',
    course_year: p?.course_year || '',
    study_time: p?.study_time || '',
    current_mood: p?.current_mood || '',
    age: p?.age?.toString() || '',
    pronouns: p?.pronouns || '',
    bio: p?.bio || '',
    prompts: Array.isArray(p?.prompts) ? p.prompts : [],
    subjects: Array.isArray(p?.subjects) ? p.subjects : [],
    interests: Array.isArray(p?.interests) ? p.interests : [],
    availability: Array.isArray(p?.availability) ? p.availability : [],
  });

  useEffect(() => {
    if (profile) setFormData(hydrateForm(profile));
  }, [profile]);

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
      const cleanedPrompts = formData.prompts
        .filter(p => p.question && p.answer?.trim())
        .map(p => ({ question: p.question, answer: p.answer.trim() }));

      await updateProfileService({
        name: formData.name,
        course: formData.course,
        course_year: formData.course_year,
        study_time: formData.study_time,
        current_mood: formData.current_mood,
        age: parseInt(formData.age),
        pronouns: formData.pronouns,
        bio: formData.bio,
        prompts: cleanedPrompts,
        subjects: formData.subjects,
        interests: formData.interests,
        availability: formData.availability,
      });

      setEditing(false);
      showToast({ message: 'Profile updated', type: 'success' });
    } catch (error) {
      showToast({ message: getErrorMessage(error), type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    Keyboard.dismiss();
    const isDirty = JSON.stringify(formData) !== JSON.stringify(hydrateForm(profile));
    if (isDirty) {
      Alert.alert('Discard changes?', 'You have unsaved changes.', [
        { text: 'Keep editing', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => {
            if (profile) setFormData(hydrateForm(profile));
            setEditing(false);
          },
        },
      ]);
    } else {
      setEditing(false);
    }
  };

  const handlePhotoUpload = () => refetch();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setSettingsLoading(true);
            try {
              await signOut();
            } catch (error) {
              Alert.alert('Error', error.message);
            } finally {
              setSettingsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action is permanent and cannot be undone. All your data, matches, and messages will be deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Account Deletion', 'Please contact support@budie.app to complete account deletion.');
          },
        },
      ]
    );
  };

  // Prompt helpers (edit mode)
  const addPrompt = (question) => {
    if (formData.prompts.length >= MAX_PROMPTS) return;
    setFormData({
      ...formData,
      prompts: [...formData.prompts, { question, answer: '' }],
    });
  };
  const replacePromptQuestion = (idx, question) => {
    const next = [...formData.prompts];
    next[idx] = { ...next[idx], question };
    setFormData({ ...formData, prompts: next });
  };
  const updatePromptAnswer = (idx, answer) => {
    const next = [...formData.prompts];
    next[idx] = { ...next[idx], answer };
    setFormData({ ...formData, prompts: next });
  };
  const removePrompt = (idx) => {
    setFormData({ ...formData, prompts: formData.prompts.filter((_, i) => i !== idx) });
  };

  // Subject helpers (edit mode)
  const addSubject = () => {
    const trimmed = subjectInput.trim();
    if (!trimmed) return;
    if (formData.subjects.includes(trimmed)) { setSubjectInput(''); return; }
    if (formData.subjects.length >= MAX_SUBJECTS) return;
    setFormData({ ...formData, subjects: [...formData.subjects, trimmed] });
    setSubjectInput('');
  };
  const removeSubject = (s) =>
    setFormData({ ...formData, subjects: formData.subjects.filter(x => x !== s) });

  // Interest / availability toggles
  const toggleFrom = (key, value) => {
    const list = formData[key] || [];
    setFormData({
      ...formData,
      [key]: list.includes(value) ? list.filter(x => x !== value) : [...list, value],
    });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const renderEditField = (label, key, options = {}) => (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.fieldInput, options.multiline && styles.textArea]}
        value={formData[key]}
        onChangeText={(text) => setFormData({ ...formData, [key]: text })}
        placeholderTextColor={colors.textTertiary}
        placeholder={options.placeholder || label}
        keyboardType={options.keyboardType || 'default'}
        multiline={options.multiline || false}
        numberOfLines={options.numberOfLines || 1}
      />
    </View>
  );

  const SettingRow = ({ icon, iconColor, label, labelColor, value, onPress, rightElement }) => (
    <TouchableOpacity
      style={styles.settingOption}
      onPress={onPress}
      activeOpacity={onPress ? 0.6 : 1}
      disabled={!onPress}
    >
      <View style={styles.settingOptionLeft}>
        <View style={[styles.settingIconContainer, { backgroundColor: iconColor + '15' }]}>
          <Ionicons name={icon} size={18} color={iconColor} />
        </View>
        <Text style={[styles.settingOptionText, labelColor && { color: labelColor }]}>{label}</Text>
      </View>
      {rightElement || (
        <View style={styles.settingOptionRight}>
          {value && <Text style={styles.settingOptionValue}>{value}</Text>}
          {onPress && <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />}
        </View>
      )}
    </TouchableOpacity>
  );

  const metaLine = [profile?.course, profile?.course_year].filter(Boolean).join('  ·  ');
  const hasVibeChips = profile?.study_time || profile?.current_mood;
  const hasPrompts = Array.isArray(profile?.prompts) && profile.prompts.length > 0;
  const hasSubjects = Array.isArray(profile?.subjects) && profile.subjects.length > 0;
  const hasInterests = Array.isArray(profile?.interests) && profile.interests.length > 0;
  const hasAvailability = Array.isArray(profile?.availability) && profile.availability.length > 0;
  const isEmpty =
    !profile?.bio && !hasVibeChips && !metaLine && !hasPrompts && !hasSubjects && !hasInterests && !hasAvailability;

  const availableQuestionsForAdd = PROMPT_QUESTIONS.filter(
    q => !formData.prompts.some(p => p.question === q)
  );

  return (
    <View style={styles.outer}>
      <AppHeader subtitle="Your account & settings" />
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
      {/* Hero Photo */}
      <View style={styles.heroContainer}>
        <Image
          source={{ uri: profile?.photo_url || 'https://via.placeholder.com/400' }}
          style={styles.heroImage}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.15)', 'rgba(0,0,0,0.75)']}
          locations={[0, 0.55, 1]}
          style={styles.heroGradient}
          pointerEvents="none"
        />
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

      {/* Profile completeness — visible when not 100% */}
      {!editing && profile && getProfileCompleteness(profile) < 100 ? (
        <TouchableOpacity
          style={styles.completionCard}
          activeOpacity={0.9}
          onPress={() => setEditing(true)}
        >
          <View style={styles.completionTopRow}>
            <Text style={styles.completionTitle}>Complete your profile</Text>
            <Text style={styles.completionPercent}>{getProfileCompleteness(profile)}%</Text>
          </View>
          <View style={styles.completionTrack}>
            <View
              style={[
                styles.completionFill,
                { width: `${getProfileCompleteness(profile)}%` },
              ]}
            />
          </View>
          <Text style={styles.completionHint}>
            Add prompts, subjects, interests and availability so matches know what you're about.
          </Text>
        </TouchableOpacity>
      ) : null}

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
          <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(true)} activeOpacity={0.7}>
            <Ionicons name="pencil" size={15} color={colors.textPrimary} style={{ marginRight: 8 }} />
            <Text style={styles.editBtnText}>Edit profile</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Profile Content */}
      <View style={styles.body}>
        {editing ? (
          <>
            {renderEditField('Name', 'name')}
            {renderEditField('Age', 'age', { keyboardType: 'numeric' })}
            {renderEditField('Pronouns', 'pronouns', { placeholder: 'she/her, he/him, they/them' })}
            {renderEditField('Course', 'course')}
            {renderEditField('Year', 'course_year', { placeholder: '2nd Year' })}
            {renderEditField('Study time', 'study_time', { placeholder: 'Mornings, Evenings' })}
            {renderEditField('Mood', 'current_mood', { placeholder: 'Focused, Chill' })}
            {renderEditField('Bio', 'bio', { multiline: true, numberOfLines: 4, placeholder: 'A few lines about yourself...' })}

            {/* Prompts editor */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Prompts</Text>
              {formData.prompts.map((p, idx) => (
                <View key={idx} style={styles.promptEditCard}>
                  <TouchableOpacity
                    onPress={() => setPickerSlot({ mode: 'replace', idx })}
                    activeOpacity={0.6}
                    style={styles.promptQuestionRow}
                  >
                    <Text style={styles.promptQuestion}>{p.question}</Text>
                    <Ionicons name="swap-horizontal" size={16} color={colors.textTertiary} />
                  </TouchableOpacity>
                  <TextInput
                    style={styles.promptAnswer}
                    placeholder="Your answer…"
                    placeholderTextColor={colors.textTertiary}
                    value={p.answer || ''}
                    onChangeText={(t) => updatePromptAnswer(idx, t)}
                    multiline
                    maxLength={150}
                  />
                  <View style={styles.promptFooter}>
                    <Text style={styles.charCount}>{(p.answer || '').length}/150</Text>
                    <TouchableOpacity onPress={() => removePrompt(idx)}>
                      <Text style={styles.removeLink}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
              {formData.prompts.length < MAX_PROMPTS && availableQuestionsForAdd.length > 0 && (
                <TouchableOpacity
                  style={styles.addPromptButton}
                  onPress={() => setPickerSlot({ mode: 'add' })}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={18} color={colors.primary} style={{ marginRight: 6 }} />
                  <Text style={styles.addPromptText}>
                    {formData.prompts.length === 0 ? 'Pick a prompt' : 'Add another'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Subjects editor */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Subjects this term</Text>
              <View style={styles.subjectInputRow}>
                <TextInput
                  style={[styles.fieldInput, { flex: 1 }]}
                  placeholder="Microeconomics, COMP1511…"
                  placeholderTextColor={colors.textTertiary}
                  value={subjectInput}
                  onChangeText={setSubjectInput}
                  onSubmitEditing={addSubject}
                  returnKeyType="done"
                  maxLength={40}
                />
                <TouchableOpacity
                  style={[styles.addSubjectBtn, !subjectInput.trim() && { opacity: 0.4 }]}
                  onPress={addSubject}
                  disabled={!subjectInput.trim()}
                >
                  <Ionicons name="add" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
              {formData.subjects.length > 0 && (
                <View style={styles.chipContainer}>
                  {formData.subjects.map(s => (
                    <TouchableOpacity
                      key={s}
                      onPress={() => removeSubject(s)}
                      activeOpacity={0.7}
                      style={styles.removableChip}
                    >
                      <Text style={styles.removableChipText}>{s}</Text>
                      <Ionicons name="close" size={14} color={colors.primary} style={{ marginLeft: 6 }} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Interests editor */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Interests</Text>
              <View style={styles.chipContainer}>
                {INTEREST_OPTIONS.map(i => (
                  <FilterChip
                    key={i}
                    label={i}
                    selected={formData.interests.includes(i)}
                    onPress={() => toggleFrom('interests', i)}
                  />
                ))}
              </View>
            </View>

            {/* Availability editor */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>When you're free</Text>
              <View style={styles.chipContainer}>
                {DAY_OPTIONS.map(d => (
                  <FilterChip
                    key={d}
                    label={d}
                    selected={formData.availability.includes(d)}
                    onPress={() => toggleFrom('availability', d)}
                  />
                ))}
              </View>
            </View>
          </>
        ) : (
          <>
            {metaLine ? <Text style={styles.metaLine}>{metaLine}</Text> : null}

            {profile?.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}

            {hasPrompts && (
              <View style={styles.promptsStack}>
                {profile.prompts.map((p, idx) => (
                  <View key={idx} style={styles.promptCard}>
                    <Text style={styles.promptCardQuestion}>{p.question}</Text>
                    <Text style={styles.promptCardAnswer}>{p.answer}</Text>
                  </View>
                ))}
              </View>
            )}

            {hasSubjects && (
              <View style={styles.chipGroup}>
                <Text style={styles.chipGroupLabel}>studying this term</Text>
                <View style={styles.chipRow}>
                  {profile.subjects.map(s => (
                    <View key={s} style={styles.tagChip}>
                      <Text style={styles.tagChipText}>{s}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {hasAvailability && (
              <View style={styles.chipGroup}>
                <Text style={styles.chipGroupLabel}>usually free</Text>
                <View style={styles.chipRow}>
                  {profile.availability.map(d => (
                    <View key={d} style={styles.tagChip}>
                      <Text style={styles.tagChipText}>{d}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {hasVibeChips && (
              <View style={styles.chipGroup}>
                <Text style={styles.chipGroupLabel}>study vibe</Text>
                <View style={styles.chipRow}>
                  {profile?.study_time ? (
                    <View style={styles.chip}>
                      <Ionicons name="time-outline" size={14} color={colors.primary} />
                      <Text style={styles.chipText}>{profile.study_time}</Text>
                    </View>
                  ) : null}
                  {profile?.current_mood ? (
                    <View style={styles.chip}>
                      <Ionicons name="sparkles-outline" size={14} color={colors.primary} />
                      <Text style={styles.chipText}>{profile.current_mood}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            )}

            {hasInterests && (
              <View style={styles.chipGroup}>
                <Text style={styles.chipGroupLabel}>into</Text>
                <View style={styles.chipRow}>
                  {profile.interests.map(i => (
                    <View key={i} style={styles.tagChip}>
                      <Text style={styles.tagChipText}>{i}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {isEmpty && (
              <Text style={styles.emptyHint}>
                Your profile is looking a little empty — tap Edit profile to add your details.
              </Text>
            )}
          </>
        )}
      </View>

      {/* Settings Sections */}
      <View style={styles.settingsContainer}>
        <Text style={styles.settingsSectionDivider}>Settings</Text>

        {/* Appearance */}
        <View style={styles.settingsGroup}>
          <Text style={styles.settingsGroupTitle}>Appearance</Text>
          <View style={styles.settingsCard}>
            <SettingRow
              icon="moon"
              iconColor={colors.primary}
              label="Dark Mode"
              rightElement={
                <Switch
                  value={isDark}
                  onValueChange={toggleTheme}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.white}
                />
              }
            />
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.settingsGroup}>
          <Text style={styles.settingsGroupTitle}>Notifications</Text>
          <View style={styles.settingsCard}>
            <SettingRow
              icon="notifications"
              iconColor={colors.warning}
              label="Push Notifications"
              rightElement={
                <Switch
                  value={pushEnabled}
                  onValueChange={setPushEnabled}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.white}
                />
              }
            />
            <SettingRow
              icon="chatbubble"
              iconColor={colors.primary}
              label="Messages"
              rightElement={
                <Switch
                  value={messageNotifs}
                  onValueChange={setMessageNotifs}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.white}
                />
              }
            />
            <SettingRow
              icon="people"
              iconColor={colors.success}
              label="New Matches"
              rightElement={
                <Switch
                  value={matchNotifs}
                  onValueChange={setMatchNotifs}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.white}
                />
              }
            />
            <SettingRow
              icon="heart"
              iconColor={colors.error}
              label="Likes"
              rightElement={
                <Switch
                  value={likeNotifs}
                  onValueChange={setLikeNotifs}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.white}
                />
              }
            />
          </View>
        </View>

        {/* Discovery */}
        <View style={styles.settingsGroup}>
          <Text style={styles.settingsGroupTitle}>Discovery</Text>
          <View style={styles.settingsCard}>
            <SettingRow
              icon="location"
              iconColor={colors.success}
              label="Location"
              value="On Campus"
              onPress={() => { hapticLight(); showToast({ message: 'Coming soon!', type: 'info' }); }}
            />
            <SettingRow
              icon="school"
              iconColor={colors.primary}
              label="University"
              value="Set Up"
              onPress={() => { hapticLight(); showToast({ message: 'Coming soon!', type: 'info' }); }}
            />
            <SettingRow
              icon="eye"
              iconColor={colors.purple}
              label="Profile Visibility"
              value="Everyone"
              onPress={() => { hapticLight(); showToast({ message: 'Coming soon!', type: 'info' }); }}
            />
          </View>
        </View>

        {/* Privacy & Security */}
        <View style={styles.settingsGroup}>
          <Text style={styles.settingsGroupTitle}>Privacy & Security</Text>
          <View style={styles.settingsCard}>
            <SettingRow
              icon="lock-closed"
              iconColor={colors.grey}
              label="Privacy Settings"
              onPress={() => { hapticLight(); showToast({ message: 'Coming soon!', type: 'info' }); }}
            />
            <SettingRow
              icon="ban"
              iconColor={colors.error}
              label="Blocked Users"
              onPress={() => { hapticLight(); showToast({ message: 'Coming soon!', type: 'info' }); }}
            />
            <SettingRow
              icon="shield-checkmark"
              iconColor={colors.success}
              label="Two-Factor Auth"
              value="Off"
              onPress={() => { hapticLight(); showToast({ message: 'Coming soon!', type: 'info' }); }}
            />
          </View>
        </View>

        {/* Help & Support */}
        <View style={styles.settingsGroup}>
          <Text style={styles.settingsGroupTitle}>Help & Support</Text>
          <View style={styles.settingsCard}>
            <SettingRow
              icon="help-circle"
              iconColor={colors.primary}
              label="Help Center"
              onPress={() => { hapticLight(); showToast({ message: 'Coming soon!', type: 'info' }); }}
            />
            <SettingRow
              icon="chatbubble-ellipses"
              iconColor={colors.warning}
              label="Contact Support"
              onPress={() => { hapticLight(); Linking.openURL('mailto:support@budie.app'); }}
            />
            <SettingRow
              icon="flag"
              iconColor={colors.error}
              label="Report a Problem"
              onPress={() => { hapticLight(); showToast({ message: 'Coming soon!', type: 'info' }); }}
            />
            <SettingRow
              icon="star"
              iconColor={colors.warning}
              label="Rate budie"
              onPress={() => { hapticLight(); showToast({ message: 'Coming soon!', type: 'info' }); }}
            />
          </View>
        </View>

        {/* Legal */}
        <View style={styles.settingsGroup}>
          <Text style={styles.settingsGroupTitle}>Legal</Text>
          <View style={styles.settingsCard}>
            <SettingRow
              icon="document-text"
              iconColor={colors.grey}
              label="Terms of Service"
              onPress={() => { hapticLight(); Linking.openURL('https://budie.app/terms'); }}
            />
            <SettingRow
              icon="shield"
              iconColor={colors.grey}
              label="Privacy Policy"
              onPress={() => { hapticLight(); Linking.openURL('https://budie.app/privacy'); }}
            />
            <SettingRow
              icon="information-circle"
              iconColor={colors.grey}
              label="Licenses"
              onPress={() => { hapticLight(); showToast({ message: 'Coming soon!', type: 'info' }); }}
            />
          </View>
        </View>

        {/* Account */}
        <View style={styles.settingsGroup}>
          <Text style={styles.settingsGroupTitle}>Account</Text>
          <View style={styles.settingsCard}>
            <SettingRow
              icon="log-out"
              iconColor={colors.warning}
              label="Sign Out"
              labelColor={colors.warning}
              onPress={handleSignOut}
            />
            <SettingRow
              icon="trash"
              iconColor={colors.error}
              label="Delete Account"
              labelColor={colors.error}
              onPress={handleDeleteAccount}
            />
          </View>
        </View>

        <Text style={styles.version}>budie v1.0.0</Text>
      </View>

      <PickerModal
        visible={!!pickerSlot}
        onClose={() => setPickerSlot(null)}
        title="Choose a prompt"
        data={
          pickerSlot?.mode === 'replace'
            ? PROMPT_QUESTIONS.filter(
                q => !formData.prompts.some((p, i) => p.question === q && i !== pickerSlot.idx)
              )
            : availableQuestionsForAdd
        }
        onSelect={(q) => {
          if (pickerSlot?.mode === 'replace') {
            replacePromptQuestion(pickerSlot.idx, q);
          } else {
            addPrompt(q);
          }
        }}
      />
      </ScrollView>
    </View>
  );
}

const createStyles = (colors, inputStyles, insets) => StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 48,
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
    bottom: 26,
    left: 24,
    right: 24,
  },
  heroName: {
    fontSize: 30,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
    letterSpacing: -0.4,
  },
  heroPronouns: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.88)',
    fontFamily: 'Inter_500Medium',
    marginTop: 4,
  },

  // Action row
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: spacing.lg,
    gap: 10,
  },
  editBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundSecondary,
  },
  editBtnText: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: colors.textPrimary,
  },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundSecondary,
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
    paddingVertical: 13,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
  },
  saveBtnText: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: '#fff',
  },

  // Body
  body: {
    paddingHorizontal: 24,
    paddingTop: spacing.xl,
  },

  metaLine: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  bio: {
    fontSize: 17,
    lineHeight: 26,
    color: colors.textPrimary,
    fontFamily: 'Inter_400Regular',
    marginBottom: spacing.xl,
  },

  // Prompt cards (view)
  promptsStack: {
    marginBottom: spacing.xl,
  },
  promptCard: {
    backgroundColor: colors.backgroundSecondary,
    padding: 18,
    borderRadius: borderRadius.lg,
    marginBottom: 12,
  },
  promptCardQuestion: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: colors.textTertiary,
    marginBottom: 6,
  },
  promptCardAnswer: {
    fontSize: 18,
    lineHeight: 26,
    fontFamily: 'Inter_500Medium',
    color: colors.textPrimary,
  },

  // Chip groups (view)
  chipGroup: {
    marginBottom: spacing.lg,
  },
  chipGroupLabel: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: colors.textTertiary,
    marginBottom: 8,
  },
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
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
  },
  chipText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: colors.primary,
  },
  tagChip: {
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
  },
  tagChipText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: colors.textPrimary,
  },

  emptyHint: {
    fontSize: 14,
    color: colors.textTertiary,
    lineHeight: 22,
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

  // Prompt edit cards
  promptEditCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: 14,
    marginBottom: 10,
  },
  promptQuestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  promptQuestion: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: 'Inter_500Medium',
  },
  promptAnswer: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: colors.textPrimary,
    minHeight: 52,
    textAlignVertical: 'top',
    padding: 0,
  },
  promptFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  charCount: {
    fontSize: 11,
    color: colors.textTertiary,
  },
  removeLink: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'Inter_500Medium',
  },
  addPromptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  addPromptText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: colors.primary,
  },

  // Subject edit
  subjectInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  addSubjectBtn: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removableChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    marginRight: 8,
    marginBottom: 8,
  },
  removableChipText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: colors.primary,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  // Settings
  settingsContainer: {
    marginTop: spacing.xxl,
    paddingHorizontal: 24,
  },
  settingsSectionDivider: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    color: colors.textPrimary,
    marginBottom: spacing.xl,
  },
  settingsGroup: {
    marginBottom: spacing.xl,
  },
  settingsGroupTitle: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    paddingHorizontal: 4,
  },
  settingsCard: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: colors.cardBackground,
    borderColor: colors.border,
  },
  settingOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  settingIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingOptionText: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: colors.textPrimary,
  },
  settingOptionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  settingOptionValue: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: colors.textTertiary,
  },
  version: {
    textAlign: 'center',
    fontSize: 11,
    letterSpacing: 0.2,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
    color: colors.textTertiary,
  },
});
