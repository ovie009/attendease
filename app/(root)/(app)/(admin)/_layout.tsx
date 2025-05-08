// ./app/(app)/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';
import InterText from '@/components/InterText';
import { View } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors } from '@/utilities/colors';

export default function AdminLayout() {
    // Render the child route within the authenticated group (tabs, settings)
    return (
        <Stack>
            <Stack.Screen 
                name="AddAdmin" 
                options={{
                    headerBackTitle: "",
                    headerBackVisible: false,
                    headerShadowVisible: false,
                    headerTitle: () => <InterText fontSize={32} fontWeight={600} lineHeight={35}>Add Admin</InterText>,
                    headerLeft: () => <View style={{marginRight: 5}}><FontAwesome name="user-circle-o" size={24} color={colors.primary} /></View>,
                }} 
            />
        </Stack>
    );
}