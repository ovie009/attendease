// ./app/(app)/session.tsx
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import React from 'react'

const Schedules = () => {
	return (
		<ScrollView
			contentContainerStyle={styles.contentContainer}
		>
		<Text>Schedules</Text>
		</ScrollView>
	)
}

export default Schedules

const styles = StyleSheet.create({
	contentContainer: {
		flexGrow: 1,
		backgroundColor: 'white',
	}
})