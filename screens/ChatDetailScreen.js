import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import { fetchMessages, sendMessage as sendMessageService, subscribeToMessages, unsubscribeFromMessages } from '../services/messageService';
import { unmatch } from '../services/matchService';
import { typography, spacing, borderRadius } from '../constants/theme';
import { getErrorMessage } from '../utils/errorMessages';
import LoadingSpinner from '../components/LoadingSpinner';
import { hapticLight } from '../utils/haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ChatDetailScreen({ route, navigation }) {
  const { match } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef(null);
  const channelRef = useRef(null);

  const { userId } = useAuth();
  const { colors } = useTheme();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (userId) {
      loadMessages();
      setupSubscription();
    }

    return () => {
      if (channelRef.current) {
        unsubscribeFromMessages(channelRef.current);
      }
    };
  }, [userId]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await fetchMessages(match.id);
      setMessages(data || []);
    } catch (error) {
      showToast({ message: getErrorMessage(error), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const setupSubscription = () => {
    channelRef.current = subscribeToMessages(match.id, (incoming) => {
      // Skip messages sent by current user — already handled optimistically
      if (incoming.sender_id === userId) return;

      setMessages((prev) => {
        const exists = prev.some(m => m.id === incoming.id);
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
      match_id: match.id,
      sender_id: userId,
      content: messageContent,
      created_at: new Date().toISOString(),
      status: 'sending',
    };

    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');
    setSending(true);

    try {
      const sentMessage = await sendMessageService(match.id, userId, messageContent);

      setMessages(prev =>
        prev.map(m => m.id === tempId ? { ...sentMessage, status: 'sent' } : m)
      );
    } catch (error) {
      setMessages(prev =>
        prev.map(m => m.id === tempId ? { ...m, status: 'failed' } : m)
      );

      Alert.alert(
        'Failed to send',
        getErrorMessage(error),
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Retry', onPress: () => retryMessage(tempId, messageContent) },
        ]
      );
    } finally {
      setSending(false);
    }
  };

  const retryMessage = async (tempId, content) => {
    setMessages(prev =>
      prev.map(m => m.id === tempId ? { ...m, status: 'sending' } : m)
    );

    try {
      const sentMessage = await sendMessageService(match.id, userId, content);

      setMessages(prev =>
        prev.map(m => m.id === tempId ? { ...sentMessage, status: 'sent' } : m)
      );
    } catch (error) {
      setMessages(prev =>
        prev.map(m => m.id === tempId ? { ...m, status: 'failed' } : m)
      );
      showToast({ message: getErrorMessage(error), type: 'error' });
    }
  };

  const handleUnmatch = () => {
    Alert.alert(
      'Unmatch',
      `Are you sure you want to unmatch with ${match.profile?.name}? This will delete your conversation.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unmatch',
          style: 'destructive',
          onPress: async () => {
            try {
              await unmatch(match.id);
              showToast({ message: 'Unmatched successfully', type: 'info' });
              navigation.goBack();
            } catch (error) {
              showToast({ message: 'Failed to unmatch', type: 'error' });
            }
          },
        },
      ]
    );
  };

  const styles = createStyles(colors, insets);

  const renderMessage = ({ item }) => {
    const isCurrentUser = item.sender_id === userId;
    const isFailed = item.status === 'failed';

    return (
      <View
        style={[
          styles.messageContainer,
          isCurrentUser ? styles.messageRight : styles.messageLeft,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isCurrentUser ? styles.messageBubbleRight : styles.messageBubbleLeft,
            isFailed && styles.messageBubbleFailed,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isCurrentUser ? styles.messageTextRight : styles.messageTextLeft,
            ]}
          >
            {item.content}
          </Text>
          {item.status === 'sending' && (
            <ActivityIndicator size="small" color={colors.white} style={styles.messageStatus} />
          )}
          {isFailed && (
            <Text style={styles.failedText}>Failed to send</Text>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Image source={{ uri: match.profile?.photo_url }} style={styles.avatar} />
        <Text style={styles.headerTitle}>{match.profile?.name}</Text>
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={handleUnmatch} style={styles.unmatchButton}>
          <Ionicons name="ellipsis-vertical" size={20} color={colors.textTertiary} />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Start the conversation</Text>
          </View>
        }
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor={colors.textTertiary}
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
          editable={!sending}
        />
        <TouchableOpacity
          style={[styles.sendButton, sending && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Ionicons name="arrow-up" size={18} color={colors.white} />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors, insets) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: insets.top + 12,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.backgroundSecondary,
    marginRight: spacing.md,
  },
  headerTitle: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  unmatchButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    padding: spacing.xl,
  },
  messageContainer: {
    marginBottom: spacing.md,
    maxWidth: '75%',
  },
  messageLeft: {
    alignSelf: 'flex-start',
  },
  messageRight: {
    alignSelf: 'flex-end',
  },
  messageBubble: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  messageBubbleLeft: {
    backgroundColor: colors.backgroundSecondary,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageBubbleRight: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  messageBubbleFailed: {
    opacity: 0.6,
  },
  messageText: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    lineHeight: 21,
  },
  messageTextLeft: {
    color: colors.textPrimary,
  },
  messageTextRight: {
    color: colors.white,
  },
  messageStatus: {
    marginTop: spacing.xs,
  },
  failedText: {
    fontSize: 12,
    color: colors.error,
    marginTop: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    paddingBottom: spacing.xxl,
    backgroundColor: colors.background,
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.md,
    paddingTop: spacing.md,
    borderRadius: borderRadius.xl,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: colors.textPrimary,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    ...typography.body,
    color: colors.textTertiary,
  },
});
