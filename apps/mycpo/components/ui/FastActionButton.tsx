import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useUITheme } from '@mycsuite/ui';
import { useRouter, usePathname } from 'expo-router';
import { IconSymbol } from './icon-symbol';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

// Configuration
const BUTTON_SIZE = 60;
const MENU_RADIUS = 100;
const ACTIVATION_DELAY = 150; // ms to hold before activating

type MenuItemType = {
  id: string;
  icon: string;
  label: string;
  route: string;
  angle: number; // in degrees, 0 is up, -90 left, 90 right
  matchPaths: string[]; // Paths that match this item
};

const MENU_ITEMS: MenuItemType[] = [
  { 
      id: 'profile', 
      icon: 'person.fill', 
      label: 'Profile', 
      route: '/(tabs)/profile', 
      angle: -45, 
      matchPaths: ['/profile', '/(tabs)/profile'] 
  },
  { 
      id: 'home', 
      icon: 'house.fill', 
      label: 'Home', 
      route: '/(tabs)', 
      angle: 0,
      matchPaths: ['/', '/index', '/(tabs)', '/(tabs)/index']
  },
  { 
      id: 'workout', 
      icon: 'dumbbell.fill', 
      label: 'Workout', 
      route: '/(tabs)/workout', 
      angle: 45,
      matchPaths: ['/workout', '/(tabs)/workout'] 
  },
];

