import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { fetchLeaderboard, formatHours } from '../../services/leaderboardService';

function initials(name) {
  if (!name) return '—';
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function RankBadge({ rank }) {
  const { colors } = useTheme();
  const isPodium = rank <= 3;
  const podiumColor =
    rank === 1 ? colors.warning : rank === 2 ? colors.textSecondary : '#CD7F32';
  return (
    <View
      style={[
        styles.rankBadge,
        {
          backgroundColor: isPodium ? podiumColor : colors.backgroundSecondary,
        },
      ]}
    >
      {isPodium ? (
        <Ionicons name="trophy" size={12} color="#FFFFFF" />
      ) : (
        <Text style={[styles.rankText, { color: colors.textTertiary }]}>{rank}</Text>
      )}
    </View>
  );
}

function Row({ user, rank }) {
  const { colors, isDark } = useTheme();
  const highlight = user.isMe;
  return (
    <View
      style={[
        styles.row,
        {
          backgroundColor: highlight ? colors.primaryLight : colors.cardBackground,
          borderColor: highlight ? colors.primary : colors.border,
          shadowOpacity: isDark ? 0.2 : 0.04,
        },
      ]}
    >
      <RankBadge rank={rank} />
      <View
        style={[
          styles.avatar,
          {
            backgroundColor: highlight ? colors.primary : colors.backgroundSecondary,
          },
        ]}
      >
        <Text
          style={[
            styles.avatarText,
            { color: highlight ? '#FFFFFF' : colors.textSecondary },
          ]}
        >
          {initials(user.name)}
        </Text>
      </View>
      <View style={styles.rowInfo}>
        <Text
          style={[
            styles.name,
            {
              color: colors.textPrimary,
              fontFamily: highlight ? 'Inter_700Bold' : 'Inter_600SemiBold',
            },
          ]}
        >
          {user.name}
        </Text>
        <Text style={[styles.subtle, { color: colors.textTertiary }]}>
          This week
        </Text>
      </View>
      <Text
        style={[
          styles.value,
          { color: highlight ? colors.primary : colors.textPrimary },
        ]}
      >
        {formatHours(user.totalSeconds)}
      </Text>
    </View>
  );
}

export default function Leaderboard() {
  const { colors } = useTheme();
  const { userId } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchLeaderboard({ windowDays: 7, limit: 50 })
      .then((data) => {
        if (cancelled) return;
        setRows(
          (data || []).map((r) => ({
            id: r.user_id,
            name: r.name,
            totalSeconds: r.total_seconds,
            isMe: r.user_id === userId,
          }))
        );
      })
      .catch((err) => {
        console.warn('[Leaderboard] fetch failed:', err?.message || err);
        if (!cancelled) setRows([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const myIndex = rows.findIndex((u) => u.isMe);
  const myRank = myIndex >= 0 ? myIndex + 1 : null;

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.headerIcon, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name="podium" size={16} color={colors.primary} />
          </View>
          <View>
            <Text style={[styles.rankLabel, { color: colors.textTertiary }]}>
              YOUR RANK
            </Text>
            <Text style={[styles.rankValue, { color: colors.textPrimary }]}>
              {myRank ? `#${myRank}` : '—'}
              <Text style={[styles.rankOf, { color: colors.textTertiary }]}>
                {' '}
                of {rows.length || '—'}
              </Text>
            </Text>
          </View>
        </View>
      </View>

      {loading ? (
        <Text style={[styles.empty, { color: colors.textTertiary }]}>Loading…</Text>
      ) : rows.length === 0 ? (
        <Text style={[styles.empty, { color: colors.textTertiary }]}>
          No sessions logged this week yet.
        </Text>
      ) : (
        <View style={styles.list}>
          {rows.map((user, i) => (
            <Row key={user.id} user={user} rank={i + 1} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    letterSpacing: 1.2,
  },
  rankValue: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 22,
    letterSpacing: -0.5,
    marginTop: 1,
  },
  rankOf: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    letterSpacing: 0,
  },
  empty: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    letterSpacing: 0.2,
    paddingVertical: 4,
  },
  list: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 1,
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    letterSpacing: 0.3,
  },
  rowInfo: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    letterSpacing: -0.2,
  },
  subtle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    marginTop: 1,
  },
  value: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 15,
    letterSpacing: -0.4,
  },
});
