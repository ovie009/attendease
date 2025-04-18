// ./app/(app)/(tabs)/settings.tsx
import { ScrollView, StyleSheet, View } from 'react-native'
import React, { ReactNode } from 'react'
import { RelativePathString } from 'expo-router'
import { colors } from '@/utilities/colors'
import CollegeIcon from '@/assets/svg/CollegeIcon.svg';
import DepartmentIcon from '@/assets/svg/DepartmentIcon.svg';
import SessionIcon from '@/assets/svg/SessionIcon.svg';
import CourseIcon from '@/assets/svg/CourseIcon.svg';
import CardIcon from '@/assets/svg/CardIcon.svg';
import LecturerIcon from '@/assets/svg/LecturerIcon.svg';
import ScheduleIcon from '@/assets/svg/ScheduleIcon.svg';
import SettingsListItem from '@/components/SettingsListItem'


const Settings = () => {

	const buttons: { name: string, href: RelativePathString, onPress: () => void, Icon: ReactNode }[] = [
		{
			name: "Colleges",
			href: '../colleges',
			onPress: () => {},
			Icon: <CollegeIcon width={20} height={20} />
		},
		{
			name: "Session",
			href: '../session',
			onPress: () => {},
			Icon: <SessionIcon width={20} height={20} />
		},
		{
			name: "Departments",
			href: '../departments',
			onPress: () => {},
			Icon: <DepartmentIcon width={20} height={20} />
		},
		{
			name: "Courses",
			href: '../courses',
			onPress: () => {},
			Icon: <CourseIcon width={20} height={20} />
		},
		{
			name: "Cards",
			href: '../cards',
			onPress: () => {},
			Icon: <CardIcon width={20} height={20} />
		},
		{
			name: "Lecturers",
			href: '../lecturers',
			onPress: () => {},
			Icon: <LecturerIcon width={20} height={20} />
		},
		{
			name: "Schedules",
			href: '../schedules',
			onPress: () => {},
			Icon: <ScheduleIcon width={20} height={20} />
		},
	]


	return (
		<ScrollView contentContainerStyle={styles.contentContainer}>
			<View style={styles.list}>
				{buttons.map((button) => (
					<SettingsListItem
						key={button?.name}
						{...button}
					/>
				))}
			</View>

		</ScrollView>
	)
}

export default Settings

const styles = StyleSheet.create({
    contentContainer: {
        flexGrow: 1,
		padding: 20,
		paddingBottom: 30,
		backgroundColor: colors.white,
    },
	list: {
		display: 'flex',
		justifyContent: 'flex-start',
		alignItems: 'flex-start',
	}
})