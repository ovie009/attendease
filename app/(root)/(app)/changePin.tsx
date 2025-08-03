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
import { AccountType } from '@/types/general'
import handleStudents from '@/api/handleStudents'
import * as LocalAuthentication from 'expo-local-authentication';

const ChangePin = () => {

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
    const [verifyPin, setVerifyPin] = useState<string>('');

    const handleCompleteRegistration = async () => {
        try {
            setIsLoading(true);

            if (!user) return;

            if (pin.length !== 4) {
                throw new Error('Pin must be 4 digits')
            }

            if (pin !== verifyPin) {
                throw new Error('Pin does not match')
            }

            const isEnrolled = await LocalAuthentication.isEnrolledAsync();

            if (isEnrolled) {
                const authenticate = await LocalAuthentication.authenticateAsync()

                if (!authenticate.success) {
                    throw new Error("Authentication failed");
                }
            }

            const hashedPin = await Crypto.digestStringAsync(
                Crypto.CryptoDigestAlgorithm.SHA256,
                pin
            );

            if (user?.account_type === AccountType.Lecturer) {
                const updateUserResponse = await handleLecturers.updateLecturer({
                    id: user?.id,
                    pin: hashedPin,
                });
                // console.log("🚀 ~ handleCompleteRegistration ~ updateUserResponse:", updateUserResponse)
    
                setUser({
                    ...user,
                    ...updateUserResponse.data,
                })
            } else {
                const updateUserResponse = await handleStudents.updateStudent({
                    id: user?.id,
                    pin: hashedPin,
                });
    
                setUser({
                    ...user,
                    ...updateUserResponse.data,
                })
            }

            displayToast('SUCCESS', "Pin changed successfully")

            router.replace('/profile');
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
                        isPasswordInput={true}
                        placeholder='Enter pin'
                        maxLength={4}
                        keyboardType='numeric'
                    />
                    <Input
                        label='Verify Pin'
                        defaultValue={verifyPin}
                        onChangeText={setVerifyPin}
                        width={WIDTH - 40}
                        isPasswordInput={true}
                        placeholder='Enter pin'
                        maxLength={4}
                        keyboardType='numeric'
                    />
                </Flex>
                <CustomButton
                    text='Continue'
                    isLoading={isLoading}
                    disabled={!pin || !verifyPin}
                    onPress={handleCompleteRegistration}
                />
            </Flex>
        </ScrollView>
    )
}

export default ChangePin

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: colors.white,
        paddingTop: 20,
        paddingBottom: 50, 
        paddingHorizontal: 20,
    }
})