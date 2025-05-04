// ./app/(app)/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';
import InterText from '@/components/InterText';
import LecturerIcon from '@/assets/svg/LecturerIcon.svg';

export default function LecturerLayout() {
    // Render the child route within the authenticated group (tabs, settings)
    return (
        <Stack>
            <Stack.Screen 
                name="AddLecturer" 
                options={{
                    headerBackVisible: false,
                    headerBackTitle: "",
                    headerShadowVisible: false,
                    headerTitle: () => <InterText fontSize={32} fontWeight={600} lineHeight={35}>Add Lecturer</InterText>,
                    headerLeft: () => <LecturerIcon width={30} height={30} />,
                }} 
            />
            <Stack.Screen 
                name="EditLecturer"
                options={{
                    headerBackVisible: false,
                    headerShadowVisible: false,
                    headerTitle: () => <InterText fontSize={32} fontWeight={600} lineHeight={35}>Edit Lecturer</InterText>,
                    headerLeft: () => <LecturerIcon width={30} height={30} />,
                }} 
            />
        </Stack>
    );
}