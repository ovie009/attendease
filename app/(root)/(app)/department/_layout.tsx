// app/college/_layout.tsx
import React from 'react';
import { Stack, useLocalSearchParams } from 'expo-router'; // Import Stack (or Tabs, etc.) and the hook
import InterText from '@/components/InterText';

// Optional: Define the type for parameters expected in this segment
type CollegeLayoutParams = {
    _department_name: string; // This MUST match the dynamic segment filename '[_department_name].tsx'
};

export default function DepartmentLayout() {
    // Get the parameters for the currently active screen *within* this layout
    const { _department_name } = useLocalSearchParams<CollegeLayoutParams>();

    // Decode the name if it might be URL-encoded (e.g., spaces become %20)
    const decodedDepartmentName = _department_name ? decodeURIComponent(_department_name) : 'College';

    return (
        <Stack>
        <Stack.Screen
            name="[_department_name]" // Matches the file name
            options={{
                title: decodedDepartmentName, // Set the title dynamically using the param!
                headerLeft: () => <></>,
                headerShadowVisible: false,

                headerTitle: () => (
                    <InterText 
                        // numberOfLines={1} 
                        fontSize={32} 
                        fontWeight={600} 
                        lineHeight={35}
                    >
                        {decodedDepartmentName}
                    </InterText>
                ),
            }}
        />
        </Stack>
    );
}