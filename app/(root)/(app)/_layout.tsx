// ./app/(app)/_layout.tsx
import React from 'react';
import { ExternalPathString, Redirect, RelativePathString, Stack } from 'expo-router';
import { useAuthStore } from '@/stores/useAuthStore';
import { colors } from '@/utilities/colors';
import InterText from '@/components/InterText';
import CardIcon from '@/assets/svg/CardIcon.svg';
import DepartmentIcon from '@/assets/svg/DepartmentIcon.svg';
import CourseIcon from '@/assets/svg/CourseIcon.svg';
import CollegeIcon from '@/assets/svg/CollegeIcon.svg';
import SessionIcon from '@/assets/svg/SessionIcon.svg';
import LecturerIcon from '@/assets/svg/LecturerIcon.svg';
import ScheduleIcon from '@/assets/svg/ScheduleIcon.svg';
import { View } from 'react-native';

export default function AppLayout() {
    const session = useAuthStore((state) => state.session);
    const isFirstLaunch = useAuthStore((state) => state.isFirstLaunch);

	// console.log("🚀 ~ AppLayout ~ segments:", segments)

    // If it's the first launch, the root layout handles redirecting to index
    if (isFirstLaunch) {
        // Should be handled by root, but as a safety net
      return <Redirect href={"/" as ExternalPathString} />;
    }

    // If the user is not signed in, redirect away from the app group
    if (!session) {
      // Redirect to the login screen
      return <Redirect href={"/(root)/(auth)/login" as RelativePathString} />;
    }

    // Render the child route within the authenticated group (tabs, settings)
    return (
		<Stack
			screenOptions={{
				headerShadowVisible: false,
			}}
		>
			<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
			<Stack.Screen 
				name="(card)" 
				options={{ 
					title: "", 
					headerShown: true, 
					headerShadowVisible: false,
				}}
			/>
			<Stack.Screen 
				name="(college)" 
				options={{ 
					title: "", 
					headerShown: true, 
					headerShadowVisible: false,				}}
			/>
			<Stack.Screen 
				name="(session)" 
				options={{ 
					title: "", 
					headerShown: false,
					headerShadowVisible: false,
				}}
			/>
			<Stack.Screen 
				name="(department)" 
				options={{ 
					title: '',
					headerShown: true, 
					headerShadowVisible: false,
				}}
			/>
			<Stack.Screen 
				name="(course)" 
				options={{ 
					title: '',
					headerShown: true, 
					headerShadowVisible: false,
				}}
			/>
			<Stack.Screen 
				name="(lecturer)" 
				options={{ 
					title: '',
					headerShown: true, 
					headerShadowVisible: false,
				}}
			/>
			<Stack.Screen 
				name="(admin)" 
				options={{ 
					title: '',
					headerShown: true, 
					headerShadowVisible: false,
				}}
			/>
			<Stack.Screen 
				name="college" 
				options={{ 
					title: "", 
					headerShown: true, 
					headerShadowVisible: false,
				}}
			/>
			<Stack.Screen 
				name="session" 
				options={{
					headerBackVisible: false,
					headerBackTitle: "",
					headerTitle: () => <InterText fontSize={32} fontWeight={600} lineHeight={35}>Session</InterText>,
					headerLeft: () => <View style={{marginRight: 6}}><SessionIcon width={40} height={40}/></View>,
				}} 
			/>
			<Stack.Screen 
				name="cards" 
				options={{
					headerBackVisible: false,
					headerBackTitle: "",
					headerLeft: () => <View style={{marginRight: 6}}><CardIcon width={40} height={40}/></View>,
					headerTitle: () => <InterText fontSize={32} fontWeight={600} lineHeight={35}>Cards</InterText>,
				}} 
			/>
			<Stack.Screen 
				name="colleges"
				options={{
					headerTintColor: colors.black,
					headerBackTitle: "",
					headerLeft: () => <View style={{marginRight: 6}}><CollegeIcon width={40} height={40}/></View>,
					headerTitle: () => <InterText fontSize={32} fontWeight={600} lineHeight={35}>Colleges</InterText>,
				}} 
			/>
			<Stack.Screen 
				name="courses"
				options={{
					headerBackTitle: "",
					headerTintColor: colors.black,
					headerLeft: () => <View style={{marginRight: 6}}><CourseIcon width={40} height={40}/></View>,
					headerTitle: () => <InterText fontSize={32} fontWeight={600} lineHeight={35}>Courses</InterText>,
				}} 
			/>
			<Stack.Screen 
				name="departments"
				options={{
					headerBackTitle: "",
					headerTintColor: colors.black,
					headerLeft: () => <View style={{marginRight: 6}}><DepartmentIcon width={40} height={40}/></View>,
					headerTitle: () => <InterText fontSize={32} fontWeight={600} lineHeight={35}>Departments</InterText>,
				}} 
			/>
			<Stack.Screen 
				name="lecturers"
				options={{
					headerTintColor: colors.black,
					headerBackTitle: "",
					headerLeft: () => <View style={{marginRight: 6}}><LecturerIcon width={40} height={40}/></View>,
					headerTitle: () => <InterText fontSize={32} fontWeight={600} lineHeight={35}>Lecturers</InterText>,
				}} 
			/>

			<Stack.Screen 
				name="schedules"
				options={{
					headerTintColor: colors.black,
					headerBackTitle: "",
					headerLeft: () => <View style={{marginRight: 6}}><ScheduleIcon width={40} height={40}/></View>,
					headerTitle: () => <InterText fontSize={32} fontWeight={600} lineHeight={35}>Schedules</InterText>,
				}} 
			/>
		</Stack>
	);
}