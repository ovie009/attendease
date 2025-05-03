// app/college/_layout.tsx
import React from 'react';
import { Stack, useLocalSearchParams } from 'expo-router'; // Import Stack (or Tabs, etc.) and the hook
import InterText from '@/components/InterText';

// Optional: Define the type for parameters expected in this segment
type CollegeLayoutParams = {
    _college_name: string; // This MUST match the dynamic segment filename '[_college_name].tsx'
};

export default function CollegeLayout() {
    // Get the parameters for the currently active screen *within* this layout
    const { _college_name } = useLocalSearchParams<CollegeLayoutParams>();

    // Decode the name if it might be URL-encoded (e.g., spaces become %20)
    const decodedCollegeName = _college_name ? decodeURIComponent(_college_name) : 'College';

    return (
        <Stack>
        <Stack.Screen
            name="[_college_name]" // Matches the file name
            options={{
                title: decodedCollegeName, // Set the title dynamically using the param!
                headerLeft: () => <></>,
                headerShadowVisible: false,
                headerTitle: () => (
                    <InterText 
                        // numberOfLines={1} 
                        fontSize={32} 
                        fontWeight={600} 
                        lineHeight={35}
                    >
                        {decodedCollegeName}
                    </InterText>
                ),
            }}
        />
        </Stack>
    );
}