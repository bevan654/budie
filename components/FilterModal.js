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
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { typography, spacing, borderRadius } from '../constants/theme';
import Button from './Button';
import FilterChip from './FilterChip';
import RangeSlider from './RangeSlider';
import { hapticMedium, hapticLight } from '../utils/haptics';
import { UNIVERSITIES } from '../constants/universities';
import { BROAD_DISCIPLINES } from '../constants/disciplines';

const YEARS = ['1', '2', '3', '4', 'Postgrad'];

const STUDY_STYLE_OPTIONS = [
  {
    key: 'silent',
    label: 'Silent',
    description: 'Quiet, head-down focus. No talking — just shared productivity.',
  },
  {
    key: 'non_silent',
    label: 'Non-silent',
    description: 'Light chat is welcome — share progress, vent, ask quick questions.',
  },
  {
    key: 'teaching',
    label: 'Teaching',
    description: 'Trade explanations. Teach a concept to lock it in (Feynman style).',
  },
];

function CollapsibleSection({ icon, title, summary, count, open, onToggle, colors, styles, children }) {
  return (
    <View style={styles.collapseWrap}>
      <TouchableOpacity
        style={styles.collapseHeader}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={styles.sectionIconWrap}>
          <Ionicons name={icon} size={16} color={colors.primary} />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
        {summary ? (
          <Text style={styles.collapseSummary} numberOfLines={1}>
            {summary}
          </Text>
        ) : null}
        {count > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{count}</Text>
          </View>
        )}
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={colors.textTertiary}
          style={{ marginLeft: 8 }}
        />
      </TouchableOpacity>
      {open ? <View style={styles.collapseBody}>{children}</View> : null}
    </View>
  );
}

