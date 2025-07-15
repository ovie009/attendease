import { ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import { colors } from '@/utilities/colors'
import InterText from '@/components/InterText'
import Flex from '@/components/Flex'
import Input from '@/components/Input'
import { WIDTH } from '@/utilities/dimensions'
import CustomButton from '@/components/CustomButton'
import { useAppStore } from '@/stores/useAppStore'
import { useAuthStore } from '@/stores/useAuthStore'
import handleLecturers from '@/api/handleLecturers'
import { router } from 'expo-router'
import * as Crypto from 'expo-crypto';

const CompleteRegistration = () => {

	const keyboardHeight = useAppStore(state => state.keyboardHeight)
	const isLoading = useAppStore(state => state.isLoading)
	const user = useAuthStore(state => state.user)

	const {
		setUser
	} = useAuthStore.getState()

	const {
		setIsLoading,
		displayToast,
	} = useAppStore.getState()

	const [pin, setPin] = useState<string>('');

	const handleCompleteRegistration = async () => {
		try {
			setIsLoading(true);

			if (!user) return;

			if (pin.length !== 4) {
				throw new Error('Pin must be 4 digits')
			}

			const hashedPin = await Crypto.digestStringAsync(
				Crypto.CryptoDigestAlgorithm.SHA256,
				pin
			);

			const updateUserResponse = await handleLecturers.updateLecturer({
				id: user?.id,
				pin: hashedPin,
			});
			// console.log("🚀 ~ handleCompleteRegistration ~ updateUserResponse:", updateUserResponse)

			setUser({
				...user,
				...updateUserResponse.data,
			})

			router.replace('/(root)/(app)/(tabs)/home');
		} catch (error:any) {
			displayToast('ERROR', error?.message)
		} finally {
			setIsLoading(false);
		}
	}
	

	return (
		<ScrollView
			contentContainerStyle={styles.container}
			keyboardShouldPersistTaps='handled'
		>
			<Flex
				gap={42}
				paddingBottom={keyboardHeight}
			>
				<Flex
					gap={20}
				>
					<InterText>
						Please finish your registeration by creating your authentication pin
					</InterText>
					<Input
						label='Pin'
						defaultValue={pin}
						onChangeText={setPin}
						width={WIDTH - 40}
						placeholder='Enter pin'
						maxLength={4}
						keyboardType='numeric'
					/>
				</Flex>
				<CustomButton
					text='Continue'
					isLoading={isLoading}
					disabled={!pin}
					onPress={handleCompleteRegistration}
				/>
			</Flex>
		</ScrollView>
	)
}

export default CompleteRegistration

const styles = StyleSheet.create({
	container: {
		flexGrow: 1,
		backgroundColor: colors.white,
		paddingTop: 20,
		paddingBottom: 50, 
		paddingHorizontal: 20,
	}
})