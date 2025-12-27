import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, LayoutChangeEvent, Platform } from 'react-native';
import { useThemePreference } from '../../providers/AppThemeProvider';
import { IconSymbol } from './icon-symbol';
import { RaisedButton } from '@mysuite/ui';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';

export const ThemeToggle = () => {
  const { preference, setPreference } = useThemePreference();
  const [containerWidth, setContainerWidth] = useState(0);
  
  // Border widths from className
  const BORDER_LEFT = 3;
  const BORDER_RIGHT = 1;

  // Padding values from className (pl-1=4, pr-1.5=6, pt-1=4, pb-1.5=6)
  const PADDING_LEFT = 4;
  const PADDING_RIGHT = 6;
  const PADDING_TOP = 0;
  const PADDING_BOTTOM = 0;
  
  const TOTAL_HORIZONTAL_CHROME = BORDER_LEFT + BORDER_RIGHT + PADDING_LEFT + PADDING_RIGHT;
  
  const translateX = useSharedValue(0);
  
  const handleLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  };
  
  const slideWidth = containerWidth > 0 ? (containerWidth - TOTAL_HORIZONTAL_CHROME) / 2 : 0;

  useEffect(() => {
    if (slideWidth === 0) return;
    
    const targetX = preference === 'light' ? 0 : slideWidth;
    
    translateX.value = withTiming(targetX, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    });
  }, [preference, slideWidth, translateX]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
      width: slideWidth,
    };
  });

  return (
    <View 
      className="flex-row items-center my-3 pl-1 pr-1.5 pt-1 pb-1.5 h-12 w-full rounded-full bg-gray-100 dark:bg-dark-darker border-t-[3px] border-l-[3px] border-b-[1px] border-r-[1px] border-t-gray-300 border-l-gray-300 border-b-white border-r-white dark:border-t-black/60 dark:border-l-black/60 dark:border-b-white/10 dark:border-r-white/10"
      onLayout={handleLayout}
    >
      {/* Sliding Background Pill */}
      {containerWidth > 0 && (
        <Animated.View style={[
          animatedStyle, 
          { 
            top: PADDING_TOP, 
            bottom: PADDING_BOTTOM, 
            left: PADDING_LEFT, 
            zIndex: 0 
          }
        ]}>
           <RaisedButton
            className="w-full h-full"
            style={{ margin: 0 }} 
            borderRadius={9999}
            onPress={() => {}}
            disabled={true}
          >
           {/* Empty children */}
            <View /> 
          </RaisedButton>
        </Animated.View>
      )}

      {/* Interactive Layer */}
      <View className={`absolute ${Platform.OS === 'web' ? 'top-0' : 'top-1'} flex-row w-full h-full z-10`}>
        <TouchableOpacity
            onPress={() => setPreference('light')}
            className="flex-1 items-center justify-center bg-transparent"
            activeOpacity={0.8}
        >
            <IconSymbol 
                name="sun.max.fill" 
                size={20} 
                color={preference === 'light' ? 'black' : '#6b7280'} 
            />
        </TouchableOpacity>
        
        <TouchableOpacity
            onPress={() => setPreference('dark')}
            className="flex-1 items-center justify-center bg-transparent"
            activeOpacity={0.8}
        >
            <IconSymbol 
                name="moon.fill" 
                size={20} 
                color={preference === 'dark' ? 'white' : '#6b7280'}
            />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ThemeToggle;