export default function FilterModal({ visible, onClose, initialFilters, onApply }) {
  const [filters, setFilters] = useState(initialFilters);
  const [uniSearch, setUniSearch] = useState('');
  const [specificInput, setSpecificInput] = useState('');
  const [openSection, setOpenSection] = useState(null);
  const { colors, shadows } = useTheme();
  const styles = useMemo(() => createStyles(colors, shadows), [colors, shadows]);

  useEffect(() => {
    if (visible) {
      setFilters({ courseMode: 'broad', ...initialFilters });
      setUniSearch('');
      setSpecificInput('');
      setOpenSection(null);
    }
  }, [visible, initialFilters]);

  const toggleSection = (key) => {
    hapticLight();
    setOpenSection((prev) => (prev === key ? null : key));
  };

  const selectStudyStyle = (key) => {
    hapticLight();
    const current = (filters.studyStyles || [])[0];
    setFilters({ ...filters, studyStyles: current === key ? [] : [key] });
  };

  const switchCourseMode = (mode) => {
    if (filters.courseMode === mode) return;
    hapticLight();
    setFilters({ ...filters, courseMode: mode, courses: [] });
  };

  const addSpecificCourse = () => {
    const value = specificInput.trim();
    if (!value) return;
    if ((filters.courses || []).some((c) => c.toLowerCase() === value.toLowerCase())) {
      setSpecificInput('');
      return;
    }
    setFilters({ ...filters, courses: [...(filters.courses || []), value] });
    setSpecificInput('');
  };

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
      (filters.studyStyles?.length || 0) +
      (filters.ageRange[0] !== 18 || filters.ageRange[1] !== 99 ? 1 : 0)
    );
  }, [filters]);

  const handleClear = () => {
    hapticLight();
    setFilters({
      universities: [],
      courses: [],
      courseMode: 'broad',
      years: [],
      studyStyles: [],
      ageRange: [18, 99],
    });
    setSpecificInput('');
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
          {/* University — collapsible */}
          <CollapsibleSection
            icon="business-outline"
            title="University"
            count={filters.universities?.length || 0}
            summary={(filters.universities || []).slice(0, 2).join(', ')}
            open={openSection === 'university'}
            onToggle={() => toggleSection('university')}
            colors={colors}
            styles={styles}
          >
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
          </CollapsibleSection>

          {/* Course — collapsible */}
          <CollapsibleSection
            icon="school-outline"
            title="Course"
            count={filters.courses.length}
            summary={
              filters.courseMode === 'specific'
                ? (filters.courses[0] || '')
                : filters.courses.slice(0, 2).join(', ')
            }
            open={openSection === 'course'}
            onToggle={() => toggleSection('course')}
            colors={colors}
            styles={styles}
          >
            <View style={styles.segmented}>
              <TouchableOpacity
                style={[
                  styles.segmentBtn,
                  filters.courseMode !== 'specific' && styles.segmentBtnActive,
                ]}
                onPress={() => switchCourseMode('broad')}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.segmentText,
                    filters.courseMode !== 'specific' && styles.segmentTextActive,
                  ]}
                >
                  Broad discipline
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.segmentBtn,
                  filters.courseMode === 'specific' && styles.segmentBtnActive,
                ]}
                onPress={() => switchCourseMode('specific')}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.segmentText,
                    filters.courseMode === 'specific' && styles.segmentTextActive,
                  ]}
                >
                  Specific course
                </Text>
              </TouchableOpacity>
            </View>

            {filters.courseMode === 'specific' ? (
              <>
                <View style={styles.searchInputWrap}>
                  <Ionicons name="school-outline" size={16} color={colors.textTertiary} style={{ marginRight: 8 }} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="e.g. Computer Science with AI"
                    placeholderTextColor={colors.textTertiary}
                    value={specificInput}
                    onChangeText={setSpecificInput}
                    onSubmitEditing={addSpecificCourse}
                    returnKeyType="done"
                    autoCorrect={false}
                  />
                  {specificInput.length > 0 && (
                    <TouchableOpacity onPress={addSpecificCourse} style={styles.addBtn}>
                      <Ionicons name="add" size={18} color={colors.primary} />
                    </TouchableOpacity>
                  )}
                </View>
                {(filters.courses || []).length > 0 && (
                  <View style={styles.dropdownList}>
                    {filters.courses.map((c, i) => (
                      <TouchableOpacity
                        key={c}
                        onPress={() => toggleArrayFilter('courses', c)}
                        activeOpacity={0.7}
                        style={[
                          styles.dropdownRow,
                          i === filters.courses.length - 1 && styles.dropdownRowLast,
                        ]}
                      >
                        <Text style={styles.dropdownRowText}>{c}</Text>
                        <Ionicons name="close" size={18} color={colors.textTertiary} />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            ) : (
              <View style={styles.dropdownList}>
                {BROAD_DISCIPLINES.map((d, i) => {
                  const selected = filters.courses.includes(d);
                  return (
                    <TouchableOpacity
                      key={d}
                      onPress={() => toggleArrayFilter('courses', d)}
                      activeOpacity={0.7}
                      style={[
                        styles.dropdownRow,
                        i === BROAD_DISCIPLINES.length - 1 && styles.dropdownRowLast,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dropdownRowText,
                          selected && { color: colors.primary, fontFamily: 'Inter_600SemiBold' },
                        ]}
                      >
                        {d}
                      </Text>
                      {selected ? (
                        <Ionicons name="checkmark" size={20} color={colors.primary} />
                      ) : null}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </CollapsibleSection>

          {/* Year — collapsible, single row */}
          <CollapsibleSection
            icon="calendar-outline"
            title="Year"
            count={filters.years.length}
            summary={filters.years.join(', ')}
            open={openSection === 'year'}
            onToggle={() => toggleSection('year')}
            colors={colors}
            styles={styles}
          >
            <View style={styles.yearRow}>
              {YEARS.map((year) => {
                const selected = filters.years.includes(year);
                return (
                  <TouchableOpacity
                    key={year}
                    style={[
                      styles.yearBtn,
                      selected && { backgroundColor: colors.primary, borderColor: colors.primary },
                    ]}
                    onPress={() => toggleArrayFilter('years', year)}
                    activeOpacity={0.85}
                  >
                    <Text
                      style={[
                        styles.yearBtnText,
                        selected && { color: '#fff' },
                      ]}
                    >
                      {year}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </CollapsibleSection>

          {/* Study Style — segmented bar with description */}
          <View style={styles.section}>
            {renderSectionHeader('book-outline', 'Study Style', filters.studyStyles?.length || 0)}
            <View style={styles.studyBar}>
              {STUDY_STYLE_OPTIONS.map((opt) => {
                const selected = (filters.studyStyles || [])[0] === opt.key;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    style={[
                      styles.studyBarBtn,
                      selected && styles.studyBarBtnActive,
                    ]}
                    onPress={() => selectStudyStyle(opt.key)}
                    activeOpacity={0.85}
                  >
                    <Text
                      style={[
                        styles.studyBarText,
                        selected && styles.studyBarTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {(() => {
              const selectedKey = (filters.studyStyles || [])[0];
              const opt = STUDY_STYLE_OPTIONS.find((o) => o.key === selectedKey);
              return opt ? (
                <Text style={styles.studyDescription}>{opt.description}</Text>
              ) : (
                <Text style={styles.studyHint}>
                  Pick one to filter by how matches like to study.
                </Text>
              );
            })()}
          </View>

          {/* Age Range — single range slider with both thumbs */}
          <View style={styles.section}>
            {renderSectionHeader(
              'person-outline',
              'Age',
              filters.ageRange[0] !== 18 || filters.ageRange[1] !== 99 ? 1 : 0,
            )}
            <RangeSlider
              min={18}
              max={99}
              step={1}
              value={filters.ageRange}
              onChange={(next) => setFilters({ ...filters, ageRange: next })}
              colors={colors}
            />
            <View style={styles.ageBoundsRow}>
              <Text style={styles.sliderBound}>18</Text>
              <Text style={styles.sliderBound}>99</Text>
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

  // Collapsible sections
  collapseWrap: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.cardBackground,
    overflow: 'hidden',
  },
  collapseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  collapseSummary: {
    flex: 1,
    textAlign: 'right',
    fontSize: 13,
    color: colors.textTertiary,
    fontFamily: 'Inter_500Medium',
    marginLeft: 8,
  },
  collapseBody: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },

  // Dropdown-style list (proper menu)
  dropdownList: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: 'hidden',
    marginTop: spacing.sm,
  },
  dropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  dropdownRowLast: {
    borderBottomWidth: 0,
  },
  dropdownRowText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: colors.textPrimary,
    flex: 1,
    marginRight: 12,
  },

  // Year row (single line)
  yearRow: {
    flexDirection: 'row',
    gap: 6,
  },
  yearBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearBtnText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: colors.textPrimary,
  },

  // Study style bar
  studyBar: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  studyBarBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  studyBarBtnActive: {
    backgroundColor: colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  studyBarText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: colors.textSecondary,
  },
  studyBarTextActive: {
    color: '#fff',
  },
  studyDescription: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: colors.textSecondary,
    lineHeight: 19,
    paddingHorizontal: 4,
  },
  studyHint: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: colors.textTertiary,
    paddingHorizontal: 4,
  },

  // Age
  ageBubbleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: spacing.md,
  },
  ageBoundsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginTop: -4,
  },

  // Chips
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.xs,
  },

  // Segmented control (course mode)
  segmented: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    padding: 4,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentBtnActive: {
    backgroundColor: colors.cardBackground,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  segmentText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: colors.textTertiary,
  },
  segmentTextActive: {
    color: colors.textPrimary,
    fontFamily: 'Inter_600SemiBold',
  },
  addBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Age bubbles
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
  sliderBound: {
    fontSize: 12,
    color: colors.textTertiary,
    fontFamily: 'Inter_500Medium',
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
