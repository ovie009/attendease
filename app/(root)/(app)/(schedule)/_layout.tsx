// ./app/(app)/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';
import InterText from '@/components/InterText';
import ScheduleIcon from '@/assets/svg/ScheduleIcon.svg';

export default function ScheduleLayout() {
    // Render the child route within the authenticated group (tabs, settings)
    return (
        <Stack>
            <Stack.Screen 
                name="AddSchedule" 
                options={{
                    headerBackVisible: false,
                    headerBackTitle: "",
                    headerShadowVisible: false,
                    headerTitle: () => <InterText fontSize={32} fontWeight={600} lineHeight={35}>Add Schedule</InterText>,
                    headerLeft: () => <ScheduleIcon width={30} height={30} />,
                }} 
            />
            <Stack.Screen 
                name="EditSchedule"
                options={{
                    headerBackVisible: false,
                    headerShadowVisible: false,
                    headerTitle: () => <InterText fontSize={32} fontWeight={600} lineHeight={35}>Edit Schedule</InterText>,
                }} 
            />
        </Stack>
    );
}