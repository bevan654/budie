import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
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
import SwipeCard from '../components/SwipeCard';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import MatchModal from '../components/MatchModal';
import FilterModal from '../components/FilterModal';
import { hapticSuccess, hapticLight, hapticMedium } from '../utils/haptics';

const { width, height } = Dimensions.get('window');

const createStyles = (colors, shadows, insets) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: insets.top + 8,
    paddingBottom: spacing.sm,
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
  headerTitle: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    color: colors.primary,
    letterSpacing: -0.3,
  },
  cardContainer: {
    flex: 1,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  card: {
    width: width - (spacing.sm * 2),
    height: '100%',
  },
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
  actions: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
    zIndex: 10,
  },
  dislikeButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.dislikeRed,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.dislikeRed,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 10,
  },
  dislikeInner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  likeButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.likeGreen,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.likeGreen,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 10,
  },
  likeInner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default function HomeScreen({ navigation }) {
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [matchData, setMatchData] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const { userId } = useAuth();
  const { createLike } = useLikes(userId);
  const { profile: currentUserProfile } = useProfile(userId);
  const { activeFilters, setFilters, hasActiveFilters } = useFilters();
  const { colors, shadows } = useTheme();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();

  const styles = createStyles(colors, shadows, insets);

  const position = useRef(new Animated.ValueXY()).current;
  const indexRef = useRef(0);
  const swipingRef = useRef(false);

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

  const loadProfiles = async () => {
    if (!userId) return;

    setLoading(true);

    try {
      const data = await fetchProfiles(userId, activeFilters);
      // Deduplicate by id
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
      swipingRef.current = false;
    });
  };

  const handleLike = () => {
    const idx = indexRef.current;
    if (idx >= profiles.length || swipingRef.current) return;

    hapticSuccess();
    const profile = profiles[idx];

    advanceCard(1);

    // API calls in background
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

  // Use refs so PanResponder always calls latest handlers
  const handleLikeRef = useRef(handleLike);
  const handleDislikeRef = useRef(handleDislike);
  handleLikeRef.current = handleLike;
  handleDislikeRef.current = handleDislike;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
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

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerIcon} />
          <Text style={styles.title}>budie</Text>
          <View style={styles.headerIcon} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <SkeletonLoader.Card />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerIcon}
          onPress={() => setShowFilterModal(true)}
        >
          <Ionicons name="options" size={24} color={colors.textPrimary} />
          {hasActiveFilters && <View style={styles.filterDot} />}
        </TouchableOpacity>

        <Text style={styles.headerTitle}>budie</Text>

        <TouchableOpacity
          style={styles.headerIcon}
          onPress={() => navigation.getParent()?.navigate('Profile')}
        >
          <Ionicons name="settings" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

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
              <SwipeCard
                profile={currentProfile}
                onPress={() => navigation.navigate('ProfileDetail', { profile: currentProfile })}
              />
              <Animated.View style={[styles.likeLabel, { opacity: likeOpacity }]}>
                <Text style={styles.likeLabelText}>LIKE</Text>
              </Animated.View>
              <Animated.View style={[styles.dislikeLabel, { opacity: dislikeOpacity }]}>
                <Text style={styles.dislikeLabelText}>NOPE</Text>
              </Animated.View>
              <View style={styles.actions}>
                <TouchableOpacity style={styles.dislikeButton} onPress={handleDislike} activeOpacity={0.8}>
                  <View style={styles.dislikeInner}>
                    <Ionicons name="close" size={34} color="#fff" />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.likeButton} onPress={handleLike} activeOpacity={0.8}>
                  <View style={styles.likeInner}>
                    <Ionicons name="checkmark" size={34} color="#fff" />
                  </View>
                </TouchableOpacity>
              </View>
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
    </View>
  );
}
