import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { TIERS, getTier, MAX_FREEZES } from '../utils/streakTiers';

// Placeholder streak data — replace with real hook later
const PLACEHOLDER_PERSONAL = { days: 7, avgHours: 1.5, freezesUsed: 0 };
const PLACEHOLDER_BUDDY = { days: 4, avgHours: 2.5, freezesUsed: 1 };

function StreakChip({ icon, days, avgHours, freezesUsed, onPress }) {
  const tier = getTier(avgHours) || TIERS.COLD;
  const hasAura = freezesUsed === 0;

  const auraStyle = hasAura
    ? {
        shadowColor: tier.glow,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.55,
        shadowRadius: 8,
        elevation: 6,
      }
    : null;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.chip, auraStyle]}
    >
      <Ionicons name={icon} size={14} color={tier.color} />
      <Text style={[styles.chipNumber, { color: tier.color }]}>{days}</Text>
    </TouchableOpacity>
  );
}

function StreakDetail({ title, subtitle, icon, days, avgHours, freezesUsed }) {
  const { colors } = useTheme();
  const tier = getTier(avgHours) || TIERS.COLD;
  const hasAura = freezesUsed === 0;
  const remaining = MAX_FREEZES - freezesUsed;

  return (
    <View
      style={[
        detailStyles.card,
        {
          backgroundColor: colors.backgroundSecondary,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={detailStyles.headerRow}>
        <View style={[detailStyles.iconWrap, hasAura && {
          shadowColor: tier.glow,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.6,
          shadowRadius: 10,
          elevation: 8,
        }]}>
          <Ionicons name={icon} size={28} color={tier.color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[detailStyles.title, { color: colors.textPrimary }]}>{title}</Text>
          <Text style={[detailStyles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
        </View>
        <Text style={[detailStyles.days, { color: tier.color }]}>{days}</Text>
      </View>

      <View style={detailStyles.row}>
        <View style={[detailStyles.tierPill, { backgroundColor: tier.color + '22' }]}>
          <View style={[detailStyles.tierDot, { backgroundColor: tier.color }]} />
          <Text style={[detailStyles.tierName, { color: tier.color }]}>
            {tier.name}
          </Text>
        </View>
        <Text style={[detailStyles.metaText, { color: colors.textSecondary }]}>
          {avgHours.toFixed(1)}h / day average
        </Text>
      </View>

      <View style={[detailStyles.divider, { backgroundColor: colors.border }]} />

      <View style={detailStyles.row}>
        <Text style={[detailStyles.label, { color: colors.textSecondary }]}>Freezes</Text>
        <View style={detailStyles.freezeRow}>
          {Array.from({ length: MAX_FREEZES }).map((_, i) => {
            const used = i >= remaining;
            return (
              <View
                key={i}
                style={[
                  detailStyles.freezeDot,
                  {
                    backgroundColor: used ? 'transparent' : '#06B6D4',
                    borderColor: used ? colors.borderDark : '#06B6D4',
                  },
                ]}
              >
                <Ionicons
                  name="snow"
                  size={10}
                  color={used ? colors.textTertiary : '#FFFFFF'}
                />
              </View>
            );
          })}
          <Text style={[detailStyles.freezeCount, { color: colors.textPrimary }]}>
            {remaining} of {MAX_FREEZES}
          </Text>
        </View>
      </View>

      <View style={detailStyles.row}>
        <Text style={[detailStyles.label, { color: colors.textSecondary }]}>Aura</Text>
        {hasAura ? (
          <View style={[detailStyles.auraPill, { backgroundColor: tier.color + '22' }]}>
            <Ionicons name="sparkles" size={12} color={tier.color} />
            <Text style={[detailStyles.auraText, { color: tier.color }]}>Active</Text>
          </View>
        ) : (
          <Text style={[detailStyles.auraGone, { color: colors.textTertiary }]}>
            Lost — used a freeze
          </Text>
        )}
      </View>

      <Text style={[detailStyles.hint, { color: colors.textTertiary }]}>
        New freeze in 25 days · Aura returns when streak is unbroken
      </Text>
    </View>
  );
}

export default function AppHeader({ right }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [detailOpen, setDetailOpen] = useState(false);

  const open = () => setDetailOpen(true);
  const close = () => setDetailOpen(false);

  return (
    <>
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top + 8,
            backgroundColor: colors.cardBackground,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.row}>
          <View style={styles.brandWrap}>
            <Text style={[styles.brand, { color: colors.primary }]}>budie</Text>
            <View style={[styles.brandDot, { backgroundColor: colors.primary }]} />
          </View>

          <View style={styles.right}>
            {right}
            <View style={styles.streaksRow}>
              <StreakChip
                icon="flame"
                days={PLACEHOLDER_PERSONAL.days}
                avgHours={PLACEHOLDER_PERSONAL.avgHours}
                freezesUsed={PLACEHOLDER_PERSONAL.freezesUsed}
                onPress={open}
              />
              <StreakChip
                icon="people"
                days={PLACEHOLDER_BUDDY.days}
                avgHours={PLACEHOLDER_BUDDY.avgHours}
                freezesUsed={PLACEHOLDER_BUDDY.freezesUsed}
                onPress={open}
              />
            </View>
          </View>
        </View>
      </View>

      <Modal
        visible={detailOpen}
        transparent
        animationType="slide"
        onRequestClose={close}
        statusBarTranslucent
      >
        <Pressable style={detailStyles.backdrop} onPress={close}>
          <Pressable
            style={[
              detailStyles.sheet,
              { backgroundColor: colors.cardBackground, borderColor: colors.border },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={[detailStyles.handle, { backgroundColor: colors.border }]} />
            <Text style={[detailStyles.sheetTitle, { color: colors.textPrimary }]}>
              Streaks
            </Text>
            <Text style={[detailStyles.sheetSubtitle, { color: colors.textSecondary }]}>
              Tier shifts with your daily average
            </Text>

            <View style={detailStyles.cards}>
              <StreakDetail
                title="Personal"
                subtitle="Your solo + partner study"
                icon="flame"
                days={PLACEHOLDER_PERSONAL.days}
                avgHours={PLACEHOLDER_PERSONAL.avgHours}
                freezesUsed={PLACEHOLDER_PERSONAL.freezesUsed}
              />
              <StreakDetail
                title="Buddy"
                subtitle="Days you studied with mates"
                icon="people"
                days={PLACEHOLDER_BUDDY.days}
                avgHours={PLACEHOLDER_BUDDY.avgHours}
                freezesUsed={PLACEHOLDER_BUDDY.freezesUsed}
              />
            </View>

            <View style={[detailStyles.legendRow, { borderTopColor: colors.border }]}>
              <Text style={[detailStyles.legendLabel, { color: colors.textTertiary }]}>
                TIERS
              </Text>
              <View style={detailStyles.legendItems}>
                {Object.values(TIERS).map((t) => (
                  <View key={t.key} style={detailStyles.legendItem}>
                    <View
                      style={[
                        detailStyles.legendDot,
                        { backgroundColor: t.color },
                      ]}
                    />
                    <Text
                      style={[detailStyles.legendName, { color: colors.textSecondary }]}
                    >
                      {t.name}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 36,
  },
  brandWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  brand: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 26,
    letterSpacing: -1,
    lineHeight: 28,
  },
  brandDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 3,
    marginBottom: 5,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streaksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.001)',
  },
  chipNumber: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 14,
    letterSpacing: -0.2,
  },
});

const detailStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 28,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 14,
  },
  sheetTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    letterSpacing: -0.5,
  },
  sheetSubtitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    marginTop: 2,
    marginBottom: 16,
  },
  cards: {
    gap: 12,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    marginTop: 1,
  },
  days: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 32,
    letterSpacing: -1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tierPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  tierDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  tierName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  metaText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
  },
  divider: {
    height: 1,
    marginVertical: 2,
  },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
  },
  freezeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  freezeDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  freezeCount: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    marginLeft: 4,
  },
  auraPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  auraText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  auraGone: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
  },
  hint: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
  legendRow: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  legendLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendName: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
  },
});
