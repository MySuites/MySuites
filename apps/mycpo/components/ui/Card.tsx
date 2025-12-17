import React from 'react';
import { View, TouchableOpacity, ViewProps, TouchableOpacityProps } from 'react-native';

interface CardProps extends ViewProps {
  onPress?: () => void;
  activeOpacity?: number;
}

export function Card({ children, style, className, onPress, activeOpacity = 0.9, ...props }: CardProps) {
  // Base styling from RoutineCard
  // bg-surface dark:bg-surface_dark rounded-xl p-4 w-full mb-3 border border-black/5 dark:border-white/10 shadow-sm
  const baseClassName = `bg-surface dark:bg-surface_dark rounded-xl p-4 w-full mb-3 border border-black/5 dark:border-white/10 shadow-sm ${className || ''}`;

  if (onPress) {
    return (
      <TouchableOpacity 
        style={style} 
        className={baseClassName} 
        onPress={onPress} 
        activeOpacity={activeOpacity}
        {...(props as TouchableOpacityProps)}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={style} className={baseClassName} {...props}>
      {children}
    </View>
  );
}
