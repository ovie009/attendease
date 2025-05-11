// ./app/(app)/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';
import InterText from '@/components/InterText';
import CourseIcon from '@/assets/svg/CourseIcon.svg';

export default function CourseLayout() {
    // Render the child route within the authenticated group (tabs, settings)
    return (
        <Stack>
            <Stack.Screen 
                name="AddCourse" 
                options={{
                    headerBackVisible: false,
                    headerBackTitle: "",
                    headerShadowVisible: false,
                    headerTitle: () => <InterText fontSize={32} fontWeight={600} lineHeight={35}>Add Course</InterText>,
                    headerLeft: () => <CourseIcon width={30} height={30} />,
                }} 
            />
            <Stack.Screen 
                name="EditCourse"
                options={{
                    headerBackVisible: false,
                    headerShadowVisible: false,
                    headerTitle: () => <InterText fontSize={32} fontWeight={600} lineHeight={35}>Edit Course</InterText>,
                }} 
            />
        </Stack>
    );
}