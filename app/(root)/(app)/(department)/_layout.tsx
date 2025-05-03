// ./app/(app)/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';
import InterText from '@/components/InterText';
import DepartmentIcon from '@/assets/svg/DepartmentIcon.svg';

export default function DepartmentLayout() {
    // Render the child route within the authenticated group (tabs, settings)
    return (
        <Stack>
            <Stack.Screen 
                name="addDepartment" 
                options={{
                    headerBackVisible: false,
                    headerBackTitle: "",
                    headerShadowVisible: false,
                    headerTitle: () => <InterText fontSize={32} fontWeight={600} lineHeight={35}>Add Department</InterText>,
                    headerLeft: () => <DepartmentIcon width={30} height={30} />,
                }} 
            />
            <Stack.Screen 
                name="editDepartment"
                options={{
                    headerBackVisible: false,
                    headerShadowVisible: false,
                    headerTitle: () => <InterText fontSize={32} fontWeight={600} lineHeight={35}>Edit Department</InterText>,
                }} 
            />
        </Stack>
    );
}