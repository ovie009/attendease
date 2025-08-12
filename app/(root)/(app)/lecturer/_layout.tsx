// app/college/_layout.tsx
import React from 'react';
import { router, Stack, useLocalSearchParams } from 'expo-router'; // Import Stack (or Tabs, etc.) and the hook
import InterText from '@/components/InterText';
import { TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

// Optional: Define the type for parameters expected in this segment
type LecturerLayoutParams = {
    _lecturer_fullname: string; // This MUST match the dynamic segment filename '[_department_name].tsx'
};

export default function LectuterLayout() {
    // Get the parameters for the currently active screen *within* this layout
    const { _lecturer_fullname } = useLocalSearchParams<LecturerLayoutParams>();

    // Decode the name if it might be URL-encoded (e.g., spaces become %20)
    const decodedDepartmentName = _lecturer_fullname ? decodeURIComponent(_lecturer_fullname) : 'Lecturer';

    return (
        <Stack>
        <Stack.Screen
            name="[_lecturer_fullname]" // Matches the file name
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