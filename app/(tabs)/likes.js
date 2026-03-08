import React, { useState, useEffect, useCallback } from 'react';
import { TouchableOpacity, RefreshControl, TextInput } from 'react-native';
import { YStack, XStack, Text, View } from 'tamagui';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { FlashList } from '@shopify/flash-list';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import useAuthStore from '../../stores/authStore';
import useThemeStore from '../../stores/themeStore';
import useToastStore from '../../stores/toastStore';
import { lightColors, darkColors } from '../../constants/theme';
import { spacing, borderRadius, fonts } from '../../constants/theme';

import { useLikes } from '../../hooks/useLikes';
import { useProfile } from '../../hooks/useProfile';
import { createLike, checkIfMatched } from '../../services/matchService';
import { supabase } from '../../lib/supabase';
import { hapticSuccess } from '../../utils/haptics';

import SkeletonLoader from '../../components/SkeletonLoader';
import MatchModal from '../../components/MatchModal';


export default function LikesScreen() {
  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [matchData, setMatchData] = useState(null);

  const router = useRouter();
  const insets = useSafeAreaInsets();

  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;
  const userId = useAuthStore((s) => s.userId);
  const showToast = useToastStore((s) => s.showToast);

  const { profile: currentUserProfile } = useProfile(userId);

  useEffect(() => {
    if (userId) {
      fetchLikesData();
    }
  }, [userId]);

  const fetchLikesData = async () => {
    try {
      const [likesRes, matchesRes] = await Promise.all([
        supabase
          .from('likes')
          .select(`
            *,
            profiles:liker_id (*)
          `)
          .eq('liked_id', userId)
          .order('created_at', { ascending: false }),
        supabase
          .from('matches')
          .select('user1_id, user2_id')
          .or(`user1_id.eq.${userId},user2_id.eq.${userId}`),
      ]);

      if (likesRes.error) throw likesRes.error;

      const matchedIds = new Set();
      (matchesRes.data || []).forEach((m) => {
        matchedIds.add(m.user1_id === userId ? m.user2_id : m.user1_id);
      });

      const unmatched = (likesRes.data || []).filter(
        (like) => !matchedIds.has(like.liker_id)
      );

      setLikes(unmatched);
    } catch (error) {
      showToast({ message: error.message, type: 'error' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLikesData();
  }, [userId]);

  const handleLikeBack = async (profile) => {
    hapticSuccess();
    try {
      await createLike(userId, profile.id);
      const isMatch = await checkIfMatched(userId, profile.id);
      if (isMatch) {
        setMatchData({ currentUserProfile, matchedProfile: profile });
      }
      setLikes((prev) => prev.filter((l) => l.profiles.id !== profile.id));
    } catch (error) {
      showToast({ message: error.message, type: 'error' });
    }
  };

  const filteredLikes = likes.filter((item) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      item.profiles.name?.toLowerCase().includes(q) ||
      item.profiles.course?.toLowerCase().includes(q)
    );
  });

  const renderItem = useCallback(
    ({ item }) => (
      <TouchableOpacity
        onPress={() => router.push(`/profile/${item.profiles.id}`)}
        activeOpacity={0.7}
        style={{ flex: 1, marginHorizontal: spacing.sm / 2 }}
      >
        <View
          flex={1}
          aspectRatio={0.75}
          borderRadius={borderRadius.md}
          overflow="hidden"
          backgroundColor={colors.backgroundSecondary}
        >
          <Image
            source={{ uri: item.profiles.photo_url || 'https://via.placeholder.com/400' }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
          />
          <YStack
            position="absolute"
            bottom={0}
            left={0}
            right={0}
            padding={spacing.md}
            paddingTop={spacing.xxl}
            paddingRight={48}
            backgroundColor="rgba(0,0,0,0.35)"
          >
            <Text
              fontSize={15}
              fontFamily={fonts.semiBold}
              color={colors.white}
            >
              {item.profiles.name}, {item.profiles.age}
            </Text>
            <Text
              fontSize={11}
              color="rgba(255,255,255,0.75)"
              marginTop={2}
            >
              {item.profiles.course} {'\u00B7'} Year {item.profiles.course_year}
            </Text>
          </YStack>
          <TouchableOpacity
            onPress={() => handleLikeBack(item.profiles)}
            activeOpacity={0.8}
            style={{
              position: 'absolute',
              bottom: spacing.md,
              right: spacing.md,
            }}
          >
            <View
              width={36}
              height={36}
              borderRadius={18}
              backgroundColor={colors.primary}
              justifyContent="center"
              alignItems="center"
            >
              <Ionicons name="heart" size={18} color={colors.white} />
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    ),
    [colors, router, userId, currentUserProfile]
  );

  if (loading) {
    return (
      <YStack flex={1} backgroundColor={colors.background}>
        <YStack
          paddingTop={insets.top + 12}
          paddingHorizontal={spacing.xxl}
          paddingBottom={spacing.sm}
          backgroundColor={colors.background}
        >
          <Text
            fontSize={28}
            fontFamily={fonts.bold}
            color={colors.textPrimary}
            letterSpacing={-0.3}
          >
            budie?
          </Text>
          <Text
            fontSize={13}
            fontFamily={fonts.regular}
            color={colors.textSecondary}
            marginTop={spacing.xs}
          >
            People who want to study with you
          </Text>
        </YStack>
        <SkeletonLoader.ProfileGrid />
      </YStack>
    );
  }

  return (
    <YStack flex={1} backgroundColor={colors.background}>
      {/* Header */}
      <YStack
        paddingTop={insets.top + 12}
        paddingHorizontal={spacing.xxl}
        paddingBottom={spacing.sm}
        backgroundColor={colors.background}
      >
        <XStack alignItems="center" gap={spacing.md}>
          <Text
            fontSize={28}
            fontFamily={fonts.bold}
            color={colors.textPrimary}
            letterSpacing={-0.3}
          >
            budie?
          </Text>
          <View
            backgroundColor={colors.primary}
            borderRadius={9999}
            paddingHorizontal={spacing.sm + 2}
            paddingVertical={2}
            minWidth={24}
            alignItems="center"
          >
            <Text fontSize={12} fontFamily={fonts.semiBold} color={colors.white}>
              {likes.length}
            </Text>
          </View>
        </XStack>
        <Text
          fontSize={13}
          fontFamily={fonts.regular}
          color={colors.textSecondary}
          marginTop={spacing.xs}
        >
          People who want to study with you
        </Text>
      </YStack>

      {/* Search Bar */}
      <XStack
        alignItems="center"
        marginHorizontal={spacing.xxl}
        marginTop={spacing.lg}
        marginBottom={spacing.md}
        backgroundColor={colors.backgroundSecondary}
        borderRadius={borderRadius.md}
        paddingHorizontal={spacing.md}
        borderWidth={1}
        borderColor={colors.border}
      >
        <Ionicons
          name="search"
          size={18}
          color={colors.textTertiary}
          style={{ marginRight: spacing.sm }}
        />
        <TextInput
          style={{
            flex: 1,
            paddingVertical: spacing.md,
            fontSize: 15,
            color: colors.textPrimary,
            fontFamily: fonts.regular,
          }}
          placeholder="Search by name or course..."
          placeholderTextColor={colors.textTertiary}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} style={{ padding: spacing.xs }}>
            <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
          </TouchableOpacity>
        )}
      </XStack>

      {/* Grid List */}
      <FlashList
        data={filteredLikes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        estimatedItemSize={200}
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.sm,
          paddingBottom: spacing.xxl,
        }}
        keyboardDismissMode="on-drag"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <YStack alignItems="center" paddingTop={80} gap={spacing.sm}>
            <Ionicons name="heart" size={48} color={colors.textTertiary} />
            <Text
              fontSize={17}
              fontFamily={fonts.semiBold}
              color={colors.textSecondary}
            >
              {search ? 'No results found' : 'No likes yet'}
            </Text>
            <Text
              fontSize={13}
              fontFamily={fonts.regular}
              color={colors.textTertiary}
            >
              {search ? 'Try a different search' : 'People who like you will appear here'}
            </Text>
          </YStack>
        }
      />

      {/* Match Modal */}
      <MatchModal
        visible={!!matchData}
        onClose={() => setMatchData(null)}
        currentUserProfile={matchData?.currentUserProfile}
        matchedProfile={matchData?.matchedProfile}
        onSendMessage={() => {
          setMatchData(null);
          router.push('/(tabs)/chats');
        }}
      />
    </YStack>
  );
}
