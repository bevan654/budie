import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import AppHeader from '../components/AppHeader';
import StudyTimer from '../components/study/StudyTimer';

export default function HomeFeedScreen() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader />

      <View style={styles.body}>
        <View style={styles.timerWrap}>
          <StudyTimer />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  timerWrap: {
    flex: 1,
  },
});
