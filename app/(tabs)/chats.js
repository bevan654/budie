import React, { useState, useCallback, useRef } from 'react';
import { TouchableOpacity, RefreshControl, TextInput } from 'react-native';
import { YStack, XStack, Text, View } from 'tamagui';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { FlashList } from '@shopify/flash-list';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import useAuthStore from '../../stores/authStore';
import useThemeStore from '../../stores/themeStore';
import useToastStore from '../../stores/toastStore';
import { lightColors, darkColors } from '../../constants/theme';
import { spacing, borderRadius, fonts } from '../../constants/theme';

import { supabase } from '../../lib/supabase';
import SkeletonLoader from '../../components/SkeletonLoader';


export default function ChatsScreen() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const router = useRouter();
  const insets = useSafeAreaInsets();

  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;
  const userId = useAuthStore((s) => s.userId);
  const showToast = useToastStore((s) => s.showToast);

  const userIdRef = useRef(userId);
  userIdRef.current = userId;

  const fetchMatchesData = useCallback(async () => {
    const currentUserId = userIdRef.current;
    if (!currentUserId) return;

    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .or(`user1_id.eq.${currentUserId},user2_id.eq.${currentUserId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const matchesWithProfiles = await Promise.all(
        (data || []).map(async (match) => {
          const otherUserId =
            match.user1_id === currentUserId ? match.user2_id : match.user1_id;

          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', otherUserId)
            .single();

          const { data: messages } = await supabase
            .from('messages')
            .select('*')
            .eq('match_id', match.id)
            .order('created_at', { ascending: false })
            .limit(1);

          return {
            ...match,
            profile,
            lastMessage: messages?.[0],
          };
        })
      );

      setMatches(matchesWithProfiles);
    } catch (error) {
      showToast({ message: error.message, type: 'error' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (userIdRef.current) {
        fetchMatchesData();
      }
    }, [userId])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMatchesData();
  }, []);

  const filteredMatches = matches.filter((item) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      item.profile?.name?.toLowerCase().includes(q) ||
      item.lastMessage?.content?.toLowerCase().includes(q)
    );
  });

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const renderItem = useCallback(
    ({ item }) => (
      <TouchableOpacity
        onPress={() => router.push(`/chat/${item.id}`)}
        activeOpacity={0.7}
      >
        <XStack
          backgroundColor={colors.cardBackground}
          padding={spacing.lg}
          borderRadius={borderRadius.md}
          marginBottom={spacing.sm}
          alignItems="center"
          borderWidth={1}
          borderColor={colors.border}
        >
          {/* Avatar */}
          <View borderRadius={28} overflow="hidden">
            <Image
              source={{ uri: item.profile?.photo_url }}
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: colors.backgroundSecondary,
              }}
              contentFit="cover"
            />
          </View>

          {/* Content */}
          <YStack flex={1} marginLeft={spacing.lg}>
            <XStack justifyContent="space-between" alignItems="center" marginBottom={2}>
              <Text
                fontSize={15}
                fontFamily={fonts.semiBold}
                color={colors.textPrimary}
              >
                {item.profile?.name}
              </Text>
              {item.lastMessage && (
                <Text
                  fontSize={11}
                  color={colors.textTertiary}
                  fontFamily={fonts.regular}
                >
                  {formatTime(item.lastMessage.created_at)}
                </Text>
              )}
            </XStack>
            {item.lastMessage ? (
              <Text
                fontSize={13}
                color={colors.textSecondary}
                marginTop={2}
                numberOfLines={1}
              >
                {item.lastMessage.sender_id === userId ? 'You: ' : ''}
                {item.lastMessage.content}
              </Text>
            ) : (
              <Text
                fontSize={13}
                color={colors.primary}
                fontFamily={fonts.medium}
                marginTop={2}
              >
                Tap to say hello
              </Text>
            )}
          </YStack>

          <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
        </XStack>
      </TouchableOpacity>
    ),
    [colors, router, userId]
  );

  if (loading) {
    return (
      <YStack flex={1} backgroundColor={colors.background} paddingTop={insets.top + 8}>
        <SkeletonLoader.ChatRow />
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
            budies
          </Text>
          {matches.length > 0 && (
            <View
              backgroundColor={colors.primary}
              borderRadius={9999}
              paddingHorizontal={spacing.sm + 2}
              paddingVertical={2}
              minWidth={24}
              alignItems="center"
            >
              <Text fontSize={12} fontFamily={fonts.semiBold} color={colors.white}>
                {matches.length}
              </Text>
            </View>
          )}
        </XStack>
        <Text
          fontSize={13}
          fontFamily={fonts.regular}
          color={colors.textSecondary}
          marginTop={spacing.xs}
        >
          Your study partners
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
          placeholder="Search conversations..."
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

      {/* Chat List */}
      <FlashList
        data={filteredMatches}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        estimatedItemSize={80}
        contentContainerStyle={{
          paddingHorizontal: spacing.xl,
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
            <Ionicons name="chatbubble" size={48} color={colors.textTertiary} />
            <Text
              fontSize={17}
              fontFamily={fonts.semiBold}
              color={colors.textSecondary}
            >
              {search ? 'No results found' : 'No budies yet'}
            </Text>
            <Text
              fontSize={13}
              fontFamily={fonts.regular}
              color={colors.textTertiary}
            >
              {search ? 'Try a different search' : 'Match with someone to start chatting'}
            </Text>
          </YStack>
        }
      />
    </YStack>
  );
}
