import { ScrollView, StyleSheet, TextInput, View } from 'react-native'
import React, { useRef, useState } from 'react'
import { colors } from '@/utilities/colors'
import CustomButton from '@/components/CustomButton'
import { WIDTH } from '@/utilities/dimensions'
import FixedWrapper from '@/components/FixedWrapper'
import Input from '@/components/Input'
import { useAppStore } from '@/stores/useAppStore'
import { useRouter } from 'expo-router'
import handleAdmin from '@/api/handleAdmin'


const AddAdmin = () => {

	const router = useRouter();

	const {
		setIsLoading,
		displayToast,
	} = useAppStore.getState();

	const isLoading = useAppStore(state => state.isLoading);

    const [fullName, setFullName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const emailRef = useRef<TextInput>(null)

	const handleCreateAdmin = async () => {
		try {
			setIsLoading(true);
			
			if (!email || !fullName) {
				throw new Error("Email and Full name required")
			}

			await handleAdmin.addAdmin({
				email,
				full_name: fullName
			})

			router.back();

		} catch (error: any) {
			displayToast('ERROR', error?.message)
		} finally {
			setIsLoading(false);
		}
	}
	

	return (<>
		<ScrollView
			keyboardShouldPersistTaps={'handled'}
			contentContainerStyle={styles.contentContainer}
		>
			<View style={styles.main}>
				<Input
					value={fullName}
					onChangeText={setFullName}
					label='Full Name'
					placeholder='Full Name'
                    onSubmitEditing={() => emailRef.current?.focus()}
				/>
				<Input
                    ref={emailRef}
					value={email}
					onChangeText={setEmail}
					label='email address'
					keyboardType='email-address'
					placeholder='Ofulagabe@fupre.com'
					onSubmitEditing={handleCreateAdmin}
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
				onPress={handleCreateAdmin}
				width={(WIDTH - 60)/2}
				text='Save'
				isLoading={isLoading}
				disabled={!email || !fullName}
			/>
		</FixedWrapper>
    </>)
}

export default AddAdmin

const styles = StyleSheet.create({
	contentContainer: {
		backgroundColor: colors.white,
		paddingHorizontal: 20,
		flexGrow: 1,
		paddingTop: 30,
        paddingBottom: 120,
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
	},
	lecturersEmptyCompoennt: {
		width: '100%',
		paddingHorizontal: 20,
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
	}
})