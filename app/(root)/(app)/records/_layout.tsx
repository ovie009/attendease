// app/college/_layout.tsx
import React from 'react';
import { router, Stack, useLocalSearchParams } from 'expo-router'; // Import Stack (or Tabs, etc.) and the hook
import InterText from '@/components/InterText';
import { TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

// Optional: Define the type for parameters expected in this segment
type CollegeLayoutParams = {
    _course_code: string; // This MUST match the dynamic segment filename '[_department_name].tsx'
};

export default function DepartmentLayout() {
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
                headerLeft: () => (
                    <TouchableOpacity
                        onPress={() => {
                            router.back()
                        }}
                        style={{
                            marginRight: 20
                        }}
                    >
                        <Ionicons name="arrow-back" size={24} color="black" />
                    </TouchableOpacity>
                ),
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