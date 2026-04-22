import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing, borderRadius } from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PHOTO_HEIGHT = 420;

export default function ProfileDetailScreen({ route, navigation }) {
  const { profile } = route.params;
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors, insets), [colors, insets]);

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

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: profile.photo_url || 'https://via.placeholder.com/400' }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.25)', 'transparent', 'transparent', 'rgba(0,0,0,0.6)']}
            locations={[0, 0.2, 0.5, 1]}
            style={StyleSheet.absoluteFillObject}
          />

          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.heroInfo}>
            <View style={styles.heroNameRow}>
              <Text style={styles.heroName}>{profile.name}</Text>
              {profile.age ? <Text style={styles.heroAge}>{profile.age}</Text> : null}
            </View>
            {profile.pronouns ? (
              <Text style={styles.heroPronouns}>{profile.pronouns}</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.body}>
          {/* Quick chips under photo */}
          {(profile.course || profile.course_year) && (
            <View style={styles.chipRow}>
              {profile.course ? (
                <View style={styles.chip}>
                  <Ionicons name="school-outline" size={14} color={colors.primary} />
                  <Text style={styles.chipText}>{profile.course}</Text>
                </View>
              ) : null}
              {profile.course_year ? (
                <View style={styles.chip}>
                  <Ionicons name="calendar-outline" size={14} color={colors.primary} />
                  <Text style={styles.chipText}>Year {profile.course_year}</Text>
                </View>
              ) : null}
            </View>
          )}

          {/* Academic */}
          <Text style={styles.sectionLabel}>Academic</Text>
          {renderInfoRow('school-outline', 'Course', profile.course)}
          {renderInfoRow('layers-outline', 'Year', profile.course_year)}

          <View style={styles.divider} />

          {/* Study Preferences */}
          <Text style={styles.sectionLabel}>Study Preferences</Text>
          <View style={styles.chipRow}>
            {profile.study_time ? (
              <View style={styles.chip}>
                <Ionicons name="time-outline" size={14} color={colors.primary} />
                <Text style={styles.chipText}>{profile.study_time}</Text>
              </View>
            ) : null}
            {profile.current_mood ? (
              <View style={styles.chip}>
                <Ionicons name="happy-outline" size={14} color={colors.primary} />
                <Text style={styles.chipText}>{profile.current_mood}</Text>
              </View>
            ) : null}
          </View>

          {/* Bio */}
          {profile.bio ? (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionLabel}>About</Text>
              <Text style={styles.bioText}>{profile.bio}</Text>
            </>
          ) : null}
        </View>
      </ScrollView>

    </View>
  );
}

const createStyles = (colors, insets) => StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
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
  backBtn: {
    position: 'absolute',
    top: insets.top + 6,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  heroInfo: {
    position: 'absolute',
    bottom: 24,
    left: 22,
    right: 22,
  },
  heroNameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  heroName: {
    fontSize: 30,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
    letterSpacing: -0.3,
  },
  heroAge: {
    fontSize: 22,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.85)',
  },
  heroPronouns: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.75)',
    fontFamily: 'Inter_500Medium',
    marginTop: 3,
  },

  // Body
  body: {
    paddingHorizontal: 22,
    paddingTop: spacing.xl,
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
    marginBottom: spacing.md,
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

});
