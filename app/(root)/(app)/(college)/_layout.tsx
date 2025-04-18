// ./app/(app)/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';
import { colors } from '@/utilities/colors';
import InterText from '@/components/InterText';
import CollegeIcon from '@/assets/svg/CollegeIcon.svg';

export default function AppLayout() {
    // Render the child route within the authenticated group (tabs, settings)
    return (
        <Stack>
            <Stack.Screen 
                name="addCollege" 
                options={{
                    headerBackVisible: false,
                    headerBackTitle: "",
                    headerTitle: () => <InterText fontSize={32} fontWeight={600} lineHeight={35}>Add College</InterText>,
                    headerLeft: () => <CollegeIcon width={30} height={30} />,
                }} 
            />
            <Stack.Screen 
                name="editCollege"
                options={{
                    headerTitle: () => <InterText fontSize={32} fontWeight={600} lineHeight={35}>Edit College</InterText>,
                }} 
            />
        </Stack>
    );
}