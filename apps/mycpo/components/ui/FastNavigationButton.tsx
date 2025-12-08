import React, { useMemo, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { useUITheme } from '@mycsuite/ui';
import { useRouter, usePathname } from 'expo-router';
import { RadialMenu, RadialMenuItem } from './RadialMenu';
import { useFloatingButton } from './FloatingButtonContext';

// Configuration
const BUTTON_SIZE = 60;

// Configuration for matching paths to icons
const PATH_CONFIG = [
    { match: ['/profile', '/(tabs)/profile'], icon: 'person.fill' },
    { match: ['/', '/index', '/(tabs)', '/(tabs)/index'], icon: 'house.fill' },
    { match: ['/workout', '/(tabs)/workout'], icon: 'dumbbell.fill' },
];

export function FastNavigationButton() {
  const theme = useUITheme();
  const router = useRouter();
  const pathname = usePathname();
  const { activeButtonId, setActiveButtonId } = useFloatingButton();

  // Determine active icon based on current path
  const activeIcon = useMemo(() => {
     const found = PATH_CONFIG.find(c => c.match.some(m => pathname === m || pathname.startsWith(m + '/')));
     return found ? found.icon : 'house.fill';
  }, [pathname]);

  const navigateTo = React.useCallback((route: string) => {
      router.push(route as any);
  }, [router]);

  // Define menu items with explicit angles
  const menuItems: RadialMenuItem[] = useMemo(() => [
    { id: 'profile', icon: 'person.fill', label: 'Profile', onPress: () => navigateTo('/(tabs)/profile'), angle: -45 },
    { id: 'home', icon: 'house.fill', label: 'Home', onPress: () => navigateTo('/(tabs)'), angle: 0 },
    { id: 'workout', icon: 'dumbbell.fill', label: 'Workout', onPress: () => navigateTo('/(tabs)/workout'), angle: 45 },
  ], [navigateTo]);

  // Handle visibility animation
  const containerAnimatedStyle = useAnimatedStyle(() => {
      // If the OTHER button (action) is active, slide out to the LEFT
      const shouldHide = activeButtonId === 'action';
      return {
          transform: [
              { translateX: withSpring(shouldHide ? -150 : 0) } 
          ],
          opacity: withTiming(shouldHide ? 0 : 1)
      };
  });

  const handleMenuStateChange = (isOpen: boolean) => {
      console.log('NavButton: Menu State Changed:', isOpen);
      if (isOpen) {
          setActiveButtonId('nav');
      } else if (activeButtonId === 'nav') { // Only clear if we were the owner
          setActiveButtonId(null);
      }
  };

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle]} pointerEvents="box-none">
       <RadialMenu 
         items={menuItems} 
         icon={activeIcon} 
         menuRadius={100}
         style={{ backgroundColor: theme.primary }} 
         buttonSize={BUTTON_SIZE}
         onMenuStateChange={handleMenuStateChange}
       />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0, // Note: This stretches the container, so translateX affects the whole bar implicitly? 
    // Wait, RadialMenu is centered in this container (alignItems: center).
    // If we translate THIS container, the whole bottom bar moves?
    // Let's refine style to wrap just the button area if needed, but for now this moves the button.
    height: 150, 
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 40,
    zIndex: 1000,
    pointerEvents: 'box-none',
    overflow: 'visible',
  },
});
