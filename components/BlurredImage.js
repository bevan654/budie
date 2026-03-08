import React from 'react';
import { View } from 'tamagui';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';

export default function BlurredImage({ uri, blurred, style }) {
  return (
    <View overflow="hidden" {...style}>
      <Image
        source={{ uri: uri || 'https://via.placeholder.com/400' }}
        style={{ width: '100%', height: '100%' }}
        contentFit="cover"
        transition={200}
      />
      {blurred && (
        <BlurView
          intensity={50}
          tint="light"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />
      )}
    </View>
  );
}
