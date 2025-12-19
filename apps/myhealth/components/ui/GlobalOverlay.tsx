import React from 'react';
import { Platform, View } from 'react-native';
import { FullWindowOverlay } from 'react-native-screens';

export function GlobalOverlay({ children }: { children: React.ReactNode }) {
  if (Platform.OS === 'ios') {
    return (
      <FullWindowOverlay>
        <View className="absolute inset-0 bg-transparent" pointerEvents="box-none">
          {children}
        </View>
      </FullWindowOverlay>
    );
  }

  return (
    <View className="absolute inset-0 bg-transparent" pointerEvents="box-none">
        {children}
    </View>
  );
}
