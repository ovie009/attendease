// ./app/(app)/session.tsx
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import React from 'react'

const Session = () => {
	return (
		<ScrollView
			contentContainerStyle={styles.contentContainer}
		>
		<Text>Session</Text>
		</ScrollView>
	)
}

export default Session

const styles = StyleSheet.create({
	contentContainer: {
		flexGrow: 1,
		backgroundColor: 'white',
	}
})