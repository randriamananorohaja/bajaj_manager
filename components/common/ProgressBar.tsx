import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

type Props = {
  progress: number; // 0-100
  height?: number;
  color?: string;
};

export function ProgressBar({ progress, height = 8, color = Colors.light.success }: Props) {
  const clamped = Math.min(100, Math.max(0, progress));
  return (
    <View style={[styles.track, { height, borderRadius: height / 2 }]}>
      <View
        style={[
          styles.fill,
          {
            width: `${clamped}%`,
            height,
            borderRadius: height / 2,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: Colors.light.progressBg,
    overflow: 'hidden',
    flex: 1,
  },
  fill: {},
});
