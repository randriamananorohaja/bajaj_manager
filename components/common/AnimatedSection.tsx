import React from 'react';
import { MotiView } from 'moti';
import { ViewStyle } from 'react-native';

type Props = {
  children: React.ReactNode;
  delay?: number;
  index?: number;
  style?: ViewStyle;
};

/** Fade + slide up animation for sections and list items */
export function AnimatedSection({ children, delay = 0, index = 0, style }: Props) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 18 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        type: 'timing',
        duration: 420,
        delay: delay + index * 60,
      }}
      style={style}
    >
      {children}
    </MotiView>
  );
}

/** Scale-in animation for cards / stats */
export function AnimatedCard({ children, delay = 0, index = 0, style }: Props) {
  return (
    <MotiView
      from={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: 'spring',
        damping: 16,
        stiffness: 120,
        delay: delay + index * 70,
      }}
      style={style}
    >
      {children}
    </MotiView>
  );
}
