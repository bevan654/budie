import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import AppHeader from '../components/AppHeader';
import StudyTimer from '../components/study/StudyTimer';
import {
  fetchLeaderboard,
  formatHours,
} from '../services/leaderboardService';

function LeaderboardRow({ rank, name, value, isMe }) {
  const { colors } = useTheme();
  const color = isMe ? colors.primary : colors.textPrimary;
  return (
    <View style={styles.lbRow}>
      <Text
        style={[
          styles.lbRank,
          { color: isMe ? colors.primary : colors.textTertiary },
        ]}
      >
        {String(rank).padStart(2, '0')}
      </Text>
      <Text
        style={[
          styles.lbName,
          {
            color,
            fontFamily: isMe ? 'Inter_800ExtraBold' : 'Inter_700Bold',
          },
        ]}
        numberOfLines={1}
      >
        {name}
      </Text>
      <Text style={[styles.lbValue, { color }]}>{value}</Text>
    </View>
  );
}

function toDisplayName(raw, isMe) {
  if (isMe) return 'YOU';
  if (!raw) return '—';
  const parts = raw.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].toUpperCase();
  return `${parts[0]} ${parts[parts.length - 1][0]}.`.toUpperCase();
}

export default function HomeFeedScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const { userId } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchLeaderboard({ windowDays: 7, limit: 3 })
      .then((data) => {
        if (cancelled) return;
        setRows(data || []);
      })
      .catch((err) => {
        console.warn('[HomeFeed leaderboard] fetch failed:', err?.message || err);
        if (!cancelled) setRows([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const goToTab = (tab, params) =>
    navigation?.getParent()?.navigate(tab, params);

  const bloomNavy = isDark
    ? [colors.primary + '3A', 'transparent']
    : [colors.primary + '1C', 'transparent'];
  const bloomGold = isDark
    ? [colors.warning + '22', 'transparent']
    : [colors.warning + '10', 'transparent'];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader />

      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={bloomNavy}
          start={{ x: 1, y: 0 }}
          end={{ x: 0.15, y: 0.85 }}
          style={[styles.bloom, { top: 110, right: -130 }]}
        />
        <LinearGradient
          colors={bloomGold}
          start={{ x: 0, y: 1 }}
          end={{ x: 0.7, y: 0.1 }}
          style={[styles.bloom, { bottom: 60, left: -150 }]}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.timerHost}>
          <StudyTimer compact />
        </View>

        <View style={styles.sectionLead}>
          <Text style={[styles.sectionKicker, { color: colors.textTertiary }]}>
            LEADERBOARD
          </Text>
          <View style={[styles.rule, { backgroundColor: colors.border }]} />
          <Pressable
            onPress={() => goToTab('Study')}
            hitSlop={8}
            style={({ pressed }) => pressed && { opacity: 0.6 }}
          >
            <Text style={[styles.sectionAction, { color: colors.primary }]}>
              VIEW ALL
            </Text>
          </Pressable>
        </View>

        <View style={styles.leaderboard}>
          {loading ? (
            <Text style={[styles.empty, { color: colors.textTertiary }]}>
              Loading…
            </Text>
          ) : rows.length === 0 ? (
            <Text style={[styles.empty, { color: colors.textTertiary }]}>
              No sessions logged this week.
            </Text>
          ) : (
            rows.map((r, i) => {
              const isMe = r.user_id === userId;
              return (
                <LeaderboardRow
                  key={r.user_id}
                  rank={i + 1}
                  name={toDisplayName(r.name, isMe)}
                  value={formatHours(r.total_seconds)}
                  isMe={isMe}
                />
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bloom: {
    position: 'absolute',
    width: 340,
    height: 340,
    borderRadius: 200,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 0,
    paddingBottom: 56,
  },
  timerHost: {
    marginHorizontal: 0,
    marginBottom: 18,
  },
  sectionLead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 36,
    marginBottom: 24,
  },
  rule: {
    flex: 1,
    height: 1,
  },
  sectionKicker: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    letterSpacing: 3,
  },
  sectionAction: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 10,
    letterSpacing: 2.4,
  },
  leaderboard: {
    gap: 22,
  },
  lbRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 16,
  },
  lbRank: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 13,
    letterSpacing: 0.6,
    width: 26,
  },
  lbName: {
    flex: 1,
    fontSize: 13,
    letterSpacing: 1.4,
  },
  lbValue: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 14,
    letterSpacing: -0.3,
    fontVariant: ['tabular-nums'],
  },
  empty: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    letterSpacing: 0.2,
  },
});
