import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';

export default function BlurredImage({ imageUri, isBlurred, style }) {
  return (
    <View style={[styles.container, style]}>
      <Image
        source={{ uri: imageUri || 'https://via.placeholder.com/400' }}
        style={styles.image}
      />
      {isBlurred && (
        <BlurView intensity={50} tint="light" style={styles.blur} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  blur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
