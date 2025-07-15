import { ScrollView, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { colors } from '@/utilities/colors'

const Courses = () => {
	return (
		<ScrollView
			contentContainerStyle={styles.container}
		>

		</ScrollView>
	)
}

export default Courses

const styles = StyleSheet.create({
	container: {
		flexGrow: 1,
		backgroundColor: colors.white
	}
})