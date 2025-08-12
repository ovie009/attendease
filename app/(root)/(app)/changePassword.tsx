import { ScrollView, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import { colors } from '@/utilities/colors'
import InterText from '@/components/InterText'
import Flex from '@/components/Flex'
import Input from '@/components/Input'
import { WIDTH } from '@/utilities/dimensions'
import CustomButton from '@/components/CustomButton'
import { useAppStore } from '@/stores/useAppStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { router } from 'expo-router'
import * as LocalAuthentication from 'expo-local-authentication';
import handleAuth from '@/api/handleAuth'

const ChangePassword = () => {

    const keyboardHeight = useAppStore(state => state.keyboardHeight)
    const isLoading = useAppStore(state => state.isLoading)
    const user = useAuthStore(state => state.user)

    const {
        setIsLoading,
        displayToast,
    } = useAppStore.getState()

    const [currentPassword, setCurrentPassword] = useState<string>('')
    const [newPassword, setNewPassword] = useState<string>('')
    const [retypeNewPassword, setRetypeNewPassword] = useState<string>('')

    const handleCompleteRegistration = async () => {
        try {
            setIsLoading(true);

            if (!user) return;

            const isEnrolled = await LocalAuthentication.isEnrolledAsync();

            if (isEnrolled) {
                const authenticate = await LocalAuthentication.authenticateAsync()

                if (!authenticate.success) {
                    throw new Error("Authentication failed");
                }
            }

            await handleAuth.changePassword({
                current_password: currentPassword,
                new_password: newPassword,
                retype_new_password: retypeNewPassword,
                email: user?.email,
            })

            displayToast('SUCCESS', "Password changed successfully")

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
                        Please fill in the form to change to a new password
                    </InterText>
                    <Input
                        label='Current Password'
                        defaultValue={currentPassword}
                        onChangeText={setCurrentPassword}
                        width={WIDTH - 40}
                        isPasswordInput={true}
                        placeholder='Enter password'
                    />
                    <Input
                        label='New password'
                        defaultValue={newPassword}
                        onChangeText={setNewPassword}
                        width={WIDTH - 40}
                        isPasswordInput={true}
                        placeholder='Enter password'
                    />
                    <Input
                        label='Retype new password'
                        defaultValue={retypeNewPassword}
                        onChangeText={setRetypeNewPassword}
                        width={WIDTH - 40}
                        isPasswordInput={true}
                        placeholder='Enter password'
                    />
                </Flex>
                <CustomButton
                    text='Continue'
                    isLoading={isLoading}
                    disabled={!currentPassword || !newPassword || !retypeNewPassword || newPassword !== retypeNewPassword}
                    onPress={handleCompleteRegistration}
                />
            </Flex>
        </ScrollView>
    )
}

export default ChangePassword

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: colors.white,
        paddingTop: 20,
        paddingBottom: 50, 
        paddingHorizontal: 20,
    }
})