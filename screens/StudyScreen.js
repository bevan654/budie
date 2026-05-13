import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import AppHeader from '../components/AppHeader';
import StatsGrid from '../components/study/StatsGrid';
import Leaderboard from '../components/study/Leaderboard';

export default function StudyScreen() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader subtitle="Focus. Track. Level up." />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Stats
            </Text>
            <Text style={[styles.sectionHint, { color: colors.textTertiary }]}>
              Last 7 days
            </Text>
          </View>
          <StatsGrid />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Leaderboard
            </Text>
            <Text style={[styles.sectionHint, { color: colors.textTertiary }]}>
              This week
            </Text>
          </View>
          <Leaderboard />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    gap: 24,
  },
  section: {
    gap: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    letterSpacing: -0.3,
  },
  sectionHint: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
  },
});
