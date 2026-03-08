import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { YStack, XStack, Text, View } from 'tamagui';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { FlashList } from '@shopify/flash-list';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import useAuthStore from '../../stores/authStore';
import useThemeStore from '../../stores/themeStore';
import useToastStore from '../../stores/toastStore';
import { lightColors, darkColors } from '../../constants/theme';
import { spacing, borderRadius, fonts } from '../../constants/theme';

import {
  fetchMessages,
  sendMessage as sendMessageService,
  subscribeToMessages,
  unsubscribeFromMessages,
} from '../../services/messageService';
import { unmatch } from '../../services/matchService';
import { supabase } from '../../lib/supabase';
import { getErrorMessage } from '../../utils/errorMessages';
import { hapticLight } from '../../utils/haptics';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function ChatDetailScreen() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [matchData, setMatchData] = useState(null);

  const router = useRouter();
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const flashListRef = useRef(null);
  const channelRef = useRef(null);

  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;
  const userId = useAuthStore((s) => s.userId);
  const showToast = useToastStore((s) => s.showToast);

  // Load match data (profile of other user) from the match ID
  useEffect(() => {
    if (id && userId) {
      loadMatchData();
      loadMessages();
      setupSubscription();
    }

    return () => {
      if (channelRef.current) {
        unsubscribeFromMessages(channelRef.current);
      }
    };
  }, [id, userId]);

  const loadMatchData = async () => {
    try {
      const { data: match, error } = await supabase
        .from('matches')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      const otherUserId = match.user1_id === userId ? match.user2_id : match.user1_id;
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', otherUserId)
        .single();

      setMatchData({ ...match, profile });
    } catch (error) {
      showToast({ message: getErrorMessage(error), type: 'error' });
    }
  };

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await fetchMessages(id);
      setMessages(data || []);
    } catch (error) {
      showToast({ message: getErrorMessage(error), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const setupSubscription = () => {
    channelRef.current = subscribeToMessages(id, (incoming) => {
      // Skip messages sent by current user -- handled optimistically
      if (incoming.sender_id === userId) return;

      setMessages((prev) => {
        const exists = prev.some((m) => m.id === incoming.id);
        if (exists) return prev;
        return [...prev, incoming];
      });
    });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    hapticLight();
    const messageContent = newMessage.trim();
    const tempId = `temp-${Date.now()}`;

    const optimisticMessage = {
      id: tempId,
      match_id: id,
      sender_id: userId,
      content: messageContent,
      created_at: new Date().toISOString(),
      status: 'sending',
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setNewMessage('');
    setSending(true);

    try {
      const sentMessage = await sendMessageService(id, userId, messageContent);

      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...sentMessage, status: 'sent' } : m))
      );
    } catch (error) {
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, status: 'failed' } : m))
      );

      Alert.alert('Failed to send', getErrorMessage(error), [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Retry', onPress: () => retryMessage(tempId, messageContent) },
      ]);
    } finally {
      setSending(false);
    }
  };

  const retryMessage = async (tempId, content) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === tempId ? { ...m, status: 'sending' } : m))
    );

    try {
      const sentMessage = await sendMessageService(id, userId, content);
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...sentMessage, status: 'sent' } : m))
      );
    } catch (error) {
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, status: 'failed' } : m))
      );
      showToast({ message: getErrorMessage(error), type: 'error' });
    }
  };

  const handleUnmatch = () => {
    Alert.alert(
      'Unmatch',
      `Are you sure you want to unmatch with ${matchData?.profile?.name}? This will delete your conversation.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unmatch',
          style: 'destructive',
          onPress: async () => {
            try {
              await unmatch(id);
              showToast({ message: 'Unmatched successfully', type: 'info' });
              router.back();
            } catch (error) {
              showToast({ message: 'Failed to unmatch', type: 'error' });
            }
          },
        },
      ]
    );
  };

  const renderMessage = useCallback(
    ({ item }) => {
      const isCurrentUser = item.sender_id === userId;
      const isFailed = item.status === 'failed';

      return (
        <YStack
          marginBottom={spacing.md}
          maxWidth="75%"
          alignSelf={isCurrentUser ? 'flex-end' : 'flex-start'}
        >
          <View
            padding={spacing.md}
            borderRadius={borderRadius.lg}
            backgroundColor={isCurrentUser ? colors.primary : colors.backgroundSecondary}
            borderBottomRightRadius={isCurrentUser ? 4 : borderRadius.lg}
            borderBottomLeftRadius={isCurrentUser ? borderRadius.lg : 4}
            borderWidth={isCurrentUser ? 0 : 1}
            borderColor={isCurrentUser ? 'transparent' : colors.border}
            opacity={isFailed ? 0.6 : 1}
          >
            <Text
              fontSize={15}
              fontFamily={fonts.regular}
              lineHeight={21}
              color={isCurrentUser ? colors.white : colors.textPrimary}
            >
              {item.content}
            </Text>
            {item.status === 'sending' && (
              <ActivityIndicator
                size="small"
                color={colors.white}
                style={{ marginTop: spacing.xs }}
              />
            )}
            {isFailed && (
              <Text fontSize={12} color={colors.error} marginTop={spacing.xs}>
                Failed to send
              </Text>
            )}
          </View>
        </YStack>
      );
    },
    [colors, userId]
  );

  if (loading && !matchData) {
    return <LoadingSpinner />;
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <XStack
        alignItems="center"
        paddingTop={insets.top + 12}
        paddingHorizontal={spacing.xl}
        paddingBottom={spacing.lg}
        backgroundColor={colors.background}
        borderBottomWidth={1}
        borderBottomColor={colors.border}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 36,
            height: 36,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: spacing.sm,
          }}
        >
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        <View borderRadius={18} overflow="hidden" marginRight={spacing.md}>
          <Image
            source={{ uri: matchData?.profile?.photo_url }}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: colors.backgroundSecondary,
            }}
            contentFit="cover"
          />
        </View>

        <Text fontSize={17} fontFamily={fonts.semiBold} color={colors.textPrimary}>
          {matchData?.profile?.name}
        </Text>

        <View flex={1} />

        <TouchableOpacity
          onPress={handleUnmatch}
          style={{
            width: 36,
            height: 36,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Ionicons name="ellipsis-vertical" size={20} color={colors.textTertiary} />
        </TouchableOpacity>
      </XStack>

      {/* Messages */}
      <YStack flex={1}>
        <FlashList
          ref={flashListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id.toString()}
          estimatedItemSize={60}
          contentContainerStyle={{ padding: spacing.xl }}
          onContentSizeChange={() => flashListRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            <YStack alignItems="center" paddingTop={60}>
              <Text fontSize={15} color={colors.textTertiary} fontFamily={fonts.regular}>
                Start the conversation
              </Text>
            </YStack>
          }
        />
      </YStack>

      {/* Input Bar */}
      <XStack
        padding={spacing.md}
        paddingBottom={insets.bottom > 0 ? insets.bottom : spacing.xxl}
        backgroundColor={colors.background}
        alignItems="flex-end"
        gap={spacing.sm}
      >
        <TextInput
          style={{
            flex: 1,
            backgroundColor: colors.backgroundSecondary,
            padding: spacing.md,
            paddingTop: spacing.md,
            borderRadius: borderRadius.xl,
            fontSize: 15,
            fontFamily: fonts.regular,
            color: colors.textPrimary,
            maxHeight: 100,
            borderWidth: 1,
            borderColor: colors.border,
          }}
          placeholder="Type a message..."
          placeholderTextColor={colors.textTertiary}
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
          editable={!sending}
        />
        <TouchableOpacity
          onPress={handleSendMessage}
          disabled={sending}
          style={{ opacity: sending ? 0.6 : 1 }}
        >
          <View
            width={36}
            height={36}
            borderRadius={18}
            backgroundColor={colors.primary}
            justifyContent="center"
            alignItems="center"
          >
            {sending ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Ionicons name="arrow-up" size={18} color={colors.white} />
            )}
          </View>
        </TouchableOpacity>
      </XStack>
    </KeyboardAvoidingView>
  );
}
