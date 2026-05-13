import React, { useRef, useState } from 'react';
import { View, StyleSheet, PanResponder, Text } from 'react-native';

const THUMB = 28;
const TRACK_HEIGHT = 4;
const HIT_SLOP = { top: 12, bottom: 12, left: 12, right: 12 };

export default function RangeSlider({
  min,
  max,
  step = 1,
  value,
  onChange,
  colors,
}) {
  const [width, setWidth] = useState(0);

  // Refs hold the most recent values for use inside PanResponder closures
  // (which are created once on first render and otherwise see stale state).
  const widthRef = useRef(0);
  const minRef = useRef(min);
  const maxRef = useRef(max);
  const stepRef = useRef(step);
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  widthRef.current = width;
  minRef.current = min;
  maxRef.current = max;
  stepRef.current = step;
  valueRef.current = value;
  onChangeRef.current = onChange;

  const usableWidth = () => Math.max(0, widthRef.current - THUMB);

  const valueToPos = (v) => {
    const w = usableWidth();
    if (w <= 0) return 0;
    const ratio = (v - minRef.current) / (maxRef.current - minRef.current || 1);
    return Math.max(0, Math.min(1, ratio)) * w;
  };

  const posToValue = (p) => {
    const w = usableWidth();
    if (w <= 0) return minRef.current;
    const ratio = Math.max(0, Math.min(1, p / w));
    const raw = minRef.current + ratio * (maxRef.current - minRef.current);
    return Math.round(raw / stepRef.current) * stepRef.current;
  };

  const startRef = useRef([min, max]);

  const makePan = (which) =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => true,
      onPanResponderGrant: () => {
        startRef.current = [...valueRef.current];
      },
      onPanResponderMove: (_, gesture) => {
        if (usableWidth() <= 0) return;
        const [startLow, startHigh] = startRef.current;
        const [curLow, curHigh] = valueRef.current;
        if (which === 'low') {
          const startPos = valueToPos(startLow);
          const next = posToValue(startPos + gesture.dx);
          const clamped = Math.min(next, curHigh);
          if (clamped !== curLow) onChangeRef.current([clamped, curHigh]);
        } else {
          const startPos = valueToPos(startHigh);
          const next = posToValue(startPos + gesture.dx);
          const clamped = Math.max(next, curLow);
          if (clamped !== curHigh) onChangeRef.current([curLow, clamped]);
        }
      },
    });

  const lowPan = useRef(makePan('low')).current;
  const highPan = useRef(makePan('high')).current;

  const [low, high] = value;
  const lowPos = valueToPos(low);
  const highPos = valueToPos(high);

  return (
    <View
      style={styles.wrap}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
    >
      <View style={[styles.track, { backgroundColor: colors.border }]} />
      <View
        style={[
          styles.fill,
          {
            left: lowPos + THUMB / 2,
            width: Math.max(0, highPos - lowPos),
            backgroundColor: colors.primary,
          },
        ]}
      />

      <View
        hitSlop={HIT_SLOP}
        style={[
          styles.thumb,
          {
            left: lowPos,
            backgroundColor: colors.primary,
            borderColor: colors.cardBackground,
          },
        ]}
        {...lowPan.panHandlers}
      >
        <Text style={[styles.thumbLabel, { color: colors.textPrimary }]}>{low}</Text>
      </View>
      <View
        hitSlop={HIT_SLOP}
        style={[
          styles.thumb,
          {
            left: highPos,
            backgroundColor: colors.primary,
            borderColor: colors.cardBackground,
          },
        ]}
        {...highPan.panHandlers}
      >
        <Text style={[styles.thumbLabel, { color: colors.textPrimary }]}>{high}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: THUMB + 26,
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  track: {
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    marginHorizontal: THUMB / 2,
  },
  fill: {
    position: 'absolute',
    top: '50%',
    marginTop: -TRACK_HEIGHT / 2,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
  },
  thumb: {
    position: 'absolute',
    top: '50%',
    marginTop: -THUMB / 2,
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbLabel: {
    position: 'absolute',
    bottom: THUMB + 4,
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
});
