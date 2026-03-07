import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function SkeletonBlock({ width, height, borderRadius = 8, style }) {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.imagePlaceholder,
          opacity,
        },
        style,
      ]}
    />
  );
}

function Card() {
  const { colors } = useTheme();
  return (
    <View style={[cardStyles.container, { backgroundColor: colors.cardBackground }]}>
      <SkeletonBlock width="100%" height={360} borderRadius={16} />
      <View style={cardStyles.content}>
        <SkeletonBlock width="60%" height={24} borderRadius={6} />
        <SkeletonBlock width="40%" height={16} borderRadius={6} style={{ marginTop: 10 }} />
        <View style={cardStyles.tags}>
          <SkeletonBlock width={80} height={28} borderRadius={14} />
          <SkeletonBlock width={60} height={28} borderRadius={14} />
          <SkeletonBlock width={70} height={28} borderRadius={14} />
        </View>
      </View>
    </View>
  );
}

function ChatRow() {
  return (
    <View style={chatStyles.row}>
      <SkeletonBlock width={52} height={52} borderRadius={26} />
      <View style={chatStyles.content}>
        <SkeletonBlock width="50%" height={16} borderRadius={4} />
        <SkeletonBlock width="75%" height={14} borderRadius={4} style={{ marginTop: 8 }} />
      </View>
      <SkeletonBlock width={40} height={12} borderRadius={4} />
    </View>
  );
}

function ChatRowList() {
  return (
    <View style={chatStyles.list}>
      {[1, 2, 3, 4, 5].map(i => (
        <ChatRow key={i} />
      ))}
    </View>
  );
}

function ProfileGrid() {
  const itemWidth = (SCREEN_WIDTH - 48 - 12) / 2;
  return (
    <View style={gridStyles.container}>
      {[1, 2, 3, 4, 5, 6].map(i => (
        <View key={i} style={gridStyles.item}>
          <SkeletonBlock width={itemWidth} height={itemWidth * 1.2} borderRadius={12} />
          <SkeletonBlock width="70%" height={14} borderRadius={4} style={{ marginTop: 8 }} />
          <SkeletonBlock width="50%" height={12} borderRadius={4} style={{ marginTop: 4 }} />
        </View>
      ))}
    </View>
  );
}

const SkeletonLoader = Object.assign(SkeletonBlock, {
  Card,
  ChatRow: ChatRowList,
  ProfileGrid,
});

export default SkeletonLoader;

const cardStyles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    marginHorizontal: 16,
  },
  content: {
    padding: 16,
  },
  tags: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
});

const chatStyles = StyleSheet.create({
  list: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 14,
  },
  content: {
    flex: 1,
  },
});

const gridStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    gap: 12,
    paddingTop: 12,
  },
  item: {
    marginBottom: 12,
  },
});
