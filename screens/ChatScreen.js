import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { resolveProfilePhoto } from '../services/photoService';
import { fetchMatchUnreadCounts } from '../services/messageService';
import { typography, spacing, borderRadius } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import SkeletonLoader from '../components/SkeletonLoader';
import AppHeader from '../components/AppHeader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ChatScreen({ navigation }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);

  const { colors, shadows } = useTheme();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colors, shadows, insets);

  const userIdRef = useRef(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        userIdRef.current = user.id;
        setCurrentUserId(user.id);
      }
    };
    getUser();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (userIdRef.current) {
        fetchMatches();
      }
    }, [currentUserId])
  );

  const fetchMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .or(`user1_id.eq.${currentUserId},user2_id.eq.${currentUserId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const rows = data || [];
      const unreadCounts = await fetchMatchUnreadCounts(
        currentUserId,
        rows.map(m => m.id)
      );

      const matchesWithProfiles = await Promise.all(
        rows.map(async (match) => {
          const otherUserId = match.user1_id === currentUserId ? match.user2_id : match.user1_id;

          const [profileRes, messagesRes] = await Promise.all([
            supabase.from('profiles').select('*').eq('id', otherUserId).single(),
            supabase
              .from('messages')
              .select('*')
              .eq('match_id', match.id)
              .order('created_at', { ascending: false })
              .limit(1),
          ]);

          return {
            ...match,
            profile: await resolveProfilePhoto(profileRes.data),
            lastMessage: messagesRes.data?.[0],
            unreadCount: unreadCounts[match.id] || 0,
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
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMatches();
  }, [currentUserId]);

  const filteredMatches = matches.filter(item => {
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
    const diffMins = Math.floor((now - date) / 60000);
    const diffHours = Math.floor((now - date) / 3600000);
    const diffDays = Math.floor((now - date) / 86400000);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const renderMatch = ({ item }) => {
    const unread = item.unreadCount > 0;
    const isFromMe = item.lastMessage?.sender_id === currentUserId;
    const previewText = item.lastMessage
      ? (isFromMe ? `You: ${item.lastMessage.content}` : item.lastMessage.content)
      : 'Say hi';

    return (
      <TouchableOpacity
        style={styles.row}
        onPress={() => navigation.navigate('ChatDetail', { match: item })}
        activeOpacity={0.6}
      >
        <Image source={{ uri: item.profile?.photo_url }} style={styles.avatar} />

        <View style={styles.content}>
          <View style={styles.topLine}>
            <Text style={[styles.name, unread && styles.nameUnread]} numberOfLines={1}>
              {item.profile?.name}
            </Text>
            {item.lastMessage && (
              <Text style={[styles.time, unread && styles.timeUnread]}>
                {formatTime(item.lastMessage.created_at)}
              </Text>
            )}
          </View>
          <View style={styles.bottomLine}>
            <Text
              style={[
                styles.preview,
                unread && styles.previewUnread,
                !item.lastMessage && styles.previewEmpty,
              ]}
              numberOfLines={1}
            >
              {previewText}
            </Text>
            {unread && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>
                  {item.unreadCount > 99 ? '99+' : item.unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
        <SkeletonLoader.ChatRow />
      </View>
    );
  }

  const totalUnread = matches.reduce((acc, m) => acc + m.unreadCount, 0);

  return (
    <View style={styles.container}>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={colors.textTertiary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations..."
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
        data={filteredMatches}
        renderItem={renderMatch}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        keyboardDismissMode="on-drag"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubble" size={48} color={colors.textTertiary} />
            <Text style={styles.emptyText}>
              {search ? 'No results found' : 'No budies yet'}
            </Text>
            <Text style={styles.emptySubtext}>
              {search ? 'Try a different search' : 'Match with someone to start chatting'}
            </Text>
          </View>
        }
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
  headerBadge: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
    minWidth: 24,
    alignItems: 'center',
  },
  headerBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    color: colors.white,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.xxl,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    fontSize: 15,
    color: colors.textPrimary,
  },
  clearButton: {
    padding: spacing.xs,
  },

  // List
  list: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
  },

  // Conversation row (Instagram-style — no card, clean horizontal padding)
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: spacing.xxl,
    backgroundColor: colors.background,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.backgroundSecondary,
  },
  content: {
    flex: 1,
    marginLeft: spacing.lg,
    justifyContent: 'center',
  },
  topLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  name: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
  nameUnread: {
    fontFamily: 'Inter_700Bold',
  },
  time: {
    fontSize: 12,
    color: colors.textTertiary,
    fontFamily: 'Inter_400Regular',
  },
  timeUnread: {
    color: colors.primary,
    fontFamily: 'Inter_600SemiBold',
  },
  bottomLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  preview: {
    flex: 1,
    fontSize: 13,
    color: colors.textTertiary,
    fontFamily: 'Inter_400Regular',
    marginRight: spacing.sm,
  },
  previewUnread: {
    color: colors.textPrimary,
    fontFamily: 'Inter_500Medium',
  },
  previewEmpty: {
    color: colors.primary,
    fontFamily: 'Inter_500Medium',
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadBadgeText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    color: colors.white,
  },

  // Empty state
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
