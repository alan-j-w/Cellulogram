import React from 'react';
import { 
  View, 
  TouchableOpacity, 
  ViewProps, 
  TouchableOpacityProps 
} from 'react-native';

interface CardProps extends ViewProps {
  onPress?: () => void;
  className?: string;
  children: React.ReactNode;
}

export function Card({
  onPress,
  className = '',
  children,
  ...props
}: CardProps) {
  
  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        className={`bg-card border border-border rounded-2xl p-4 shadow-xl ${className}`}
        {...(props as TouchableOpacityProps)}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View
      className={`bg-card border border-border rounded-2xl p-4 shadow-xl ${className}`}
      {...props}
    >
      {children}
    </View>
  );
}
