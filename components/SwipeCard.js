import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { spacing, borderRadius } from '../constants/theme';
import { getRankFromXp, tierProgress, formatXp } from '../constants/rankTiers';
import { fetchUserXp } from '../services/xpService';
import { fetchUserStreak } from '../services/streakService';
import { fetchUserWeeklyTotal } from '../services/studySessionService';
import { TIERS, getTier } from '../utils/streakTiers';

function streakDaysFallback(profile) {
  const seedSrc = String(profile?.id ?? profile?.name ?? '');
  let seed = 0;
  for (let i = 0; i < seedSrc.length; i++) seed = (seed * 31 + seedSrc.charCodeAt(i)) >>> 0;
  return (seed % 28) + 1;
}

export default function SwipeCard({ profile, onPress, onLike, onDislike }) {
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors, isDark);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [xp, setXp] = useState(0);
  const [streakDays, setStreakDays] = useState(streakDaysFallback(profile));
  const [avgHours, setAvgHours] = useState(0);

  useEffect(() => {
    let cancelled = false;
    if (!profile?.id) return;
    Promise.all([
      fetchUserXp(profile.id),
      fetchUserStreak(profile.id).catch(() => ({ current: streakDaysFallback(profile) })),
      fetchUserWeeklyTotal(profile.id).catch(() => 0),
    ]).then(([userXp, streak, weeklySec]) => {
      if (cancelled) return;
      setXp(userXp);
      setStreakDays(streak?.current ?? streakDaysFallback(profile));
      setAvgHours((weeklySec || 0) / 3600 / 7);
    });
    return () => {
      cancelled = true;
    };
  }, [profile?.id]);

  const rank = getRankFromXp(xp);
  const streakTier = getTier(avgHours) || TIERS.COLD;
  const meta = { days: streakDays, rank, xp, streakTier };

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.95} onPress={onPress}>
      <Image
        source={{ uri: profile.photo_url || 'https://via.placeholder.com/400' }}
        style={[styles.image, !imageLoaded && { opacity: 0 }]}
        onLoad={() => setImageLoaded(true)}
      />
      {!imageLoaded && (
        <View style={styles.imagePlaceholder}>
          <ActivityIndicator color={colors.textTertiary} />
        </View>
      )}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.0)', 'rgba(0,0,0,0.55)', 'rgba(0,0,0,0.92)']}
        locations={[0, 0.4, 0.75, 1]}
        style={styles.gradient}
      />

      <View style={styles.infoCard}>
        <View style={styles.headerWrap}>
          <Text style={styles.name} numberOfLines={1}>
            {profile.name}{profile.age ? `, ${profile.age}` : ''}
          </Text>
          <Text style={styles.subText} numberOfLines={1}>
            {profile.course}
            {profile.course_year ? ` · Year ${profile.course_year}` : ''}
          </Text>
        </View>

        <View style={styles.statsBetween}>
          {/* Streak */}
          <View style={styles.statCol}>
            <View style={styles.statTop}>
              <View
                style={[styles.statIconWrap, { backgroundColor: meta.streakTier.color + '22' }]}
              >
                <Ionicons name="flame" size={14} color={meta.streakTier.color} />
              </View>
              <Text style={[styles.statValue, { color: meta.streakTier.color }]}>{meta.days}</Text>
            </View>
            <Text style={styles.statLabel}>{meta.streakTier.name} streak</Text>
          </View>

          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />

          {/* Rank */}
          <View style={styles.statCol}>
            <View style={styles.rankTop}>
              <Text style={styles.rankEmoji}>{meta.rank.emoji}</Text>
              <Text style={styles.rankName}>{meta.rank.name}</Text>
            </View>
            <View style={[styles.rankBarTrack, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.rankBarFill,
                  {
                    width: `${tierProgress(meta.rank, meta.xp) * 100}%`,
                    backgroundColor: colors.primary,
                  },
                ]}
              />
            </View>
            <Text style={styles.rankXp}>{formatXp(meta.xp)} XP</Text>
          </View>
        </View>

        {(onLike || onDislike) && (
          <View style={styles.actionsRow}>
            <TouchableOpacity
              onPress={onDislike}
              activeOpacity={0.85}
              style={[styles.actionRect, styles.actionLeft, { backgroundColor: colors.dislikeRed }]}
            >
              <Ionicons name="close" size={26} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onLike}
              activeOpacity={0.85}
              style={[styles.actionRect, styles.actionRight, { backgroundColor: colors.likeGreen }]}
            >
              <Ionicons name="checkmark" size={26} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (colors, isDark) => StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.black,
    overflow: 'hidden',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    backgroundColor: colors.imagePlaceholder,
  },
  imagePlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.imagePlaceholder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  infoCard: {
    position: 'absolute',
    left: 6,
    right: 6,
    bottom: 6,
    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    paddingTop: 12,
    paddingBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: isDark ? 0.45 : 0.18,
    shadowRadius: 18,
    elevation: 10,
  },
  headerWrap: {
    paddingHorizontal: 16,
    marginBottom: 10,
    alignItems: 'center',
  },
  statsBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
    paddingHorizontal: 16,
  },
  actionRect: {
    width: 96,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLeft: {},
  actionRight: {},
  name: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    letterSpacing: -0.3,
    color: colors.textPrimary,
  },
  subText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statIconWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankEmoji: {
    fontSize: 16,
  },
  statValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    letterSpacing: -0.3,
    color: colors.textPrimary,
  },
  statLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  rankTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  rankName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    letterSpacing: -0.2,
    color: colors.textPrimary,
  },
  rankBarTrack: {
    width: 78,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 6,
  },
  rankBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  rankXp: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 44,
    marginHorizontal: 8,
  },
});
