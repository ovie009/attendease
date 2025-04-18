// ./app/(app)/(tabs)/_layout.tsx
import React from 'react';
import { Tabs } from 'expo-router';
import Entypo from '@expo/vector-icons/Entypo'
import FontAwesome5 from '@expo/vector-icons/FontAwesome5'
import { colors } from '@/utilities/colors';
import InterText from '@/components/InterText';
import { useAuthStore } from '@/stores/useAuthStore';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons'
// You might want to import icons
// import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {

	const user = useAuthStore((state) => state.user);
	// console.log("🚀 ~ TabLayout ~ user:", user)

	return (
		<Tabs
			screenOptions={{
				// Customize tab bar appearance here
				// tabBarActiveTintColor: 'blue',
				// headerShown: false, // Example: Hide header for tab screens
				// header: (props) => 
				headerStyle: {
					height: 80,
					elevation: 0,
					borderBottomWidth: 1,
					borderColor: colors.skeleton1
				},
				tabBarStyle: {
					elevation: 0,
				}
			}}
		>
			<Tabs.Screen
				name="home" // This corresponds to home.tsx
				options={{
					headerTitle: () => <InterText fontSize={32} fontWeight={600} lineHeight={35}>Welcome,{`\n`}{user?.full_name}</InterText>,
					tabBarLabel: ({focused}) => <InterText color={focused ? colors.primary : colors.grey}>Home</InterText>,
					tabBarIcon: ({focused}) => <Entypo name="home" size={20} color={focused ? colors.primary : colors.grey} />,
					headerRight: () => <TouchableOpacity style={styles.notificationButton}>
						<Ionicons name="notifications" size={20} color={colors.primary} />
					</TouchableOpacity>,
				}}
			/>
			<Tabs.Screen
				name="settings" // This corresponds to settings.tsx
				options={{
					headerTitle: () => <InterText fontSize={32} fontWeight={600} lineHeight={35}>Settings</InterText>,
					tabBarLabel: ({focused}) => <InterText color={focused ? colors.primary : colors.grey}>Settings</InterText>,
					tabBarIcon: ({focused}) => <Entypo name="sound-mix" size={20} color={focused ? colors.primary : colors.grey} />,
					headerLeft: () => <View style={{paddingLeft: 20}}>
						<Entypo name="sound-mix" size={40} color={colors.primary} />
					</View>,
				}}
			/>
			<Tabs.Screen
				name="profile" // This corresponds to profile.tsx
				options={{
					headerTitle: () => <InterText fontSize={32} fontWeight={600} lineHeight={35}>Profile</InterText>,
					tabBarLabel: ({focused}) => <InterText color={focused ? colors.primary : colors.grey}>Profile</InterText>,
					tabBarIcon: ({ focused }) => <FontAwesome5 name="user-circle" size={20} color={focused ? colors.primary : colors.grey} />,
					headerLeft: () => <View style={{paddingLeft: 20}}>
						<FontAwesome5 name="user-circle" size={40} color={colors.primary} />
					</View>,
				}}
			/>
		</Tabs>
	);
}

const styles = StyleSheet.create({
	notificationButton: {
		marginRight: 20,
	},
});