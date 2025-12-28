import React, { useCallback } from 'react';
import { useRouter, usePathname } from 'expo-router';
import { useActiveWorkout } from '../../providers/ActiveWorkoutProvider';
import { useUITheme, RaisedButton } from '@mysuite/ui';
import { IconSymbol } from './icon-symbol';

export function useBackButtonAction() {
    const router = useRouter();
    const pathname = usePathname();
    const { startWorkout, isExpanded, setExpanded } = useActiveWorkout();

    const handleBack = useCallback(() => {
        // Special handling for End Workout screen
        if (pathname === '/workouts/end') {
            startWorkout(); // Resumes and maximizes
            router.back();
            return;
        }

        // If Active Workout Overlay is expanded, collapse it instead of navigating back
        if (isExpanded) {
            setExpanded(false);
            return;
        }

        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace('/');
        }
    }, [pathname, isExpanded, setExpanded, startWorkout, router]);

    return { handleBack };
}

export function BackButton() {
    const theme = useUITheme();
    const { handleBack } = useBackButtonAction();

    return (
        <RaisedButton
            onPress={handleBack}
            className="w-10 h-10 p-0 rounded-full items-center justify-center"
            borderRadius={20}
        >
            <IconSymbol
                name="chevron.left"
                size={20}
                color={theme.primary}
            />
        </RaisedButton>
    );
}