export function FastActionButton() {
  const theme = useUITheme();
  const router = useRouter();
  const pathname = usePathname();

  // Determine active icon
  const activeItem = MENU_ITEMS.find(item => item.matchPaths.some(p => pathname === p || pathname.startsWith(p + '/'))) || MENU_ITEMS[1];
  const activeIcon = activeItem.icon;

  // Animation values
  const isOpen = useSharedValue(0); // 0: closed, 1: open
  const scale = useSharedValue(1);
  const selectedItemIndex = useSharedValue(-1);

  // Haptics helper
  const triggerHaptic = (style: Haptics.ImpactFeedbackStyle) => {
    Haptics.impactAsync(style);
  };

  // Helper for router
  const navigateTo = (route: string) => {
      router.push(route as any);
  };

  // Styles
  const buttonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      backgroundColor: theme.primary,
      shadowColor: theme.primary,
      shadowOpacity: isOpen.value * 0.5,
      shadowRadius: 10,
    };
  });

  const overlayStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isOpen.value * 0.8, { duration: 200 }),
      pointerEvents: isOpen.value > 0.5 ? 'auto' : 'none',
    };
  });

  const handleSelection = (index: number) => {
    if (index === -1) return;
    const item = MENU_ITEMS[index];
    if (item) {
      navigateTo(item.route);
    }
  };

  // Gesture
  const gesture = Gesture.Pan()
    .activateAfterLongPress(ACTIVATION_DELAY)
    .onStart(() => {
      isOpen.value = withSpring(1);
      scale.value = withSpring(1.2);
      runOnJS(triggerHaptic)(Haptics.ImpactFeedbackStyle.Medium);
    })
    .onUpdate((e) => {
      // Calculate logic for selection
      // We need to map touch position to the nearest menu item
      const x = e.translationX;
      const y = e.translationY;
      
      let bestIndex = -1;
      
      // Calculate angle
        // Math.atan2(y, x) returns radians. 
        // -PI (left) to PI (right), -PI/2 is top
        const angleRad = Math.atan2(y, x);
        const angleDeg = angleRad * (180 / Math.PI);
        // Convert to our 0-up system:
        // standard: 0 is right, -90 top, 90 bottom, 180 left
        // target: 0 is top. 
        // effectively rotate by +90 to align "up" (-90 normal) to 0
        const effectiveAngle = angleDeg + 90;

      for (let i = 0; i < MENU_ITEMS.length; i++) {
        // Simple angle check
        const itemAngle = MENU_ITEMS[i].angle;
        // Normalize angle diff
        let diff = Math.abs(effectiveAngle - itemAngle);
        if (diff > 180) diff = 360 - diff;
        
        // Distance check
        const dist = Math.sqrt(x*x + y*y);

        // Logic: Must be close to the angle AND dragged out at least a bit
        if (dist > 30 && diff < 30) { 
            bestIndex = i;
        }
      }

      if (selectedItemIndex.value !== bestIndex) {
         if (bestIndex !== -1) {
             runOnJS(triggerHaptic)(Haptics.ImpactFeedbackStyle.Light);
         }
         selectedItemIndex.value = bestIndex;
      }
    })
    .onEnd(() => {
      isOpen.value = withSpring(0);
      scale.value = withSpring(1);
      if (selectedItemIndex.value !== -1) {
        runOnJS(handleSelection)(selectedItemIndex.value);
      }
      selectedItemIndex.value = -1;
    });
    
  const tapGesture = Gesture.Tap().onEnd(() => {
     // Default tap action - go to home
     runOnJS(navigateTo)('/(tabs)');
  });

  const composedGesture = Gesture.Race(gesture, tapGesture);

  // Unrolled animation styles for the 3 items to ensure SharedValue reactivity
  const item0Style = useAnimatedStyle(() => {
     const angleRad = (MENU_ITEMS[0].angle - 90) * (Math.PI / 180);
     const progress = isOpen.value;
     const isSelected = selectedItemIndex.value === 0;
     const translateX = progress * MENU_RADIUS * Math.cos(angleRad);
     const translateY = progress * MENU_RADIUS * Math.sin(angleRad);
     return {
        transform: [{ translateX }, { translateY }, { scale: progress * (isSelected ? 1.5 : 1) }],
        opacity: progress,
        zIndex: 2000,
     };
  });

  const item1Style = useAnimatedStyle(() => {
     const angleRad = (MENU_ITEMS[1].angle - 90) * (Math.PI / 180);
     const progress = isOpen.value;
     const isSelected = selectedItemIndex.value === 1;
     const translateX = progress * MENU_RADIUS * Math.cos(angleRad);
     const translateY = progress * MENU_RADIUS * Math.sin(angleRad);
     return {
        transform: [{ translateX }, { translateY }, { scale: progress * (isSelected ? 1.5 : 1) }],
        opacity: progress,
        zIndex: 2000,
     };
  });

  const item2Style = useAnimatedStyle(() => {
     const angleRad = (MENU_ITEMS[2].angle - 90) * (Math.PI / 180);
     const progress = isOpen.value;
     const isSelected = selectedItemIndex.value === 2;
     const translateX = progress * MENU_RADIUS * Math.cos(angleRad);
     const translateY = progress * MENU_RADIUS * Math.sin(angleRad);
     return {
        transform: [{ translateX }, { translateY }, { scale: progress * (isSelected ? 1.5 : 1) }],
        opacity: progress,
        zIndex: 2000,
     };
  });

  return (
    <View style={styles.container} pointerEvents="box-none">
       {/* Dark overlay */}
      <Animated.View style={[styles.overlay, overlayStyle, { backgroundColor: theme.background }]} />

      {/* Menu Options - Manually Rendered */}
      <Animated.View style={[styles.menuItem, item0Style]}>
          <View style={[styles.menuItemCircle, { backgroundColor: theme.surface }]}>
            <IconSymbol name={MENU_ITEMS[0].icon as any} size={24} color={theme.text} />
          </View>
          <Animated.Text style={[styles.label, { color: theme.text }]}>{MENU_ITEMS[0].label}</Animated.Text>
      </Animated.View>

      <Animated.View style={[styles.menuItem, item1Style]}>
          <View style={[styles.menuItemCircle, { backgroundColor: theme.surface }]}>
            <IconSymbol name={MENU_ITEMS[1].icon as any} size={24} color={theme.text} />
          </View>
          <Animated.Text style={[styles.label, { color: theme.text }]}>{MENU_ITEMS[1].label}</Animated.Text>
      </Animated.View>

      <Animated.View style={[styles.menuItem, item2Style]}>
          <View style={[styles.menuItemCircle, { backgroundColor: theme.surface }]}>
            <IconSymbol name={MENU_ITEMS[2].icon as any} size={24} color={theme.text} />
          </View>
          <Animated.Text style={[styles.label, { color: theme.text }]}>{MENU_ITEMS[2].label}</Animated.Text>
      </Animated.View>

      <GestureDetector gesture={composedGesture}>
        <Animated.View testID="fast-action-button" style={[styles.fab, buttonStyle]}>
          <IconSymbol name={activeIcon as any} size={30} color="#fff" />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 300, 
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 40,
    zIndex: 1000,
    pointerEvents: 'box-none',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    top: -500, 
  },
  fab: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1001,
    elevation: 6,
  },
  menuItem: {
    position: 'absolute',
    bottom: 40 + BUTTON_SIZE / 2 - 20, 
    left: width / 2 - 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2002, 
    elevation: 20,
  },
  menuItemCircle: {
      width: 50,
      height: 50,
      borderRadius: 25,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
  },
  label: {
      position: 'absolute',
      bottom: -20,
      fontSize: 12,
      fontWeight: '600',
      width: 100,
      textAlign: 'center',
  }
});
