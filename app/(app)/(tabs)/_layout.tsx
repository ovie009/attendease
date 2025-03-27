// ./app/(app)/(tabs)/_layout.tsx
import React from 'react';
import { Tabs } from 'expo-router';
// You might want to import icons
// import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        // Customize tab bar appearance here
        // tabBarActiveTintColor: 'blue',
        // headerShown: false, // Example: Hide header for tab screens
      }}>
      <Tabs.Screen
        name="home" // This corresponds to home.tsx
        options={{
          title: 'Home',
          // tabBarIcon: ({ color }) => <Ionicons name="home" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile" // This corresponds to profile.tsx
        options={{
          title: 'Profile',
          // tabBarIcon: ({ color }) => <Ionicons name="person" size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}