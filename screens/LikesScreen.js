import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { resolveProfilePhoto } from '../services/photoService';
import { createLike, checkIfMatched } from '../services/matchService';
import MatchModal from '../components/MatchModal';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import { typography, spacing, borderRadius } from '../constants/theme';
import { hapticSuccess } from '../utils/haptics';
import SkeletonLoader from '../components/SkeletonLoader';
import AppHeader from '../components/AppHeader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LikesScreen({ navigation }) {
  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [matchData, setMatchData] = useState(null);

  const { colors, shadows } = useTheme();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colors, shadows, insets);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUserId) {
      fetchLikes();
    }
  }, [currentUserId]);

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setCurrentUserProfile(await resolveProfilePhoto(profile));
    }
  };

  const fetchLikes = async () => {
    try {
      // Fetch likes and matches in parallel
      const [likesRes, matchesRes] = await Promise.all([
        supabase
          .from('likes')
          .select(`
            *,
            profiles:liker_id (*)
          `)
          .eq('liked_id', currentUserId)
          .order('created_at', { ascending: false }),
        supabase
          .from('matches')
          .select('user1_id, user2_id')
          .or(`user1_id.eq.${currentUserId},user2_id.eq.${currentUserId}`),
      ]);

      if (likesRes.error) throw likesRes.error;

      // Build a set of matched user IDs
      const matchedIds = new Set();
      (matchesRes.data || []).forEach(m => {
        matchedIds.add(m.user1_id === currentUserId ? m.user2_id : m.user1_id);
      });

      // Filter out users you're already matched with
      const unmatched = (likesRes.data || []).filter(
        like => !matchedIds.has(like.liker_id)
      );

      const resolved = await Promise.all(
        unmatched.map(async like => ({
          ...like,
          profiles: await resolveProfilePhoto(like.profiles),
        }))
      );

      setLikes(resolved);
    } catch (error) {
      showToast({ message: error.message, type: 'error' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLikes();
  }, [currentUserId]);

  const handleLikeBack = async (profile) => {
    hapticSuccess();
    try {
      await createLike(currentUserId, profile.id);
      const isMatch = await checkIfMatched(currentUserId, profile.id);
      if (isMatch) {
        setMatchData({ currentUserProfile, matchedProfile: profile });
      }
      setLikes(prev => prev.filter(l => l.profiles.id !== profile.id));
    } catch (error) {
      showToast({ message: error.message, type: 'error' });
    }
  };

  const filteredLikes = likes.filter(item => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      item.profiles.name?.toLowerCase().includes(q) ||
      item.profiles.course?.toLowerCase().includes(q)
    );
  });

  const renderLike = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ProfileDetail', { profile: item.profiles })}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: item.profiles.photo_url || 'https://via.placeholder.com/400' }}
        style={styles.photo}
      />
      <View style={styles.cardOverlay}>
        <Text style={styles.cardName}>{item.profiles.name}, {item.profiles.age}</Text>
        <Text style={styles.cardDetail}>
          {item.profiles.course} {'\u00B7'} Year {item.profiles.course_year}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.likeBackButton}
        onPress={() => handleLikeBack(item.profiles)}
        activeOpacity={0.8}
      >
        <Ionicons name="heart" size={18} color={colors.white} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <AppHeader />
        <SkeletonLoader.ProfileGrid />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader />

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={colors.textTertiary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or course..."
          placeholderTextColor={colors.textTertiary}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} style={styles.clearButton}>
            <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredLikes}
        renderItem={renderLike}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        keyboardDismissMode="on-drag"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="heart" size={48} color={colors.textTertiary} />
            <Text style={styles.emptyText}>
              {search ? 'No results found' : 'No likes yet'}
            </Text>
            <Text style={styles.emptySubtext}>
              {search ? 'Try a different search' : 'People who like you will appear here'}
            </Text>
          </View>
        }
      />

      <MatchModal
        visible={!!matchData}
        onClose={() => setMatchData(null)}
        currentUserProfile={matchData?.currentUserProfile}
        matchedProfile={matchData?.matchedProfile}
        onSendMessage={() => {
          setMatchData(null);
          navigation.getParent()?.navigate('Chats');
        }}
      />
    </View>
  );
}

const createStyles = (colors, shadows, insets) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: insets.top + 12,
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  countBadge: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  countText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: colors.white,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.xxl,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: 15,
    color: colors.textPrimary,
  },
  clearButton: {
    padding: spacing.xs,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  row: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  card: {
    flex: 1,
    aspectRatio: 0.75,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    backgroundColor: colors.backgroundSecondary,
  },
  photo: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.backgroundSecondary,
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    paddingTop: spacing.xxl,
    paddingRight: 48,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  likeBackButton: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardName: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: colors.white,
  },
  cardDetail: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
    gap: spacing.sm,
  },
  emptyText: {
    ...typography.h4,
    color: colors.textSecondary,
  },
  emptySubtext: {
    ...typography.bodySmall,
    color: colors.textTertiary,
  },
});
