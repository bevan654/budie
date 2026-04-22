import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import { spacing, borderRadius } from '../constants/theme';

export default function SwipeCard({ profile, onPress }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [imageLoaded, setImageLoaded] = useState(false);

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
        colors={['transparent', 'rgba(0,0,0,0.02)', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.85)']}
        locations={[0, 0.35, 0.65, 1]}
        style={styles.gradient}
      />
      <View style={styles.infoContainer}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.age}>{profile.age}</Text>
        </View>
        <Text style={styles.pronouns}>{profile.pronouns}</Text>

        <View style={styles.detailsRow}>
          <Text style={styles.detailText}>{profile.course}</Text>
          <View style={styles.dotSeparator} />
          <Text style={styles.detailText}>Year {profile.course_year}</Text>
        </View>

        <View style={styles.tagsRow}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{profile.study_time}</Text>
          </View>
          <View style={[styles.tag, styles.moodTag]}>
            <Text style={styles.moodTagText}>{profile.current_mood}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (colors) => StyleSheet.create({
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
  infoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.xl,
    paddingBottom: 110,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  name: {
    fontSize: 26,
    fontFamily: 'Inter_700Bold',
    color: colors.white,
    letterSpacing: -0.2,
  },
  age: {
    fontSize: 20,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.8)',
  },
  pronouns: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.55)',
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
    marginBottom: spacing.md,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  detailText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    fontFamily: 'Inter_500Medium',
  },
  dotSeparator: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255,255,255,0.35)',
    marginHorizontal: spacing.sm,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.sm,
  },
  tagText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: 'rgba(255,255,255,0.85)',
  },
  moodTag: {
    backgroundColor: `${colors.primary}73`,
  },
  moodTagText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: colors.white,
  },
});
