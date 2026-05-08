import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { spacing, borderRadius } from '../constants/theme';
// Placeholder until profiles carry real streak / rank data
const RANK_EMOJIS = ['🥉', '🥈', '🥇', '💎', '👑'];

function placeholderProfileMeta(profile) {
  const seedSrc = String(profile?.id ?? profile?.name ?? '');
  let seed = 0;
  for (let i = 0; i < seedSrc.length; i++) seed = (seed * 31 + seedSrc.charCodeAt(i)) >>> 0;
  const days = (seed % 28) + 1;          // 1..28
  const hoursTenths = (seed % 60) + 5;   // 0.5..6.4 hours
  const rank = RANK_EMOJIS[seed % RANK_EMOJIS.length];
  return { days, avgHours: hoursTenths / 10, rank };
}

export default function SwipeCard({ profile, onPress }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [imageLoaded, setImageLoaded] = useState(false);
  const meta = placeholderProfileMeta(profile);

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
        <View style={styles.detailsRow}>
          <Text style={styles.detailText}>{profile.course}</Text>
          <View style={styles.dotSeparator} />
          <Text style={styles.detailText}>Year {profile.course_year}</Text>
        </View>
        <View style={styles.tagsRow}>
          <View style={styles.metaPill}>
            <Ionicons name="flame" size={12} color="#FFB347" />
            <Text style={styles.metaNumber}>{meta.days}</Text>
            <View style={styles.metaSep} />
            <Text style={styles.metaRank}>{meta.rank}</Text>
          </View>
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
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  metaNumber: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  metaSep: {
    width: 1,
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 1,
  },
  metaRank: {
    fontSize: 13,
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
