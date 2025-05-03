import { ScrollView, StyleSheet, View } from 'react-native'
import React, { useState } from 'react'
import { colors } from '@/utilities/colors'
import CustomButton from '@/components/CustomButton'
import { WIDTH } from '@/utilities/dimensions'
import FixedWrapper from '@/components/FixedWrapper'
import Input from '@/components/Input'
import { useRouter } from 'expo-router'
import handleColleges from '@/api/handleColleges'
import { useAppStore } from '@/stores/useAppStore'

const AddCollege = () => {

	const router = useRouter();

	const {
		setIsLoading
	} = useAppStore.getState();

	const isLoading = useAppStore(state => state.isLoading);
	
	const [collegeName, setCollegeName] = useState<string>('');

	const handleCreateCollege = async () => {
		try {
			setIsLoading(true)

			const lecturerResponse = await handleColleges.create(collegeName.trim());

			if (lecturerResponse.isSuccessful) {
				router.back();
			}

		} catch (error) {
			
		} finally {
			setIsLoading(false)
		}
	}

	return (<>
		<ScrollView
			keyboardShouldPersistTaps={'handled'}
			contentContainerStyle={styles.contentContainer}
		>
			<View style={styles.main}>
				<Input
					value={collegeName}
					onChangeText={setCollegeName}
					label='College Name'
					placeholder='College Name'
				/>
			</View>
		</ScrollView>
		<FixedWrapper
			contentContainerStyle={styles.buttonWraper}
		>
			<CustomButton
				onPress={() => {
					router.back();
				}}
				width={(WIDTH - 60)/2}
				isNeutral={true}
				text='Cancel'
			/>
			<CustomButton
				onPress={handleCreateCollege}
				width={(WIDTH - 60)/2}
				text='Save'
				disabled={!collegeName}
				isLoading={isLoading}
			/>
		</FixedWrapper>
    </>)
}

export default AddCollege

const styles = StyleSheet.create({
	contentContainer: {
		backgroundColor: colors.white,
		paddingHorizontal: 20,
		flexGrow: 1,
		paddingTop: 30,
	},
	main: {
		display: 'flex',
		gap: 20,
		width: '100%',
	},
	buttonWraper: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'flex-start',
		flexDirection: 'row',
	}
})