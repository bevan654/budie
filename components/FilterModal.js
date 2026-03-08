import React, { useState, useEffect, useMemo } from 'react';
import { Modal, TextInput, ScrollView } from 'react-native';
import { YStack, XStack, View, Text } from 'tamagui';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import useThemeStore from '../stores/themeStore';
import { lightColors, darkColors } from '../constants/theme';
import { spacing, borderRadius } from '../constants/theme';
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

const STUDY_METHODS = ['Solo', 'Group', 'Hybrid'];

export default function FilterModal({ visible, onClose, initialFilters, onApply }) {
  const [filters, setFilters] = useState(initialFilters);
  const [uniSearch, setUniSearch] = useState('');
  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;

  useEffect(() => {
    if (visible) {
      setFilters(initialFilters);
      setUniSearch('');
    }
  }, [visible, initialFilters]);

  const filteredUnis = useMemo(() => {
    if (!uniSearch.trim()) return [];
    return UNIVERSITIES.filter((u) =>
      u.toLowerCase().includes(uniSearch.toLowerCase())
    )
      .filter((u) => !(filters.universities || []).includes(u))
      .slice(0, 5);
  }, [uniSearch, filters.universities]);

  const toggleArrayFilter = (key, value) => {
    const current = filters[key] || [];
    const newValue = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    setFilters({ ...filters, [key]: newValue });
  };

  const activeCount = useMemo(() => {
    return (
      (filters.universities?.length || 0) +
      (filters.courses?.length || 0) +
      (filters.years?.length || 0) +
      (filters.studyTimes?.length || 0) +
      (filters.studyMethod ? 1 : 0) +
      (filters.ageRange[0] !== 18 || filters.ageRange[1] !== 25 ? 1 : 0)
    );
  }, [filters]);

  const handleClear = () => {
    hapticLight();
    setFilters({
      universities: [],
      courses: [],
      years: [],
      studyTimes: [],
      studyMethod: '',
      ageRange: [18, 25],
    });
  };

  const handleApply = () => {
    hapticMedium();
    onApply(filters);
    onClose();
  };

  const renderSectionHeader = (icon, title, count) => (
    <XStack alignItems="center" marginBottom={spacing.md}>
      <View
        width={30}
        height={30}
        borderRadius={8}
        backgroundColor={colors.primaryLight}
        justifyContent="center"
        alignItems="center"
        marginRight={10}
      >
        <Ionicons name={icon} size={16} color={colors.primary} />
      </View>
      <Text
        flex={1}
        fontSize={15}
        fontFamily="Inter_600SemiBold"
        color={colors.textPrimary}
      >
        {title}
      </Text>
      {count > 0 && (
        <View
          minWidth={22}
          height={22}
          borderRadius={11}
          backgroundColor={colors.primary}
          justifyContent="center"
          alignItems="center"
          paddingHorizontal={6}
        >
          <Text fontSize={11} fontFamily="Inter_700Bold" color="#fff">
            {count}
          </Text>
        </View>
      )}
    </XStack>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <YStack flex={1} backgroundColor={colors.background}>
        {/* Handle */}
        <YStack alignItems="center" paddingTop={12} paddingBottom={4}>
          <View
            width={36}
            height={4}
            borderRadius={2}
            backgroundColor={colors.border}
          />
        </YStack>

        {/* Header */}
        <XStack
          justifyContent="space-between"
          alignItems="center"
          paddingHorizontal={spacing.xxl}
          paddingTop={spacing.lg}
          paddingBottom={spacing.xl}
        >
          <XStack alignItems="center" gap={10}>
            <Text
              fontSize={24}
              fontFamily="Inter_700Bold"
              letterSpacing={-0.2}
              color={colors.textPrimary}
            >
              Filters
            </Text>
            {activeCount > 0 && (
              <View
                backgroundColor={colors.primaryLight}
                paddingHorizontal={10}
                paddingVertical={4}
                borderRadius={borderRadius.full}
              >
                <Text
                  fontSize={12}
                  fontFamily="Inter_600SemiBold"
                  color={colors.primary}
                >
                  {activeCount} active
                </Text>
              </View>
            )}
          </XStack>
          <View
            width={36}
            height={36}
            borderRadius={18}
            backgroundColor={colors.backgroundSecondary}
            justifyContent="center"
            alignItems="center"
            onPress={onClose}
            cursor="pointer"
          >
            <Ionicons name="close" size={22} color={colors.textSecondary} />
          </View>
        </XStack>

        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: spacing.xxl,
            paddingBottom: spacing.xl,
          }}
        >
          {/* University */}
          <YStack marginBottom={spacing.xxl}>
            {renderSectionHeader(
              'business-outline',
              'University',
              filters.universities?.length || 0
            )}
            {(filters.universities || []).length > 0 && (
              <XStack flexWrap="wrap" marginBottom={spacing.xs}>
                {(filters.universities || []).map((uni) => (
                  <FilterChip
                    key={uni}
                    label={uni}
                    selected
                    onPress={() => toggleArrayFilter('universities', uni)}
                  />
                ))}
              </XStack>
            )}
            <XStack
              alignItems="center"
              backgroundColor={colors.backgroundSecondary}
              borderRadius={borderRadius.md}
              paddingHorizontal={12}
              paddingVertical={10}
              marginBottom={spacing.sm}
              borderWidth={1}
              borderColor={colors.border}
            >
              <Ionicons
                name="search-outline"
                size={16}
                color={colors.textTertiary}
                style={{ marginRight: 8 }}
              />
              <TextInput
                style={{
                  flex: 1,
                  fontSize: 14,
                  color: colors.textPrimary,
                  padding: 0,
                  fontFamily: 'Inter_400Regular',
                }}
                placeholder="Search universities..."
                placeholderTextColor={colors.textTertiary}
                value={uniSearch}
                onChangeText={setUniSearch}
                autoCorrect={false}
              />
              {uniSearch.length > 0 && (
                <View onPress={() => setUniSearch('')} cursor="pointer">
                  <Ionicons
                    name="close-circle"
                    size={18}
                    color={colors.textTertiary}
                  />
                </View>
              )}
            </XStack>
            {filteredUnis.length > 0 && (
              <XStack flexWrap="wrap" marginBottom={spacing.xs}>
                {filteredUnis.map((uni) => (
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
              </XStack>
            )}
            {uniSearch.trim().length > 0 && filteredUnis.length === 0 && (
              <Text
                fontSize={13}
                color={colors.textTertiary}
                textAlign="center"
                paddingVertical={spacing.sm}
              >
                No universities found
              </Text>
            )}
          </YStack>

          {/* Course */}
          <YStack marginBottom={spacing.xxl}>
            {renderSectionHeader(
              'school-outline',
              'Course',
              filters.courses.length
            )}
            <XStack flexWrap="wrap" marginBottom={spacing.xs}>
              {COURSES.map((course) => (
                <FilterChip
                  key={course}
                  label={course}
                  selected={filters.courses.includes(course)}
                  onPress={() => toggleArrayFilter('courses', course)}
                />
              ))}
            </XStack>
          </YStack>

          {/* Year */}
          <YStack marginBottom={spacing.xxl}>
            {renderSectionHeader(
              'calendar-outline',
              'Year',
              filters.years.length
            )}
            <XStack flexWrap="wrap" marginBottom={spacing.xs}>
              {YEARS.map((year) => (
                <FilterChip
                  key={year}
                  label={year === 'Postgrad' ? year : `Year ${year}`}
                  selected={filters.years.includes(year)}
                  onPress={() => toggleArrayFilter('years', year)}
                />
              ))}
            </XStack>
          </YStack>

          {/* Study Time */}
          <YStack marginBottom={spacing.xxl}>
            {renderSectionHeader(
              'time-outline',
              'Study Time',
              filters.studyTimes.length
            )}
            <XStack flexWrap="wrap" marginBottom={spacing.xs}>
              {STUDY_TIMES.map((time) => (
                <FilterChip
                  key={time}
                  label={time}
                  selected={filters.studyTimes.includes(time)}
                  onPress={() => toggleArrayFilter('studyTimes', time)}
                />
              ))}
            </XStack>
          </YStack>

          {/* Study Method */}
          <YStack marginBottom={spacing.xxl}>
            {renderSectionHeader(
              'people-outline',
              'Study Method',
              filters.studyMethod ? 1 : 0
            )}
            <XStack flexWrap="wrap" marginBottom={spacing.xs}>
              {STUDY_METHODS.map((method) => (
                <FilterChip
                  key={method}
                  label={method}
                  selected={filters.studyMethod === method}
                  onPress={() =>
                    setFilters({
                      ...filters,
                      studyMethod:
                        filters.studyMethod === method ? '' : method,
                    })
                  }
                />
              ))}
            </XStack>
          </YStack>

          {/* Age Range */}
          <YStack marginBottom={spacing.xxl}>
            {renderSectionHeader(
              'person-outline',
              'Age Range',
              filters.ageRange[0] !== 18 || filters.ageRange[1] !== 25 ? 1 : 0
            )}
            <YStack
              backgroundColor={colors.cardBackground}
              borderRadius={borderRadius.lg}
              padding={spacing.xl}
              borderWidth={1}
              borderColor={colors.border}
            >
              <XStack
                alignItems="center"
                justifyContent="center"
                marginBottom={spacing.xl}
                gap={12}
              >
                <View
                  width={56}
                  height={56}
                  borderRadius={28}
                  backgroundColor={colors.primaryLight}
                  justifyContent="center"
                  alignItems="center"
                >
                  <Text
                    fontSize={20}
                    fontFamily="Inter_700Bold"
                    color={colors.primary}
                  >
                    {filters.ageRange[0]}
                  </Text>
                </View>
                <View
                  width={20}
                  height={2}
                  borderRadius={1}
                  backgroundColor={colors.border}
                />
                <View
                  width={56}
                  height={56}
                  borderRadius={28}
                  backgroundColor={colors.primaryLight}
                  justifyContent="center"
                  alignItems="center"
                >
                  <Text
                    fontSize={20}
                    fontFamily="Inter_700Bold"
                    color={colors.primary}
                  >
                    {filters.ageRange[1]}
                  </Text>
                </View>
              </XStack>

              <YStack marginBottom={spacing.md}>
                <Text
                  fontSize={12}
                  fontFamily="Inter_600SemiBold"
                  color={colors.textTertiary}
                  textTransform="uppercase"
                  letterSpacing={0.3}
                  marginBottom={4}
                >
                  Min Age
                </Text>
                <XStack alignItems="center">
                  <Text
                    fontSize={13}
                    color={colors.textTertiary}
                    fontFamily="Inter_500Medium"
                    width={24}
                    textAlign="center"
                  >
                    18
                  </Text>
                  <Slider
                    style={{ flex: 1, marginHorizontal: spacing.sm }}
                    minimumValue={18}
                    maximumValue={25}
                    step={1}
                    value={filters.ageRange[0]}
                    onValueChange={(value) =>
                      setFilters({
                        ...filters,
                        ageRange: [
                          value,
                          Math.max(value, filters.ageRange[1]),
                        ],
                      })
                    }
                    minimumTrackTintColor={colors.primary}
                    maximumTrackTintColor={colors.border}
                    thumbTintColor={colors.primary}
                  />
                  <Text
                    fontSize={13}
                    color={colors.textTertiary}
                    fontFamily="Inter_500Medium"
                    width={24}
                    textAlign="center"
                  >
                    25
                  </Text>
                </XStack>
              </YStack>

              <YStack marginBottom={spacing.md}>
                <Text
                  fontSize={12}
                  fontFamily="Inter_600SemiBold"
                  color={colors.textTertiary}
                  textTransform="uppercase"
                  letterSpacing={0.3}
                  marginBottom={4}
                >
                  Max Age
                </Text>
                <XStack alignItems="center">
                  <Text
                    fontSize={13}
                    color={colors.textTertiary}
                    fontFamily="Inter_500Medium"
                    width={24}
                    textAlign="center"
                  >
                    18
                  </Text>
                  <Slider
                    style={{ flex: 1, marginHorizontal: spacing.sm }}
                    minimumValue={18}
                    maximumValue={25}
                    step={1}
                    value={filters.ageRange[1]}
                    onValueChange={(value) =>
                      setFilters({
                        ...filters,
                        ageRange: [
                          Math.min(value, filters.ageRange[0]),
                          value,
                        ],
                      })
                    }
                    minimumTrackTintColor={colors.primary}
                    maximumTrackTintColor={colors.border}
                    thumbTintColor={colors.primary}
                  />
                  <Text
                    fontSize={13}
                    color={colors.textTertiary}
                    fontFamily="Inter_500Medium"
                    width={24}
                    textAlign="center"
                  >
                    25
                  </Text>
                </XStack>
              </YStack>
            </YStack>
          </YStack>
        </ScrollView>

        {/* Footer */}
        <XStack
          paddingHorizontal={spacing.xxl}
          paddingTop={spacing.lg}
          paddingBottom={spacing.xxxl + 4}
          backgroundColor={colors.cardBackground}
          borderTopWidth={1}
          borderTopColor={colors.border}
          gap={10}
        >
          <XStack
            flex={1}
            alignItems="center"
            justifyContent="center"
            paddingVertical={14}
            borderRadius={borderRadius.md}
            borderWidth={1.5}
            borderColor={colors.border}
            backgroundColor={colors.cardBackground}
            onPress={handleClear}
            pressStyle={{ opacity: 0.7 }}
            cursor="pointer"
          >
            <Ionicons
              name="refresh-outline"
              size={18}
              color={colors.textSecondary}
              style={{ marginRight: 6 }}
            />
            <Text
              fontSize={15}
              fontFamily="Inter_600SemiBold"
              color={colors.textSecondary}
            >
              Clear All
            </Text>
          </XStack>
          <XStack
            flex={1.5}
            alignItems="center"
            justifyContent="center"
            paddingVertical={14}
            borderRadius={borderRadius.md}
            backgroundColor={colors.primary}
            onPress={handleApply}
            pressStyle={{ opacity: 0.8 }}
            cursor="pointer"
          >
            <Ionicons
              name="checkmark"
              size={18}
              color="#fff"
              style={{ marginRight: 6 }}
            />
            <Text
              fontSize={15}
              fontFamily="Inter_600SemiBold"
              color="#fff"
            >
              Apply{activeCount > 0 ? ` (${activeCount})` : ''}
            </Text>
          </XStack>
        </XStack>
      </YStack>
    </Modal>
  );
}
