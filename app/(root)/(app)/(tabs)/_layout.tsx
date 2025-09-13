// ./app/(app)/(tabs)/_layout.tsx
import React from 'react';
import { Tabs } from 'expo-router';
import Entypo from '@expo/vector-icons/Entypo'
import FontAwesome5 from '@expo/vector-icons/FontAwesome5'
import { colors } from '@/utilities/colors';
import InterText from '@/components/InterText';
import { useAuthStore } from '@/stores/useAuthStore';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons'
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/stores/useAppStore';
import { AccountType } from '@/types/general';
import CourseIcon from '@/assets/svg/CourseIcon.svg';
import CourseInactiveIcon from '@/assets/svg/CourseInactiveIcon.svg';

export default function TabLayout() {

	const {
		setIsLoading,
		displayToast,
	} = useAppStore.getState()

	const isLoading = useAppStore(state => state.isLoading);

	const user = useAuthStore((state) => state.user);
	const signOut = useAuthStore((state) => state.signOut);

	const handleLogout = async () => {
		try {
			setIsLoading(true)
			// Optional: Show loading state
			await signOut();
		} catch (error: any) {
			console.log("🚀 ~ handleLogout ~ error:", error)
			displayToast('ERROR', error?.message)
		} finally {
			setIsLoading(false)
		}
	};

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
					headerTitle: () => <InterText fontSize={32} fontWeight={600} lineHeight={35} numberOfLines={2}>Welcome,{`\n`}{user?.full_name}</InterText>,
					tabBarLabel: ({focused}) => <InterText color={focused ? colors.primary : colors.grey}>Home</InterText>,
					tabBarIcon: ({focused}) => <Entypo name="home" size={20} color={focused ? colors.primary : colors.grey} />,
					headerStyle: {
						height: 120,
					}
				}}
			/>
			<Tabs.Screen
				name="settings" // This corresponds to settings.tsx
				options={{
					href: user?.account_type === AccountType.Admin ? '/settings' : null,
					headerTitle: () => <InterText fontSize={32} fontWeight={600} lineHeight={35}>Settings</InterText>,
					tabBarLabel: ({focused}) => <InterText color={focused ? colors.primary : colors.grey}>Settings</InterText>,
					tabBarIcon: ({focused}) => <Entypo name="sound-mix" size={20} color={focused ? colors.primary : colors.grey} />,
					headerLeft: () => <View style={{paddingLeft: 20}}>
						<Entypo name="sound-mix" size={40} color={colors.primary} />
					</View>,
				}}
			/>
			<Tabs.Screen
				name="analytics" // This corresponds to settings.tsx
				options={{
					href: user?.account_type !== AccountType.Admin ? '/analytics' : null,
					headerTitle: () => <InterText fontSize={32} fontWeight={600} lineHeight={35}>Attendance Report</InterText>,
					tabBarLabel: ({focused}) => <InterText color={focused ? colors.primary : colors.grey}>Attendance Report</InterText>,
					tabBarIcon: ({focused}) => focused ? <CourseIcon width={20} height={20} /> : <CourseInactiveIcon width={20} height={20} />,
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
					headerRight: () => (
						<TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
							{isLoading && <ActivityIndicator color={colors.primary} />}
                            <Ionicons name="exit-outline" size={24} color={colors.error} />
                            <InterText
                                fontSize={16}
                                lineHeight={19}
                                color={colors.error}
                                fontWeight={'500'}
                            >
                                Logout
                            </InterText>
                        </TouchableOpacity>
					)
				}}
			/>
		</Tabs>
	);
}

const styles = StyleSheet.create({
	notificationButton: {
		marginRight: 20,
	},
	logoutButton: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 5,
        flexDirection: 'row',
		marginRight: 20,
    }
});