// app/college/_layout.tsx
import React from 'react';
import { Stack, useLocalSearchParams } from 'expo-router'; // Import Stack (or Tabs, etc.) and the hook
import InterText from '@/components/InterText';
import { View } from 'react-native';
import CourseIcon from '@/assets/svg/CourseIcon.svg';

// Optional: Define the type for parameters expected in this segment
type CollegeLayoutParams = {
    _course_code: string; // This MUST match the dynamic segment filename '[_course_code].tsx'
};

export default function CourseLayout() {
    // Get the parameters for the currently active screen *within* this layout
    const { _course_code } = useLocalSearchParams<CollegeLayoutParams>();

    // Decode the name if it might be URL-encoded (e.g., spaces become %20)
    const decodedDepartmentName = _course_code ? decodeURIComponent(_course_code) : 'College';

    return (
        <Stack>
        <Stack.Screen
            name="[_course_code]" // Matches the file name
            options={{
                title: decodedDepartmentName, // Set the title dynamically using the param!
                headerShadowVisible: false,
                headerLeft: () => (
                    <View style={{marginRight: 6}}>
                        <CourseIcon width={40} height={40}/>
                    </View>
                ),
                headerTitle: () => <InterText fontSize={32} fontWeight={600} lineHeight={35}>{decodedDepartmentName}</InterText>,
            }}
        />
        </Stack>
    );
}