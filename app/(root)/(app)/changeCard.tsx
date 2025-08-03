import { Keyboard, ScrollView, StyleSheet, TextInput } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { colors } from '@/utilities/colors'
import Flex from '@/components/Flex'
import { HEIGHT, WIDTH } from '@/utilities/dimensions'
import { router, usePathname } from 'expo-router'
import { CameraView } from 'expo-camera'
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAppStore } from '@/stores/useAppStore'
import handleStudents from '@/api/handleStudents'
import { Department } from '@/types/api'
import { AccountType, Level } from '@/types/general'
import handleRfidCards from '@/api/handleRfidCards'
import { useAuthStore } from '@/stores/useAuthStore'
import * as LocalAuthentication from 'expo-local-authentication';
import handleLecturers from '@/api/handleLecturers'


const ChangeCard = () => {

    const pathname = usePathname();

    const {
        displayToast,
        setLoadingPages,
    } = useAppStore.getState();

    const {
        setUser,
    } = useAuthStore.getState()

    const loadingPages = useAppStore(state => state.loadingPages)
    
    const user = useAuthStore(state => state.user);

    const scrollRef = useRef<ScrollView>(null)

    const [cardId, setCardId] = useState<string>('');

    useEffect(() => {
        if (!cardId) return;
        const updateCard = async () => {
            try {
                if (!user) {
                    router.back();
                    return;
                }
    			setLoadingPages([...loadingPages, pathname])

                const isEnrolled = await LocalAuthentication.isEnrolledAsync();

                if (isEnrolled) {
                    const authenticate = await LocalAuthentication.authenticateAsync()

                    if (!authenticate.success) {
                        throw new Error("Authentication failed");
                    }
                }

                if (user?.account_type === AccountType.Lecturer) {
                    const updateUserResponse = await handleLecturers.updateLecturer({
                        id: user?.id,
                        rfid: cardId,
                    });
                    // console.log("🚀 ~ handleCompleteRegistration ~ updateUserResponse:", updateUserResponse)

                    // await handleRfidCards.update({
                    //     card_uid: user?.rfid!,
                    //     lecturer_id: null,
                    // })
        
                    // await handleRfidCards.update({
                    //     card_uid: cardId,
                    //     lecturer_id: user?.id,
                    // })
                    
                    setUser({
                        ...user,
                        ...updateUserResponse.data,
                    })
                } else {
                    const updateUserResponse = await handleStudents.updateStudent({
                        id: user?.id,
                        rfid: cardId,
                    });

                    await handleRfidCards.update({
                        card_uid: user?.rfid!,
                        student_id: null,
                    })
        
                    await handleRfidCards.update({
                        card_uid: cardId,
                        student_id: user?.id,
                    })
        
                    setUser({
                        ...user,
                        ...updateUserResponse.data,
                    })
                }

                displayToast('SUCCESS', "Card changed successfully")

                router.replace('/profile');

            } catch (error:any) {
                displayToast('ERROR', error?.message)
            } finally {
	    		setLoadingPages(loadingPages.filter(item => item !== pathname))
                setCardId('')
            }
        };

        updateCard()
    }, [cardId])
 
    return (
        <React.Fragment>
            <ScrollView
                ref={scrollRef}
                contentContainerStyle={{
                    backgroundColor: colors.white,
                    paddingTop: 20,
                    flexGrow: 1,
                }}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                snapToInterval={WIDTH}
                decelerationRate={'fast'}
                keyboardShouldPersistTaps='handled'
                scrollEnabled={false}
            >
                <Flex
                    width={WIDTH}
                    height={'100%'}
                >
                    <CameraView
                        style={{
                            width: '100%',
                            height: '100%',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                        onBarcodeScanned={({ data }: { data: string }) => {
                            const baseUrl: string = process.env.EXPO_PUBLIC_SUPABASE_PROJECT_URL as string;

                            if (data.includes(baseUrl)) {
                                setCardId(data.replace(`${baseUrl}/`, ''))
                                return;
                            }

                            displayToast('ERROR', 'Invalid QR code')
                        }}
                        barcodeScannerSettings={{
                            barcodeTypes: ["qr"],
                        }}
                    >
                        <Ionicons name="scan-outline" size={400} color="white" />
                    </CameraView>
                </Flex>
            </ScrollView>
        </React.Fragment>
    )
}

export default ChangeCard

const styles = StyleSheet.create({})