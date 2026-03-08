import React, { useState, useEffect, useCallback } from 'react';
import { Dimensions, TouchableOpacity, RefreshControl } from 'react-native';
import { YStack, XStack, Text, View } from 'tamagui';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';

import useAuthStore from '../../stores/authStore';
import useThemeStore from '../../stores/themeStore';
import useFilterStore from '../../stores/filterStore';
import useToastStore from '../../stores/toastStore';
import { lightColors, darkColors } from '../../constants/theme';
import { spacing, borderRadius, fonts } from '../../constants/theme';

import { useLikes } from '../../hooks/useLikes';
import { useProfile } from '../../hooks/useProfile';
import { fetchProfiles } from '../../services/profileService';
import { checkIfMatched } from '../../services/matchService';
import { hapticSuccess, hapticLight } from '../../utils/haptics';

import SwipeCard from '../../components/SwipeCard';
import SkeletonLoader from '../../components/SkeletonLoader';
import EmptyState from '../../components/EmptyState';
import MatchModal from '../../components/MatchModal';
import FilterModal from '../../components/FilterModal';

const { width, height } = Dimensions.get('window');
const CARD_HEIGHT = height * 0.62;

export default function HomeScreen() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [matchData, setMatchData] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const router = useRouter();
  const insets = useSafeAreaInsets();

  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;
  const userId = useAuthStore((s) => s.userId);
  const activeFilters = useFilterStore((s) => s.activeFilters);
  const setFilters = useFilterStore((s) => s.setFilters);
  const hasActiveFilters = useFilterStore((s) => s.hasActiveFilters);
  const showToast = useToastStore((s) => s.showToast);

  const { likedIds, createLike } = useLikes(userId);
  const { profile: currentUserProfile } = useProfile(userId);

  const loadProfiles = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await fetchProfiles(userId, likedIds, activeFilters);
      const seen = new Set();
      const unique = (data || []).filter((p) => {
        if (seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
      });
      setProfiles(unique);
    } catch (error) {
      showToast({ message: error.message || 'Failed to load profiles', type: 'error' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId, likedIds, activeFilters]);

  useEffect(() => {
    if (userId) {
      loadProfiles();
    }
  }, [userId, activeFilters]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadProfiles();
  }, [loadProfiles]);

  const handleLike = useCallback(
    async (profile) => {
      hapticSuccess();
      setProfiles((prev) => prev.filter((p) => p.id !== profile.id));
      try {
        await createLike(userId, profile.id);
        const isMatch = await checkIfMatched(userId, profile.id);
        if (isMatch) {
          setMatchData({ currentUserProfile, matchedProfile: profile });
        }
      } catch (error) {
        showToast({ message: error.message, type: 'error' });
      }
    },
    [userId, currentUserProfile, createLike]
  );

  const handleSkip = useCallback((profileId) => {
    hapticLight();
    setProfiles((prev) => prev.filter((p) => p.id !== profileId));
  }, []);

  const renderItem = useCallback(
    ({ item }) => (
      <View
        marginBottom={spacing.md}
        height={CARD_HEIGHT}
        borderRadius={borderRadius.lg}
        overflow="hidden"
      >
        <SwipeCard
          profile={item}
          onPress={() => router.push(`/profile/${item.id}`)}
        />
        <XStack
          position="absolute"
          bottom={24}
          left={0}
          right={0}
          justifyContent="center"
          alignItems="center"
          gap={32}
        >
          <TouchableOpacity onPress={() => handleSkip(item.id)} activeOpacity={0.8}>
            <View
              width={56}
              height={56}
              borderRadius={28}
              backgroundColor={colors.dislikeRed}
              justifyContent="center"
              alignItems="center"
              shadowColor={colors.dislikeRed}
              shadowOffset={{ width: 0, height: 4 }}
              shadowOpacity={0.4}
              shadowRadius={10}
              elevation={8}
            >
              <Ionicons name="close" size={28} color="#fff" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleLike(item)} activeOpacity={0.8}>
            <View
              width={56}
              height={56}
              borderRadius={28}
              backgroundColor={colors.likeGreen}
              justifyContent="center"
              alignItems="center"
              shadowColor={colors.likeGreen}
              shadowOffset={{ width: 0, height: 4 }}
              shadowOpacity={0.4}
              shadowRadius={10}
              elevation={8}
            >
              <Ionicons name="checkmark" size={28} color="#fff" />
            </View>
          </TouchableOpacity>
        </XStack>
      </View>
    ),
    [colors, router, handleLike, handleSkip]
  );

  if (loading) {
    return (
      <YStack flex={1} backgroundColor={colors.background}>
        <XStack
          justifyContent="space-between"
          alignItems="center"
          paddingHorizontal={spacing.xl}
          paddingTop={insets.top + 8}
          paddingBottom={spacing.sm}
          backgroundColor={colors.background}
        >
          <View width={40} height={40} />
          <Text
            fontSize={22}
            fontFamily={fonts.bold}
            color={colors.primary}
            letterSpacing={-0.3}
          >
            budie
          </Text>
          <View width={40} height={40} />
        </XStack>
        <YStack flex={1} justifyContent="center">
          <SkeletonLoader.Card />
        </YStack>
      </YStack>
    );
  }

  return (
    <YStack flex={1} backgroundColor={colors.background}>
      {/* Header */}
      <XStack
        justifyContent="space-between"
        alignItems="center"
        paddingHorizontal={spacing.xl}
        paddingTop={insets.top + 8}
        paddingBottom={spacing.sm}
        backgroundColor={colors.background}
      >
        <TouchableOpacity
          onPress={() => setShowFilterModal(true)}
          style={{ width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }}
        >
          <Ionicons name="options" size={24} color={colors.textPrimary} />
          {hasActiveFilters() && (
            <View
              position="absolute"
              top={6}
              right={6}
              width={6}
              height={6}
              borderRadius={3}
              backgroundColor={colors.primary}
            />
          )}
        </TouchableOpacity>

        <Text
          fontSize={22}
          fontFamily={fonts.bold}
          color={colors.primary}
          letterSpacing={-0.3}
        >
          budie
        </Text>

        <TouchableOpacity
          onPress={() => router.push('/(tabs)/profile')}
          style={{ width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }}
        >
          <Ionicons name="settings" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
      </XStack>

      {/* Profile List */}
      <FlashList
        data={profiles}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        estimatedItemSize={CARD_HEIGHT + spacing.md}
        contentContainerStyle={{
          paddingHorizontal: spacing.sm,
          paddingTop: spacing.sm,
          paddingBottom: spacing.xxl,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="search-outline"
            title="No more profiles"
            subtitle="Check back later for new study partners"
            actionTitle="Refresh"
            onActionPress={loadProfiles}
          />
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

      {/* Filter Modal */}
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        initialFilters={activeFilters}
        onApply={setFilters}
      />
    </YStack>
  );
}
