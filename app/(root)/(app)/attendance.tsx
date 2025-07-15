import CardIcon from '@/assets/svg/CardIcon.svg';
import { Linking, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import Flex from '@/components/Flex'
import { router, useLocalSearchParams, usePathname } from 'expo-router'
import InterText from '@/components/InterText'
import { colors } from '@/utilities/colors'
import CustomButton from '@/components/CustomButton'
import Container from '@/components/Container'
import { HEIGHT, WIDTH } from '@/utilities/dimensions'
import { FlashList } from '@shopify/flash-list'
import FixedButton from '@/components/FixedButton'
import EmptyAttendanceIcon from '@/assets/svg/EmptyAttendanceIcon.svg'
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import CustomBottomSheet from '@/components/CustomBottomSheet'
import Input from '@/components/Input'
import { ActivityIndicator } from 'react-native-paper';
import { useAppStore } from '@/stores/useAppStore';
import * as Crypto from 'expo-crypto';
import { useAuthStore } from '@/stores/useAuthStore';
import * as Location from 'expo-location'
import { Alert } from 'react-native';
import { Region } from '@/types/general';
import handleAttendanceSessions from '@/api/handleAttendanceSessions';
import moment from 'moment';
import MQTTService from '@/api/MQTTService';
import * as LocalAuthentication from 'expo-local-authentication';

const Attendance = () => {

	const {
		_course_code,
		_course_title,
		_course_id,
		_academic_session,
		_attendance_session_id
	} = useLocalSearchParams();

	const pathname = usePathname();

	const {
		displayToast,
		setLoadingPages,
		setIsLoading
	} = useAppStore.getState()

	const isLoading = useAppStore(state => state.isLoading);
	const keyboardHeight = useAppStore(state => state.keyboardHeight);
	const loadingPages = useAppStore(state => state.loadingPages)

	const user = useAuthStore(state => state.user);

	const scannedCard = useAppStore(state => state.scannedCard);
	const scannedCardTopic = useAppStore(state => state.scannedCardTopic);

	const durationRef = useRef<TextInput>(null)
	const [duration, setDuration] = useState<string>('')
	const [isFetchingCard, setIsFetchingCard] = useState<boolean>(false);

	const [userCoordinates, setUserCoordinates] = useState<Region | null>(null)

	const [attendeaseDeviceId, setAttendeaseDeviceId] = useState<string>('');

	const sheetRef = useRef<BottomSheetModal>(null);

	const openBottomSheet = () => {
		sheetRef.current?.present();
	}
	
	const closeBottomSheet = () => {
		sheetRef.current?.present();
	}

	const handleStartAttendance = () => {
		if (_attendance_session_id) return;
		setIsFetchingCard(true)
	}
	
	const hashPin = async (pin: string): Promise<string> => {
		const hashedPin = await Crypto.digestStringAsync(
			Crypto.CryptoDigestAlgorithm.SHA256,
			pin
		);

		return hashedPin;
	}

	// useEffect(() => {
	// 	hashPin()
	// }, [])

	useEffect(() => {
		if (pathname && !_attendance_session_id) {
			setLoadingPages([...loadingPages, pathname])
		}
	}, []);
	
	
	useEffect(() => {
		if (!isFetchingCard) return;
		const hanldePinVerification = async () => {
			try {
				if (scannedCardTopic === 'attendease/session' && scannedCard && scannedCard?.card_uid === user?.rfid) {
					console.log("🚀 ~ Attendance ~ user:", user?.rfid)
					// console.log("🚀 ~ useEffect ~ scannedCardTopic:", scannedCardTopic)
					// console.log("🚀 ~ Attendance ~ scannedCard:", scannedCard)
					
					if (!scannedCard?.pin) {
						throw new Error('Pin not found')
					}
					
					setAttendeaseDeviceId(scannedCard?.device_id)
					// setCardPin(scannedCard?.pin)
					
					console.log(typeof scannedCard?.pin)
					const hashedPin = await hashPin(scannedCard?.pin)
					console.log("🚀 ~ hanldePinVerification ~ hashedPin:", hashedPin)
					console.log("🚀 ~ Attendance ~ user:", user?.pin)
					console.log("")

					if (hashedPin !== user?.pin) {
						throw new Error('Invalid pin')
					}

					openBottomSheet()

					setTimeout(() => {
						durationRef.current?.focus();
					}, 1000);
				}
			} catch (error:any) {
				displayToast('ERROR', error?.message)		
			} finally {
				setIsFetchingCard(false);
			}
		}

		hanldePinVerification()
	}, [scannedCardTopic, scannedCard])

	    // get user/device location
    useEffect(() => {
        (async () => {
            try {
                let { status } = await Location.requestForegroundPermissionsAsync();
                // if ststus is not granted, exit map screen
                if (status === 'denied') {
                    
                    // Permission denied, show an alert to go to settings
                    Alert.alert(
                        'LocationObject Permission',
                        'LocationObject access was denied. Please go to settings and enable location permissions.',
                        [
                            { text: 'Cancel', style: 'cancel', onPress: router.back },
                            { text: 'Open Settings', onPress: () => Linking.openSettings() },
                        ]
                    );

                    return;
                }

                // get location
                const location = await Location.getCurrentPositionAsync({});

                // // // set initial coordinates
                setUserCoordinates({
                    latitude: location.coords.latitude, 
                    longitude: location.coords.longitude
                });

				// disable loading pages
				setLoadingPages(loadingPages.filter(item => item !== pathname))

            } catch (error: any) {
                displayToast('ERROR', error?.message);
            }
        })();
    }, []);

	const handleInitiateAttendance = async () => {
		try {
			setIsLoading(true);

			const isEnrolled = await LocalAuthentication.isEnrolledAsync();

			if (isEnrolled) {
				const authenticate = await LocalAuthentication.authenticateAsync()

				if (!authenticate.success) {
					throw new Error("Authentication failed");
				}
			}

			const createSessionResponse = await handleAttendanceSessions.create({
				lecturer_id: user?.id!,
				course_id: _course_id! as string,
				started_at: moment().toISOString(true),
				ended_at: moment().add(duration, 'hours').toISOString(true),
				latitude: userCoordinates?.latitude!,
				longitude: userCoordinates?.longitude!,
				academic_session: _academic_session as string,
			})
			console.log("🚀 ~ handleInitiateAttendance ~ createSessionResponse:", createSessionResponse)

			MQTTService.publish(`${attendeaseDeviceId}`, JSON.stringify(createSessionResponse.data.id))

			closeBottomSheet()

			router.back()
			
		} catch (error:any) {
			displayToast('ERROR', error?.message)
		} finally {
			setIsLoading(false);
		}
	}
	

	return (
		<React.Fragment>
			<Container
				height={HEIGHT - 100}
				width={WIDTH}
				backgroundColor={colors.white}
			>
				<FlashList
					data={[]}
					keyExtractor={item => item?.id}
					contentContainerStyle={{
						paddingHorizontal: 20
					}}
					ListHeaderComponent={
						<Flex
							gap={8}
							paddingTop={30}
						>
							<Flex
								alignSelf='stretch'
								flexDirection={'row'}
								justifyContent='space-between'
								alignItems='center'
							>
								<InterText
									fontSize={24}
									lineHeight={30}
									fontWeight={600}
								>
									{_course_code}
								</InterText>
								{_attendance_session_id && (
									<Flex
										paddingVertical={5}
										paddingHorizontal={10}
										backgroundColor="#27A55133"
										borderRadius={10}
									>
										<InterText
											color={"green"}
										>
											Active
										</InterText>
									</Flex>
								)}
							</Flex>
							<InterText
								fontSize={16}
								lineHeight={19}
								color={colors.subtext}
							>
								{_course_title}
							</InterText>
						</Flex>
					}
					estimatedItemSize={80}
					renderItem={({item}) => <></>}
					ListEmptyComponent={(
						<Flex
							height={HEIGHT/2}
							width={'100%'}
							justifyContent='center'
							alignItems='center'
						>
							<EmptyAttendanceIcon />
						</Flex>
					)}
				/>
			</Container>
			<FixedButton
				text={_attendance_session_id ? 'End attendance' : 'Start attendance'}
				onPress={handleStartAttendance}
			/>
			<CustomBottomSheet
				ref={sheetRef}
				closeBottomSheet={closeBottomSheet}
				sheetTitle='Start Session'
				snapPoints={[HEIGHT]}
				contentContainerStyle={{paddingBottom: 50 + keyboardHeight}}
			>
				<Flex
					paddingTop={70}
					paddingBottom={30}
					gap={20}
					width={'100%'}
					flex={1}
					// height={'100%'}
				>
					<Input
						ref={durationRef}
						label='Lecture duration(hrs)'
						placeholder='Enter lecture hours'
						keyboardType='numeric'
						defaultValue={duration}
						onChangeText={setDuration}
						width={WIDTH - 40}
					/>
				</Flex>
				<CustomButton
					text='Start'
					isLoading={isLoading}
					disabled={!duration}
					onPress={handleInitiateAttendance}
				/>
			</CustomBottomSheet>
			{isFetchingCard && (
				<Flex
					flex={1}
					width={'100%'}
					height={'100%'}
					justifyContent='center'
					alignItems='center'
					backgroundColor={colors.white}
					gap={20}
					style={{
						position: 'absolute',
						top: 0,
						left: 0,
					}}
				>
					<CardIcon width={60} height={60} />
					<Flex
						gap={10}
						justifyContent='center'
						alignItems='center'
					>
						<InterText
							fontWeight={600}
							fontSize={20}
							lineHeight={23}
						>
							Getting scannned Card
						</InterText>
						<InterText
							fontWeight={500}
							color={colors.label}
						>
							Scan card on Attendease device
						</InterText>
					</Flex>
					<ActivityIndicator color={colors.black} size={'large'} />
				</Flex>
			)}
		</React.Fragment>
	)
}

export default Attendance

const styles = StyleSheet.create({
	contentContainer: {
		flexGrow: 1,
		backgroundColor: 'white',
		paddingTop: 30,
		paddingHorizontal: 20,
		paddingBottom: 40,
	}
})