import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { typography, spacing, borderRadius } from '../constants/theme';
import Button from './Button';
import FilterChip from './FilterChip';
import { hapticMedium, hapticLight } from '../utils/haptics';
import { UNIVERSITIES } from '../constants/universities';

const COURSES = [
  'Computer Science',
  'Engineering',
  'Mathematics',
  'Physics',
  'Biology',
  'Chemistry',
  'Business',
  'Economics',
  'Psychology',
  'Medicine',
  'Law',
  'Arts',
];

const YEARS = ['1', '2', '3', '4', 'Postgrad'];

const STUDY_TIMES = ['Morning', 'Afternoon', 'Evening', 'Night', 'Flexible'];

export default function FilterModal({ visible, onClose, initialFilters, onApply }) {
  const [filters, setFilters] = useState(initialFilters);
  const [uniSearch, setUniSearch] = useState('');
  const { colors, shadows } = useTheme();
  const styles = useMemo(() => createStyles(colors, shadows), [colors, shadows]);

  useEffect(() => {
    if (visible) {
      setFilters(initialFilters);
      setUniSearch('');
    }
  }, [visible, initialFilters]);

  const filteredUnis = useMemo(() => {
    if (!uniSearch.trim()) return [];
    return UNIVERSITIES
      .filter(u => u.toLowerCase().includes(uniSearch.toLowerCase()))
      .filter(u => !(filters.universities || []).includes(u))
      .slice(0, 5);
  }, [uniSearch, filters.universities]);

  const toggleArrayFilter = (key, value) => {
    const current = filters[key] || [];
    const newValue = current.includes(value)
      ? current.filter(item => item !== value)
      : [...current, value];
    setFilters({ ...filters, [key]: newValue });
  };

  const activeCount = useMemo(() => {
    return (
      (filters.universities?.length || 0) +
      (filters.courses?.length || 0) +
      (filters.years?.length || 0) +
      (filters.studyTimes?.length || 0) +
      (filters.ageRange[0] !== 18 || filters.ageRange[1] !== 99 ? 1 : 0)
    );
  }, [filters]);

  const handleClear = () => {
    hapticLight();
    setFilters({
      universities: [],
      courses: [],
      years: [],
      studyTimes: [],
      ageRange: [18, 99],
    });
  };

  const handleApply = () => {
    hapticMedium();
    onApply(filters);
    onClose();
  };

  const renderSectionHeader = (icon, title, count) => (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionIconWrap}>
        <Ionicons name={icon} size={16} color={colors.primary} />
      </View>
      <Text style={styles.sectionTitle}>{title}</Text>
      {count > 0 && (
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>{count}</Text>
        </View>
      )}
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Handle */}
        <View style={styles.handleRow}>
          <View style={styles.handle} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Filters</Text>
            {activeCount > 0 && (
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>{activeCount} active</Text>
              </View>
            )}
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentInner}
        >
          {/* University */}
          <View style={styles.section}>
            {renderSectionHeader('business-outline', 'University', filters.universities?.length || 0)}
            {(filters.universities || []).length > 0 && (
              <View style={styles.chipContainer}>
                {(filters.universities || []).map(uni => (
                  <FilterChip
                    key={uni}
                    label={uni}
                    selected
                    onPress={() => toggleArrayFilter('universities', uni)}
                  />
                ))}
              </View>
            )}
            <View style={styles.searchInputWrap}>
              <Ionicons name="search-outline" size={16} color={colors.textTertiary} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search universities..."
                placeholderTextColor={colors.textTertiary}
                value={uniSearch}
                onChangeText={setUniSearch}
                autoCorrect={false}
              />
              {uniSearch.length > 0 && (
                <TouchableOpacity onPress={() => setUniSearch('')}>
                  <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
                </TouchableOpacity>
              )}
            </View>
            {filteredUnis.length > 0 && (
              <View style={styles.chipContainer}>
                {filteredUnis.map(uni => (
                  <FilterChip
                    key={uni}
                    label={uni}
                    selected={false}
                    onPress={() => {
                      toggleArrayFilter('universities', uni);
                      setUniSearch('');
                    }}
                  />
                ))}
              </View>
            )}
            {uniSearch.trim().length > 0 && filteredUnis.length === 0 && (
              <Text style={styles.noResults}>No universities found</Text>
            )}
          </View>

          {/* Course */}
          <View style={styles.section}>
            {renderSectionHeader('school-outline', 'Course', filters.courses.length)}
            <View style={styles.chipContainer}>
              {COURSES.map(course => (
                <FilterChip
                  key={course}
                  label={course}
                  selected={filters.courses.includes(course)}
                  onPress={() => toggleArrayFilter('courses', course)}
                />
              ))}
            </View>
          </View>

          {/* Year */}
          <View style={styles.section}>
            {renderSectionHeader('calendar-outline', 'Year', filters.years.length)}
            <View style={styles.chipContainer}>
              {YEARS.map(year => (
                <FilterChip
                  key={year}
                  label={year === 'Postgrad' ? year : `Year ${year}`}
                  selected={filters.years.includes(year)}
                  onPress={() => toggleArrayFilter('years', year)}
                />
              ))}
            </View>
          </View>

          {/* Study Time */}
          <View style={styles.section}>
            {renderSectionHeader('time-outline', 'Study Time', filters.studyTimes.length)}
            <View style={styles.chipContainer}>
              {STUDY_TIMES.map(time => (
                <FilterChip
                  key={time}
                  label={time}
                  selected={filters.studyTimes.includes(time)}
                  onPress={() => toggleArrayFilter('studyTimes', time)}
                />
              ))}
            </View>
          </View>

          {/* Age Range */}
          <View style={styles.section}>
            {renderSectionHeader(
              'person-outline',
              'Age Range',
              filters.ageRange[0] !== 18 || filters.ageRange[1] !== 99 ? 1 : 0,
            )}
            <View style={styles.ageCard}>
              <View style={styles.ageValueRow}>
                <View style={styles.ageValueBubble}>
                  <Text style={styles.ageValueText}>{filters.ageRange[0]}</Text>
                </View>
                <View style={styles.ageDash} />
                <View style={styles.ageValueBubble}>
                  <Text style={styles.ageValueText}>{filters.ageRange[1]}</Text>
                </View>
              </View>

              <View style={styles.sliderGroup}>
                <Text style={styles.sliderLabel}>Min Age</Text>
                <View style={styles.sliderRow}>
                  <Text style={styles.sliderBound}>18</Text>
                  <Slider
                    style={styles.slider}
                    minimumValue={18}
                    maximumValue={99}
                    step={1}
                    value={filters.ageRange[0]}
                    onValueChange={value =>
                      setFilters({
                        ...filters,
                        ageRange: [value, Math.max(value, filters.ageRange[1])],
                      })
                    }
                    minimumTrackTintColor={colors.primary}
                    maximumTrackTintColor={colors.border}
                    thumbTintColor={colors.primary}
                  />
                  <Text style={styles.sliderBound}>99</Text>
                </View>
              </View>

              <View style={styles.sliderGroup}>
                <Text style={styles.sliderLabel}>Max Age</Text>
                <View style={styles.sliderRow}>
                  <Text style={styles.sliderBound}>18</Text>
                  <Slider
                    style={styles.slider}
                    minimumValue={18}
                    maximumValue={99}
                    step={1}
                    value={filters.ageRange[1]}
                    onValueChange={value =>
                      setFilters({
                        ...filters,
                        ageRange: [Math.min(value, filters.ageRange[0]), value],
                      })
                    }
                    minimumTrackTintColor={colors.primary}
                    maximumTrackTintColor={colors.border}
                    thumbTintColor={colors.primary}
                  />
                  <Text style={styles.sliderBound}>99</Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
            <Ionicons name="refresh-outline" size={18} color={colors.textSecondary} style={{ marginRight: 6 }} />
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Ionicons name="checkmark" size={18} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.applyButtonText}>
              Apply{activeCount > 0 ? ` (${activeCount})` : ''}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (colors, shadows) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Handle
  handleRow: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  activeBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  activeBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: colors.primary,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Content
  content: {
    flex: 1,
  },
  contentInner: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xl,
  },

  // Sections
  section: {
    marginBottom: spacing.xxl,
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
  },
  countBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  countBadgeText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
  },

  // Search
  searchInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    padding: 0,
  },
  noResults: {
    fontSize: 13,
    color: colors.textTertiary,
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },

  // Chips
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.xs,
  },

  // Age Range
  ageCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ageValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    gap: 12,
  },
  ageValueBubble: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ageValueText: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: colors.primary,
  },
  ageDash: {
    width: 20,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.border,
  },
  sliderGroup: {
    marginBottom: spacing.md,
  },
  sliderLabel: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slider: {
    flex: 1,
    marginHorizontal: spacing.sm,
  },
  sliderBound: {
    fontSize: 13,
    color: colors.textTertiary,
    fontFamily: 'Inter_500Medium',
    width: 24,
    textAlign: 'center',
  },

  // Footer
  footer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl + 4,
    backgroundColor: colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 10,
  },
  clearButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.cardBackground,
  },
  clearButtonText: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: colors.textSecondary,
  },
  applyButton: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
  },
  applyButtonText: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: '#fff',
  },
});
