// ./app/(app)/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';
import InterText from '@/components/InterText';
import CollegeIcon from '@/assets/svg/CollegeIcon.svg';

export default function CardLayout() {
    // Render the child route within the authenticated group (tabs, settings)
    return (
        <Stack>
            <Stack.Screen 
                name="scanCard" 
                options={{
                    headerBackVisible: false,
                    headerBackTitle: "",
                    headerShadowVisible: false,
                    headerTitle: () => <InterText fontSize={32} fontWeight={600} lineHeight={35}>Scan Card</InterText>,
                    // headerLeft: () => <CollegeIcon width={30} height={30} />,
                }} 
            />
        </Stack>
    );
}