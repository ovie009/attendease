// ./app/(app)/session.tsx
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import React from 'react'

const Lecturers = () => {
	return (
		<ScrollView
			contentContainerStyle={styles.contentContainer}
		>
		<Text>Lecturers</Text>
		</ScrollView>
	)
}

export default Lecturers

const styles = StyleSheet.create({
	contentContainer: {
		flexGrow: 1,
		backgroundColor: 'white',
	}
})