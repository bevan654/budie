import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import { useSignUp } from '../contexts/SignUpContext';
import { typography, spacing, borderRadius } from '../constants/theme';
import SignUpProgressBar from '../components/SignUpProgressBar';
import FilterChip from '../components/FilterChip';

const STUDY_TIMES = ['Morning', 'Afternoon', 'Evening', 'Night', 'Flexible'];
const STUDY_METHODS = ['Solo', 'Group', 'Hybrid', 'Library', 'Online'];
const MOODS = ['Focused', 'Chill', 'Motivated', 'Stressed', 'Social', 'Quiet'];

export default function SignUpStepPreferences({ navigation }) {
  const { formData, updateFields } = useSignUp();
  const [studyTime, setStudyTime] = useState(formData.studyTime || []);
  const [studyMethod, setStudyMethod] = useState(formData.studyMethod || []);
  const [currentMood, setCurrentMood] = useState(formData.currentMood || []);
  const { colors } = useTheme();
  const { showToast } = useToast();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const toggleSelection = (list, setList, value) => {
    if (list.includes(value)) {
      setList(list.filter(item => item !== value));
    } else {
      setList([...list, value]);
    }
  };

  const handleContinue = () => {
    if (studyTime.length === 0) {
      showToast({ message: 'Please select at least one study time', type: 'error' });
      return;
    }
    if (studyMethod.length === 0) {
      showToast({ message: 'Please select at least one study method', type: 'error' });
      return;
    }
    if (currentMood.length === 0) {
      showToast({ message: 'Please select at least one mood', type: 'error' });
      return;
    }

    updateFields({ studyTime, studyMethod, currentMood });
    navigation.navigate('SignUpStepDetails');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
      </TouchableOpacity>

      <SignUpProgressBar currentStep={4} />

      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Ionicons name="bulb-outline" size={24} color={colors.primary} />
        </View>
        <Text style={styles.heading}>Study preferences</Text>
        <Text style={styles.subheading}>Help us find your ideal study partners.</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>When do you study?</Text>
          <View style={styles.chipContainer}>
            {STUDY_TIMES.map(time => (
              <FilterChip
                key={time}
                label={time}
                selected={studyTime.includes(time)}
                onPress={() => toggleSelection(studyTime, setStudyTime, time)}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>How do you study?</Text>
          <View style={styles.chipContainer}>
            {STUDY_METHODS.map(method => (
              <FilterChip
                key={method}
                label={method}
                selected={studyMethod.includes(method)}
                onPress={() => toggleSelection(studyMethod, setStudyMethod, method)}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>What's your vibe?</Text>
          <View style={styles.chipContainer}>
            {MOODS.map(mood => (
              <FilterChip
                key={mood}
                label={mood}
                selected={currentMood.includes(mood)}
                onPress={() => toggleSelection(currentMood, setCurrentMood, mood)}
              />
            ))}
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.continueButton} onPress={handleContinue} activeOpacity={0.7}>
        <Text style={styles.continueText}>Continue</Text>
        <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 8 }} />
      </TouchableOpacity>
    </ScrollView>
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
  form: {
    flex: 1,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
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
});
