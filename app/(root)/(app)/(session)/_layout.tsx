// ./app/(app)/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';
import InterText from '@/components/InterText';
import SessionIcon from '@/assets/svg/SessionIcon.svg';

export default function SessionLayout() {
    // Render the child route within the authenticated group (tabs, settings)
    return (
        <Stack>
            <Stack.Screen 
                name="AddSession" 
                options={{
                    headerBackVisible: false,
                    headerBackTitle: "",
                    headerShadowVisible: false,
                    headerTitle: () => <InterText fontSize={32} fontWeight={600} lineHeight={35}>Add Session</InterText>,
                    headerLeft: () => <SessionIcon width={40} height={40}/>,
                }} 
            />
        </Stack>
    );
}