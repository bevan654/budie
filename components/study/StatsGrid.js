import React, { createContext, useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { fetchStudyStats } from '../../services/statsService';

const DEFAULTS = {
  currentStreak: 0,
  longestStreak: 0,
  consistency: [false, false, false, false, false, false, false],
  dailyHoursLast7: [0, 0, 0, 0, 0, 0, 0],
  dailyAverage: '0m',
  weeklyTotal: '0m',
  weeklyTotalDelta: '+ 0m vs last week',
};

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const StatsContext = createContext(DEFAULTS);
const useStats = () => useContext(StatsContext);

function SectionTitle({ children }) {
  const { colors } = useTheme();
  return (
    <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>
      {children}
    </Text>
  );
}

function StreakHero() {
  const { colors } = useTheme();
  const stats = useStats();
  return (
    <View style={styles.heroRow}>
      <View style={styles.heroPrimary}>
        <View style={[styles.heroIcon, { backgroundColor: colors.warningLight }]}>
          <Ionicons name="flame" size={28} color={colors.warning} />
        </View>
        <View>
          <View style={styles.heroNumberRow}>
            <Text style={[styles.heroNumber, { color: colors.textPrimary }]}>
              {stats.currentStreak}
            </Text>
            <Text style={[styles.heroUnit, { color: colors.textSecondary }]}>days</Text>
          </View>
          <Text style={[styles.heroLabel, { color: colors.textSecondary }]}>
            Current streak
          </Text>
        </View>
      </View>
      <View style={[styles.heroDivider, { backgroundColor: colors.border }]} />
      <View style={styles.heroSecondary}>
        <Ionicons name="trophy" size={16} color={colors.success} />
        <Text style={[styles.heroSecondaryNumber, { color: colors.textPrimary }]}>
          {stats.longestStreak}
        </Text>
        <Text style={[styles.heroSecondaryLabel, { color: colors.textTertiary }]}>
          longest
        </Text>
      </View>
    </View>
  );
}

function ConsistencyRow() {
  const { colors } = useTheme();
  const stats = useStats();
  const studied = stats.consistency.filter(Boolean).length;
  const pct = Math.round((studied / 7) * 100);
  return (
    <View style={styles.consistencyBlock}>
      <View style={styles.consistencyHeader}>
        <Text style={[styles.consistencyTitle, { color: colors.textPrimary }]}>
          Weekly consistency
        </Text>
        <Text style={[styles.consistencyPct, { color: colors.primary }]}>
          {pct}%
        </Text>
      </View>
      <View style={styles.dotsRow}>
        {stats.consistency.map((on, i) => (
          <View key={i} style={styles.dotCol}>
            <View
              style={[
                styles.dot,
                {
                  backgroundColor: on ? colors.primary : 'transparent',
                  borderColor: on ? colors.primary : colors.borderDark,
                },
              ]}
            />
            <Text
              style={[
                styles.dotLabel,
                { color: on ? colors.textSecondary : colors.textTertiary },
              ]}
            >
              {DAY_LABELS[i]}
            </Text>
          </View>
        ))}
      </View>
      <Text style={[styles.consistencyMeta, { color: colors.textTertiary }]}>
        {studied} of 7 days
      </Text>
    </View>
  );
}

function DailyChart() {
  const { colors } = useTheme();
  const stats = useStats();
  const data = stats.dailyHoursLast7;
  const max = Math.max(...data, 1);
  const avg = data.reduce((a, b) => a + b, 0) / data.length;
  const avgPct = avg / max;
  const CHART_HEIGHT = 88;
  const today = data.length - 1;

  return (
    <View style={styles.chartBlock}>
      <View style={styles.chartHeader}>
        <Text style={[styles.chartTitle, { color: colors.textPrimary }]}>
          Daily average
        </Text>
        <Text style={[styles.chartValue, { color: colors.primary }]}>
          {stats.dailyAverage}
        </Text>
      </View>

      <View style={[styles.chartArea, { height: CHART_HEIGHT }]}>
        <View
          style={[
            styles.avgLine,
            {
              bottom: avgPct * CHART_HEIGHT,
              borderColor: colors.primary,
            },
          ]}
        >
          <View style={[styles.avgChip, { backgroundColor: colors.primary }]}>
            <Text style={styles.avgChipText}>avg</Text>
          </View>
        </View>

        {data.map((v, i) => {
          const h = Math.max(4, (v / max) * (CHART_HEIGHT - 8));
          const isToday = i === today;
          return (
            <View key={i} style={styles.barCol}>
              <View
                style={[
                  styles.bar,
                  {
                    height: h,
                    backgroundColor: isToday
                      ? colors.primary
                      : colors.primaryLight,
                  },
                ]}
              />
            </View>
          );
        })}
      </View>

      <View style={styles.barLabelsRow}>
        {DAY_LABELS.map((d, i) => (
          <Text
            key={i}
            style={[
              styles.barLabel,
              {
                color: i === today ? colors.primary : colors.textTertiary,
                fontFamily: i === today ? 'Inter_700Bold' : 'Inter_500Medium',
              },
            ]}
          >
            {d}
          </Text>
        ))}
      </View>
    </View>
  );
}

function WeeklyTotalHero() {
  const { colors } = useTheme();
  const stats = useStats();
  return (
    <View style={styles.weeklyHero}>
      <Text style={[styles.weeklyLabel, { color: colors.textTertiary }]}>
        WEEKLY TOTAL
      </Text>
      <Text style={[styles.weeklyValue, { color: colors.textPrimary }]}>
        {stats.weeklyTotal}
      </Text>
      <Text style={[styles.weeklyDelta, { color: colors.success }]}>
        ↑ {stats.weeklyTotalDelta}
      </Text>
    </View>
  );
}

export default function StatsGrid() {
  const { colors } = useTheme();
  const { userId } = useAuth();
  const [stats, setStats] = useState(DEFAULTS);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    fetchStudyStats(userId)
      .then((data) => {
        if (!cancelled && data) setStats(data);
      })
      .catch((err) => {
        console.warn('[StatsGrid] fetchStudyStats failed:', err?.message || err);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return (
    <StatsContext.Provider value={stats}>
    <View style={styles.root}>
      <View style={styles.section}>
        <SectionTitle>STREAKS</SectionTitle>
        <StreakHero />
        <ConsistencyRow />
      </View>

      <View style={styles.section}>
        <SectionTitle>TIME</SectionTitle>
        <DailyChart />
        <WeeklyTotalHero />
      </View>
    </View>
    </StatsContext.Provider>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 36,
  },
  section: {
    gap: 24,
  },
  sectionTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    letterSpacing: 1.4,
    marginBottom: -4,
  },

  // Streak hero
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  heroPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroNumberRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  heroNumber: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 44,
    letterSpacing: -2,
  },
  heroUnit: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
  heroLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    marginTop: -2,
  },
  heroDivider: {
    width: 1,
    height: 36,
  },
  heroSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroSecondaryNumber: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    letterSpacing: -0.5,
  },
  heroSecondaryLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    letterSpacing: 0.3,
  },

  // Consistency
  consistencyBlock: {
    gap: 10,
  },
  consistencyHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  consistencyTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    letterSpacing: -0.2,
  },
  consistencyPct: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 18,
    letterSpacing: -0.5,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dotCol: {
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
  },
  dotLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
  },
  consistencyMeta: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    textAlign: 'right',
  },

  // Daily chart
  chartBlock: {
    gap: 12,
    paddingBottom: 4,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  chartTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    letterSpacing: -0.2,
  },
  chartValue: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 22,
    letterSpacing: -0.5,
  },
  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    position: 'relative',
  },
  barCol: {
    width: 22,
    alignItems: 'center',
  },
  bar: {
    width: 16,
    borderRadius: 6,
  },
  avgLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 0,
    borderTopWidth: 1.5,
    borderStyle: 'dashed',
    zIndex: 1,
  },
  avgChip: {
    position: 'absolute',
    right: 0,
    top: -10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  avgChipText: {
    color: '#FFFFFF',
    fontFamily: 'Inter_700Bold',
    fontSize: 9,
    letterSpacing: 0.5,
  },
  barLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginTop: 2,
  },
  barLabel: {
    width: 22,
    fontSize: 10,
    textAlign: 'center',
  },

  // Weekly hero
  weeklyHero: {
    alignItems: 'flex-start',
    paddingVertical: 4,
  },
  weeklyLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    letterSpacing: 1.4,
  },
  weeklyValue: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 36,
    letterSpacing: -1.5,
    marginTop: 4,
  },
  weeklyDelta: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    marginTop: 2,
  },

  // Ratio bar
  ratioBlock: {
    gap: 10,
  },
  ratioHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  ratioTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    letterSpacing: -0.2,
  },
  ratioTotal: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
  },
  ratioTrack: {
    height: 10,
    borderRadius: 5,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  ratioFill: {
    height: '100%',
  },
  ratioLegend: {
    flexDirection: 'row',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
  },
  legendValue: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
  },

  // Distraction-free card
  distractionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 2,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  distractionRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  distractionValue: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 22,
    letterSpacing: -0.5,
  },
  distractionTotal: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
  },
  distractionLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    marginTop: 1,
    marginBottom: 8,
  },
  distractionTrack: {
    height: 5,
    borderRadius: 2.5,
    overflow: 'hidden',
  },
  distractionFill: {
    height: '100%',
    borderRadius: 2.5,
  },
});
