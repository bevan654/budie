import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
  Image,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useAuth } from '../hooks/useAuth';
import { useLikes } from '../hooks/useLikes';
import { useProfile } from '../hooks/useProfile';
import { useFilters } from '../contexts/FilterContext';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import { fetchProfiles } from '../services/profileService';
import { checkIfMatched } from '../services/matchService';
import { Ionicons } from '@expo/vector-icons';
import { typography, spacing, borderRadius } from '../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import MatchModal from '../components/MatchModal';
import FilterModal from '../components/FilterModal';
import AppHeader from '../components/AppHeader';
import { hapticSuccess, hapticLight, hapticMedium } from '../utils/haptics';
import { getRankFromXp, tierProgress, formatXp } from '../constants/rankTiers';
import { fetchUserXp } from '../services/xpService';
import { fetchUserStreak } from '../services/streakService';
import { fetchUserWeeklyTotal } from '../services/studySessionService';
import { TIERS, getTier } from '../utils/streakTiers';

const { width, height } = Dimensions.get('window');
const PHOTO_HEIGHT = Math.min(520, height * 0.6);

function streakDaysFallback(profile) {
  const seedSrc = String(profile?.id ?? profile?.name ?? '');
  let seed = 0;
  for (let i = 0; i < seedSrc.length; i++) seed = (seed * 31 + seedSrc.charCodeAt(i)) >>> 0;
  return (seed % 28) + 1;
}

