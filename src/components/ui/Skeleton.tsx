import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  variant?: 'circle' | 'rect' | 'text';
  className?: string;
}

export function Skeleton({
  width = '100%',
  height = 20,
  variant = 'rect',
  className = '',
}: SkeletonProps) {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;
  const colors = useThemeColors();

  useEffect(() => {
    const pulse = Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 0.7,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 0.3,
        duration: 800,
        useNativeDriver: true,
      }),
    ]);

    Animated.loop(pulse).start();
  }, [pulseAnim]);

  let borderRadiusClass = 'rounded-xl';
  if (variant === 'circle') {
    borderRadiusClass = 'rounded-full';
  } else if (variant === 'text') {
    borderRadiusClass = 'rounded';
  }

  return (
    <Animated.View
      style={{
        width: typeof width === 'number' ? width : undefined,
        height: typeof height === 'number' ? height : undefined,
        backgroundColor: colors.border,
        opacity: pulseAnim,
      }}
      className={`${borderRadiusClass} ${className} ${
        typeof width === 'string' ? `w-${width}` : ''
      } ${typeof height === 'string' ? `h-${height}` : ''}`}
    />
  );
}
