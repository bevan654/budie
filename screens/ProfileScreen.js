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
import FilterChip from '../components/FilterChip';
import PickerModal from '../components/PickerModal';
import {
  PROMPT_QUESTIONS,
  INTEREST_OPTIONS,
  DAY_OPTIONS,
  MAX_PROMPTS,
  MAX_SUBJECTS,
} from '../constants/profileOptions';

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
    study_method: '',
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

  const { userId } = useAuth();
  const { profile, loading, updateProfile: updateProfileService, refetch } = useProfile(userId);
  const { colors, inputStyles } = useTheme();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors, inputStyles, insets), [colors, inputStyles, insets]);

  const hydrateForm = (p) => ({
    name: p?.name || '',
    course: p?.course || '',
    course_year: p?.course_year || '',
    study_time: p?.study_time || '',
    study_method: p?.study_method || '',
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
        study_method: formData.study_method,
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

  const metaLine = [profile?.course, profile?.course_year].filter(Boolean).join('  ·  ');
  const hasVibeChips = profile?.study_time || profile?.study_method || profile?.current_mood;
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
          <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(true)} activeOpacity={0.7}>
            <Ionicons name="pencil" size={15} color={colors.textPrimary} style={{ marginRight: 8 }} />
            <Text style={styles.editBtnText}>Edit profile</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.body}>
        {editing ? (
          <>
            {renderEditField('Name', 'name')}
            {renderEditField('Age', 'age', { keyboardType: 'numeric' })}
            {renderEditField('Pronouns', 'pronouns', { placeholder: 'she/her, he/him, they/them' })}
            {renderEditField('Course', 'course')}
            {renderEditField('Year', 'course_year', { placeholder: '2nd Year' })}
            {renderEditField('Study time', 'study_time', { placeholder: 'Mornings, Evenings' })}
            {renderEditField('Study method', 'study_method', { placeholder: 'Group, Solo, Library' })}
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
                  {profile?.study_method ? (
                    <View style={styles.chip}>
                      <Ionicons name="people-outline" size={14} color={colors.primary} />
                      <Text style={styles.chipText}>{profile.study_method}</Text>
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
  );
}

const createStyles = (colors, inputStyles, insets) => StyleSheet.create({
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
    right: 80,
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
  settingsButton: {
    position: 'absolute',
    top: insets.top + 6,
    right: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.28)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
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
});
