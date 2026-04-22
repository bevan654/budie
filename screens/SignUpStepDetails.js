import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useSignUp } from '../contexts/SignUpContext';
import { typography, spacing, borderRadius } from '../constants/theme';
import {
  PROMPT_QUESTIONS,
  INTEREST_OPTIONS,
  DAY_OPTIONS,
  MAX_PROMPTS,
  MAX_SUBJECTS,
} from '../constants/profileOptions';
import SignUpProgressBar from '../components/SignUpProgressBar';
import FilterChip from '../components/FilterChip';
import PickerModal from '../components/PickerModal';

export default function SignUpStepDetails({ navigation }) {
  const { formData, updateFields } = useSignUp();
  const [prompts, setPrompts] = useState(formData.prompts?.length ? formData.prompts : []);
  const [subjects, setSubjects] = useState(formData.subjects || []);
  const [subjectInput, setSubjectInput] = useState('');
  const [interests, setInterests] = useState(formData.interests || []);
  const [availability, setAvailability] = useState(formData.availability || []);
  const [pickerSlot, setPickerSlot] = useState(null);
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const availableQuestions = useMemo(
    () => PROMPT_QUESTIONS.filter(q => !prompts.some(p => p.question === q)),
    [prompts]
  );

  const addPrompt = (question) => {
    if (prompts.length >= MAX_PROMPTS) return;
    setPrompts([...prompts, { question, answer: '' }]);
  };

  const replacePromptQuestion = (idx, question) => {
    const next = [...prompts];
    next[idx] = { ...next[idx], question };
    setPrompts(next);
  };

  const updatePromptAnswer = (idx, answer) => {
    const next = [...prompts];
    next[idx] = { ...next[idx], answer };
    setPrompts(next);
  };

  const removePrompt = (idx) => {
    setPrompts(prompts.filter((_, i) => i !== idx));
  };

  const addSubject = () => {
    const trimmed = subjectInput.trim();
    if (!trimmed) return;
    if (subjects.includes(trimmed)) {
      setSubjectInput('');
      return;
    }
    if (subjects.length >= MAX_SUBJECTS) return;
    setSubjects([...subjects, trimmed]);
    setSubjectInput('');
  };

  const removeSubject = (s) => setSubjects(subjects.filter(x => x !== s));

  const toggleInterest = (i) => {
    setInterests(interests.includes(i) ? interests.filter(x => x !== i) : [...interests, i]);
  };

  const toggleDay = (d) => {
    setAvailability(availability.includes(d) ? availability.filter(x => x !== d) : [...availability, d]);
  };

  const commitAndNext = () => {
    const cleanedPrompts = prompts
      .filter(p => p.question && p.answer.trim())
      .map(p => ({ question: p.question, answer: p.answer.trim() }));
    updateFields({
      prompts: cleanedPrompts,
      subjects,
      interests,
      availability,
    });
    navigation.navigate('SignUpStepPhotoBio');
  };

  const handleSkip = () => {
    updateFields({ prompts: [], subjects: [], interests: [], availability: [] });
    navigation.navigate('SignUpStepPhotoBio');
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

        <SignUpProgressBar currentStep={5} />

        <View style={styles.header}>
          <View style={styles.iconWrap}>
            <Ionicons name="sparkles-outline" size={24} color={colors.primary} />
          </View>
          <Text style={styles.heading}>Tell us more</Text>
          <Text style={styles.subheading}>
            All optional — skip any section you're not feeling.
          </Text>
        </View>

        {/* Prompts */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Prompts</Text>
          <Text style={styles.sectionHelper}>
            Answer up to {MAX_PROMPTS} to add some personality.
          </Text>

          {prompts.map((p, idx) => (
            <View key={idx} style={styles.promptCard}>
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
                value={p.answer}
                onChangeText={text => updatePromptAnswer(idx, text)}
                multiline
                maxLength={150}
              />
              <View style={styles.promptFooter}>
                <Text style={styles.charCount}>{p.answer.length}/150</Text>
                <TouchableOpacity onPress={() => removePrompt(idx)}>
                  <Text style={styles.removeLink}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {prompts.length < MAX_PROMPTS && availableQuestions.length > 0 && (
            <TouchableOpacity
              style={styles.addPromptButton}
              onPress={() => setPickerSlot({ mode: 'add' })}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={18} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.addPromptText}>
                {prompts.length === 0 ? 'Pick a prompt' : 'Add another'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Subjects */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Subjects this term</Text>
          <Text style={styles.sectionHelper}>
            Courses or topics you're currently studying.
          </Text>

          <View style={styles.subjectInputRow}>
            <TextInput
              style={styles.subjectInput}
              placeholder="e.g. Microeconomics, COMP1511…"
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

          {subjects.length > 0 && (
            <View style={styles.chipContainer}>
              {subjects.map(s => (
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

        {/* Interests */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Interests</Text>
          <Text style={styles.sectionHelper}>
            Stuff you're into outside of study.
          </Text>
          <View style={styles.chipContainer}>
            {INTEREST_OPTIONS.map(i => (
              <FilterChip
                key={i}
                label={i}
                selected={interests.includes(i)}
                onPress={() => toggleInterest(i)}
              />
            ))}
          </View>
        </View>

        {/* Availability */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>When you're usually free</Text>
          <Text style={styles.sectionHelper}>
            Pick the days that usually work for you.
          </Text>
          <View style={styles.chipContainer}>
            {DAY_OPTIONS.map(d => (
              <FilterChip
                key={d}
                label={d}
                selected={availability.includes(d)}
                onPress={() => toggleDay(d)}
              />
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.continueButton} onPress={commitAndNext} activeOpacity={0.7}>
          <Text style={styles.continueText}>Continue</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 8 }} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipButton} onPress={handleSkip} activeOpacity={0.7}>
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </ScrollView>

      <PickerModal
        visible={!!pickerSlot}
        onClose={() => setPickerSlot(null)}
        title="Choose a prompt"
        data={
          pickerSlot?.mode === 'replace'
            ? PROMPT_QUESTIONS.filter(
                q => !prompts.some((p, i) => p.question === q && i !== pickerSlot.idx)
              )
            : availableQuestions
        }
        onSelect={(q) => {
          if (pickerSlot?.mode === 'replace') {
            replacePromptQuestion(pickerSlot.idx, q);
          } else {
            addPrompt(q);
          }
        }}
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

  section: {
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  sectionHelper: {
    fontSize: 13,
    color: colors.textTertiary,
    marginBottom: spacing.md,
    lineHeight: 18,
  },

  // Prompts
  promptCard: {
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

  // Subjects
  subjectInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  subjectInput: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.textPrimary,
    fontFamily: 'Inter_400Regular',
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
