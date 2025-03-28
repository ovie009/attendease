// ./app/(app)/(tabs)/settings.tsx
import { Button, ScrollView, StyleSheet, View } from 'react-native'
import React from 'react'
import { Link, RelativePathString } from 'expo-router'

const Settings = () => {

	const buttons: { name: string, href: string, onPress: () => void }[] = [
		{
			name: "Session",
			href: '/(app)/session',
			onPress: () => {},
		},
		{
			name: "Colleges",
			href: '/(app)/colleges',
			onPress: () => {},
		},
		{
			name: "Departments",
			href: '/(app)/departments',
			onPress: () => {},
		},
		{
			name: "Courses",
			href: '/(app)/courses',
			onPress: () => {},
		},
	]


	return (
		<ScrollView style={styles.container}>
			<View style={styles.list}>
				{buttons.map((button, index) => (
					<Link key={index} href={button.href as RelativePathString} asChild>
						<Button title={button.name} onPress={button.onPress} />
					</Link>
				))}
			</View>

		</ScrollView>
	)
}

export default Settings

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
		paddingHorizontal: 20,
		paddingBottom: 30,
    },
	list: {
		display: 'flex',
		justifyContent: 'flex-start',
		alignItems: 'flex-start',
		gap: 20,
	}
})