export default function HomeScreen({ navigation }) {
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [matchData, setMatchData] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showCompletePrompt, setShowCompletePrompt] = useState(false);

  const { userId } = useAuth();
  const { createLike } = useLikes(userId);
  const { profile: currentUserProfile } = useProfile(userId);
  const { activeFilters, setFilters, hasActiveFilters } = useFilters();
  const { colors, shadows, isDark } = useTheme();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();

  const styles = createStyles(colors, shadows, insets, isDark);

  const position = useRef(new Animated.ValueXY()).current;
  const indexRef = useRef(0);
  const swipingRef = useRef(false);
  const scrollRef = useRef(null);

  const rotate = position.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: ['-8deg', '0deg', '8deg'],
    extrapolate: 'clamp',
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [0, width / 4],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const dislikeOpacity = position.x.interpolate({
    inputRange: [-width / 4, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    if (userId) {
      loadProfiles();
    }
  }, [userId, activeFilters]);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem('@budie_show_complete_profile_prompt')
      .then((value) => {
        if (cancelled || value !== '1') return;
        setShowCompletePrompt(true);
        AsyncStorage.removeItem('@budie_show_complete_profile_prompt').catch(() => {});
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const handleCompleteNow = () => {
    setShowCompletePrompt(false);
    navigation.getParent()?.navigate('Profile');
  };

  const handleCompleteLater = () => {
    setShowCompletePrompt(false);
  };

  const loadProfiles = async () => {
    if (!userId) return;

    setLoading(true);

    try {
      const data = await fetchProfiles(userId, activeFilters);
      const seen = new Set();
      const unique = (data || []).filter(p => {
        if (seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
      });
      setProfiles(unique);
      setCurrentIndex(0);
      indexRef.current = 0;
    } catch (error) {
      showToast({ message: error.message || 'Failed to load profiles', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const advanceCard = (direction) => {
    if (swipingRef.current) return;
    swipingRef.current = true;

    const idx = indexRef.current;

    Animated.timing(position, {
      toValue: { x: direction * (width + 100), y: 0 },
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      indexRef.current = idx + 1;
      setCurrentIndex(idx + 1);
      position.setValue({ x: 0, y: 0 });
      scrollRef.current?.scrollTo({ y: 0, animated: false });
      swipingRef.current = false;
    });
  };

  const handleLike = () => {
    const idx = indexRef.current;
    if (idx >= profiles.length || swipingRef.current) return;

    hapticSuccess();
    const profile = profiles[idx];

    advanceCard(1);

    (async () => {
      try {
        await createLike(userId, profile.id);
        const isMatch = await checkIfMatched(userId, profile.id);
        if (isMatch) {
          setMatchData({
            currentUserProfile,
            matchedProfile: profile,
          });
        }
      } catch (error) {
        showToast({ message: error.message, type: 'error' });
      }
    })();
  };

  const handleDislike = () => {
    const idx = indexRef.current;
    if (idx >= profiles.length || swipingRef.current) return;

    hapticLight();
    advanceCard(-1);
  };

  const handleLikeRef = useRef(handleLike);
  const handleDislikeRef = useRef(handleDislike);
  handleLikeRef.current = handleLike;
  handleDislikeRef.current = handleDislike;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (_, gesture) => {
        return (
          Math.abs(gesture.dx) > 14 &&
          Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.6
        );
      },
      onMoveShouldSetPanResponderCapture: (_, gesture) => {
        return (
          Math.abs(gesture.dx) > 14 &&
          Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.6
        );
      },
      onPanResponderTerminationRequest: () => false,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: 0 });
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > 120) {
          hapticMedium();
          handleLikeRef.current();
        } else if (gesture.dx < -120) {
          hapticMedium();
          handleDislikeRef.current();
        } else {
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            speed: 20,
            bounciness: 8,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const currentProfile = profiles[currentIndex];

  const headerRight = (
    <TouchableOpacity
      style={styles.headerIcon}
      onPress={() => setShowFilterModal(true)}
    >
      <Ionicons name="options" size={22} color={colors.textPrimary} />
      {hasActiveFilters && <View style={styles.filterDot} />}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <AppHeader right={headerRight} subtitle="Find your study buddy" />
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <SkeletonLoader.Card />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader right={headerRight} subtitle="Find your study buddy" />

      <View style={styles.cardContainer}>
        {currentProfile ? (
          <Animated.View
            {...panResponder.panHandlers}
            style={[
              styles.card,
              {
                transform: [
                  { translateX: position.x },
                  { translateY: position.y },
                  { rotate },
                ],
              },
            ]}
          >
            <ProfileScroll
              ref={scrollRef}
              profile={currentProfile}
              colors={colors}
              isDark={isDark}
              styles={styles}
            />
            <Animated.View style={[styles.likeLabel, { opacity: likeOpacity }]}>
              <Text style={styles.likeLabelText}>LIKE</Text>
            </Animated.View>
            <Animated.View style={[styles.dislikeLabel, { opacity: dislikeOpacity }]}>
              <Text style={styles.dislikeLabelText}>NOPE</Text>
            </Animated.View>
          </Animated.View>
        ) : (
          <EmptyState
            icon="search-outline"
            title="No more profiles"
            subtitle="Check back later for new study partners"
            actionTitle="Refresh"
            onActionPress={loadProfiles}
          />
        )}

        {currentProfile ? (
          <View style={styles.floatingActions} pointerEvents="box-none">
            <TouchableOpacity
              onPress={handleDislike}
              activeOpacity={0.85}
              style={[styles.floatingActionBtn, { backgroundColor: colors.dislikeRed }]}
            >
              <Ionicons name="close" size={28} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleLike}
              activeOpacity={0.85}
              style={[styles.floatingActionBtn, { backgroundColor: colors.likeGreen }]}
            >
              <Ionicons name="checkmark" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ) : null}
      </View>

      <MatchModal
        visible={!!matchData}
        onClose={() => setMatchData(null)}
        currentUserProfile={matchData?.currentUserProfile}
        matchedProfile={matchData?.matchedProfile}
        onSendMessage={() => {
          setMatchData(null);
          navigation.navigate('Chats');
        }}
      />

      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        initialFilters={activeFilters}
        onApply={setFilters}
      />

      <Modal
        visible={showCompletePrompt}
        transparent
        animationType="fade"
        onRequestClose={handleCompleteLater}
        statusBarTranslucent
      >
        <Pressable style={styles.completeBackdrop} onPress={handleCompleteLater}>
          <Pressable style={styles.completeSheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.completeIconWrap}>
              <Ionicons name="sparkles" size={26} color={colors.primary} />
            </View>
            <Text style={styles.completeTitle}>Complete your profile</Text>
            <Text style={styles.completeBody}>
              Add prompts, subjects, interests, and your availability so the right study
              buddies can find you. You can always do this later from your profile tab.
            </Text>
            <TouchableOpacity
              style={styles.completePrimaryBtn}
              onPress={handleCompleteNow}
              activeOpacity={0.85}
            >
              <Text style={styles.completePrimaryText}>Complete now</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCompleteLater} style={styles.completeLaterBtn}>
              <Text style={styles.completeLaterText}>Maybe later</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const ProfileScroll = React.forwardRef(function ProfileScroll(
  { profile, colors, isDark, styles },
  ref
) {
  const [xp, setXp] = useState(0);
  const [streakDays, setStreakDays] = useState(streakDaysFallback(profile));
  const [avgHours, setAvgHours] = useState(0);

  useEffect(() => {
    let cancelled = false;
    if (!profile?.id) return;
    Promise.all([
      fetchUserXp(profile.id),
      fetchUserStreak(profile.id).catch(() => ({ current: streakDaysFallback(profile) })),
      fetchUserWeeklyTotal(profile.id).catch(() => 0),
    ]).then(([userXp, streak, weeklySec]) => {
      if (cancelled) return;
      setXp(userXp);
      setStreakDays(streak?.current ?? streakDaysFallback(profile));
      setAvgHours((weeklySec || 0) / 3600 / 7);
    });
    return () => {
      cancelled = true;
    };
  }, [profile?.id]);

  const rank = getRankFromXp(xp);
  const streakTier = streakDays > 0 ? (getTier(avgHours) || TIERS.COLD) : TIERS.NONE;
  const meta = { days: streakDays, rank, xp, streakTier };

  const Row = ({ icon, label, value }) => {
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
    <ScrollView
      ref={ref}
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <View style={styles.hero}>
        {profile.photo_url ? (
          <Image
            source={{ uri: profile.photo_url }}
            style={styles.heroImage}
            resizeMode="cover"
          />
        ) : null}
        {/* Soft frosted-glass dissolve at bottom of photo */}
        <View style={styles.heroFadeWrap} pointerEvents="none">
          <BlurView
            intensity={18}
            tint={isDark ? 'dark' : 'light'}
            style={[styles.heroBlurLayer, { height: 36, opacity: 0.55 }]}
          />
          <BlurView
            intensity={42}
            tint={isDark ? 'dark' : 'light'}
            style={[styles.heroBlurLayer, { height: 24, bottom: 0, opacity: 0.95 }]}
          />
          <LinearGradient
            colors={[
              colors.cardBackground + '00',
              colors.cardBackground + '40',
              colors.cardBackground + 'CC',
              colors.cardBackground,
            ]}
            locations={[0, 0.45, 0.8, 1]}
            style={StyleSheet.absoluteFillObject}
          />
        </View>
      </View>

      {/* Identity block sits under the fade */}
      <View style={styles.identityBlock}>
        <View style={styles.heroNameRow}>
          <Text style={styles.heroName} numberOfLines={1}>{profile.name}</Text>
          {profile.age ? <Text style={styles.heroAge}>{profile.age}</Text> : null}
        </View>
        {profile.pronouns ? (
          <Text style={styles.heroPronouns}>{profile.pronouns}</Text>
        ) : null}
        {(profile.course || profile.course_year) ? (
          <Text style={styles.heroSub}>
            {profile.course}
            {profile.course_year ? ` · Year ${profile.course_year}` : ''}
          </Text>
        ) : null}
      </View>

      {/* Stats strip */}
      <View style={styles.statsBetween}>
        <View style={styles.statCol}>
          <View style={styles.statTop}>
            <View style={[styles.statIconWrap, { backgroundColor: meta.streakTier.color + '22' }]}>
              <Ionicons name="flame" size={14} color={meta.streakTier.color} />
            </View>
            <Text style={[styles.statValue, { color: meta.streakTier.color }]}>{meta.days}</Text>
          </View>
          <Text style={styles.statLabel}>{meta.streakTier.name} streak</Text>
        </View>

        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />

        <View style={styles.statCol}>
          <View style={styles.rankTop}>
            <Text style={styles.rankEmoji}>{meta.rank.emoji}</Text>
            <Text style={styles.rankName}>{meta.rank.name}</Text>
          </View>
          <View style={[styles.rankBarTrack, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.rankBarFill,
                {
                  width: `${tierProgress(meta.rank, meta.xp) * 100}%`,
                  backgroundColor: colors.primary,
                },
              ]}
            />
          </View>
          <Text style={styles.rankXp}>{formatXp(meta.xp)} XP</Text>
        </View>
      </View>

      <View style={styles.body}>
        {/* Academic */}
        {(profile.course || profile.course_year) ? (
          <>
            <Text style={styles.sectionLabel}>Academic</Text>
            <Row icon="school-outline" label="Course" value={profile.course} />
            <Row icon="layers-outline" label="Year" value={profile.course_year} />
            <View style={styles.divider} />
          </>
        ) : null}

        {/* Study Preferences */}
        {(profile.study_time || profile.current_mood) ? (
          <>
            <Text style={styles.sectionLabel}>Study preferences</Text>
            <Row icon="time-outline" label="When" value={profile.study_time} />
            <Row icon="happy-outline" label="Mood" value={profile.current_mood} />
            <View style={styles.divider} />
          </>
        ) : null}

        {/* Bio */}
        {profile.bio ? (
          <>
            <Text style={styles.sectionLabel}>About</Text>
            <Text style={styles.bioText}>{profile.bio}</Text>
          </>
        ) : null}
      </View>

    </ScrollView>
  );
});

const createStyles = (colors, shadows, insets, isDark) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  cardContainer: {
    flex: 1,
    backgroundColor: colors.cardBackground,
  },
  card: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.cardBackground,
    overflow: 'hidden',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },

  // Hero
  hero: {
    width: '100%',
    height: PHOTO_HEIGHT,
    backgroundColor: colors.imagePlaceholder,
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  heroPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.imagePlaceholder,
  },
  heroFadeWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 110,
    overflow: 'hidden',
  },
  heroBlurLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 24,
  },
  identityBlock: {
    paddingHorizontal: 22,
    paddingTop: spacing.lg,
    marginTop: -28,
  },
  heroNameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  heroName: {
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  heroAge: {
    fontSize: 22,
    fontFamily: 'Inter_400Regular',
    color: colors.textSecondary,
  },
  heroPronouns: {
    fontSize: 14,
    color: colors.textTertiary,
    fontFamily: 'Inter_500Medium',
    marginTop: 3,
  },
  heroSub: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Inter_500Medium',
    marginTop: 6,
  },

  // Stats
  statsBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  statTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statIconWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    letterSpacing: -0.3,
    color: colors.textPrimary,
  },
  statLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  rankTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rankEmoji: {
    fontSize: 18,
  },
  rankName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    letterSpacing: -0.2,
    color: colors.textPrimary,
  },
  rankBarTrack: {
    width: 92,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 4,
  },
  rankBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  rankXp: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    height: 48,
    marginHorizontal: 12,
  },

  // Body
  body: {
    paddingHorizontal: 22,
    paddingTop: spacing.md,
  },
  sectionLabel: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.md,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: spacing.xxl,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
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
  bioText: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 23,
  },

  // Floating actions (always visible above tab bar)
  floatingActions: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
    zIndex: 20,
  },
  floatingActionBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 12,
  },

  // Complete profile modal
  completeBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  completeSheet: {
    backgroundColor: colors.cardBackground,
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 18,
    alignItems: 'stretch',
  },
  completeIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 14,
  },
  completeTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    color: colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.4,
    marginBottom: 8,
  },
  completeBody: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 22,
  },
  completePrimaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  completePrimaryText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: '#fff',
  },
  completeLaterBtn: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  completeLaterText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: colors.textTertiary,
  },

  // Swipe overlay labels
  likeLabel: {
    position: 'absolute',
    top: 40,
    right: 30,
    borderWidth: 2,
    borderColor: colors.success,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    transform: [{ rotate: '15deg' }],
  },
  likeLabelText: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: colors.success,
    letterSpacing: 2,
  },
  dislikeLabel: {
    position: 'absolute',
    top: 40,
    left: 30,
    borderWidth: 2,
    borderColor: colors.error,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    transform: [{ rotate: '-15deg' }],
  },
  dislikeLabelText: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: colors.error,
    letterSpacing: 2,
  },
});
