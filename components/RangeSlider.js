import React, { useRef, useState, useCallback } from 'react';
import { View, StyleSheet, PanResponder, Text } from 'react-native';

const THUMB = 26;
const TRACK_HEIGHT = 4;

export default function RangeSlider({
  min,
  max,
  step = 1,
  value,
  onChange,
  colors,
}) {
  const [width, setWidth] = useState(0);
  const [low, high] = value;

  const valueToPos = useCallback(
    (v) => {
      if (width <= 0) return 0;
      const ratio = (v - min) / (max - min || 1);
      return Math.max(0, Math.min(1, ratio)) * (width - THUMB);
    },
    [width, min, max]
  );

  const posToValue = useCallback(
    (p) => {
      if (width <= 0) return min;
      const ratio = Math.max(0, Math.min(1, p / (width - THUMB)));
      const raw = min + ratio * (max - min);
      return Math.round(raw / step) * step;
    },
    [width, min, max, step]
  );

  // Refs to keep latest values inside PanResponder
  const lowRef = useRef(low);
  const highRef = useRef(high);
  lowRef.current = low;
  highRef.current = high;
  const startRef = useRef({ low: low, high: high });

  const makePan = (which) =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        startRef.current = { low: lowRef.current, high: highRef.current };
      },
      onPanResponderMove: (_, gesture) => {
        if (width <= 0) return;
        const startVal = which === 'low' ? startRef.current.low : startRef.current.high;
        const startPos = valueToPos(startVal);
        const next = posToValue(startPos + gesture.dx);
        if (which === 'low') {
          const clamped = Math.min(next, highRef.current);
          if (clamped !== lowRef.current) onChange([clamped, highRef.current]);
        } else {
          const clamped = Math.max(next, lowRef.current);
          if (clamped !== highRef.current) onChange([lowRef.current, clamped]);
        }
      },
    });

  const lowPan = useRef(makePan('low')).current;
  const highPan = useRef(makePan('high')).current;

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
    height: THUMB + 22,
    justifyContent: 'center',
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
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 3,
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
