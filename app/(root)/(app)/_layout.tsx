// ./app/(app)/_layout.tsx
import React, { useEffect, useState } from 'react';
import { ExternalPathString, Redirect, RelativePathString, Stack } from 'expo-router';
import { useAuthStore } from '@/stores/useAuthStore';
import { colors } from '@/utilities/colors';
import InterText from '@/components/InterText';
import CardIcon from '@/assets/svg/CardIcon.svg';
import DepartmentIcon from '@/assets/svg/DepartmentIcon.svg';
import CourseIcon from '@/assets/svg/CourseIcon.svg';
import CollegeIcon from '@/assets/svg/CollegeIcon.svg';
import SessionIcon from '@/assets/svg/SessionIcon.svg';
import LecturerIcon from '@/assets/svg/LecturerIcon.svg';
import ScheduleIcon from '@/assets/svg/ScheduleIcon.svg';
import { View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AntDesign from '@expo/vector-icons/AntDesign';
import * as Device from 'expo-device';
import { AccountType } from '@/types/general';
import Flex from '@/components/Flex';
import CustomButton from '@/components/CustomButton';
import { useAppStore } from '@/stores/useAppStore';
import { CameraView } from 'expo-camera';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as LocalAuthentication from 'expo-local-authentication';
import handleStudents from '@/api/handleStudents';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { supabase } from '@/lib/supabase';


export default function AppLayout() {

    const session = useAuthStore((state) => state.session);
    const user = useAuthStore((state) => state.user);
    const signOut = useAuthStore((state) => state.signOut);
    const setUser = useAuthStore((state) => state.setUser);
    const isFirstLaunch = useAuthStore((state) => state.isFirstLaunch);
	const isLoading = useAppStore(state => state.isLoading);
	const isLoadingSecondary = useAppStore(state => state.isLoadingSecondary);

	const {
		setIsLoading,
		setIsLoadingSecondary,
		displayToast
	} = useAppStore.getState();

	const DEVICE_ID = Device.manufacturer+''+Device.brand+''+Device.modelName;

	const [isScanning, setIsScanning] = useState(false);

	const handleScanAuthorisation = () => {
	  
	}

	const [scannedData, setScannedData] = useState<string>('');

	const handleLogout = async () => {
		try {
			setIsLoadingSecondary(true)

			// Optional: Show loading state
			// const { error } = await supabase.auth.signOut();
			// if (error) {
			// 	console.error('Error logging out:', error);
			// 	throw error;
			// }
			await signOut()
				// Auth listener in root layout will handle redirect
		} catch (error:any) {
			displayToast('ERROR', error?.message)
		} finally {
			setIsLoadingSecondary(false)
		}
	};

	useEffect(() => {
		if (!scannedData) return;
		const updateCard = async () => {
			try {
				if (!user) {
					return;
				}
				
				setIsLoading(true)
				console.log("🚀 ~ AppLayout ~ scannedData:", scannedData)

				const isEnrolled = await LocalAuthentication.isEnrolledAsync();

				if (isEnrolled) {
					const authenticate = await LocalAuthentication.authenticateAsync()

					if (!authenticate.success) {
						throw new Error("Authentication failed");
					}
				}

				await handleStudents.updateDeviceId({
					p_auth_string: scannedData,
					p_device_id: DEVICE_ID,
					p_student_id: user?.id
				})

				// const userResponse = await handleStudents.updateStudent({
				// 	id: user?.id,
				// 	device_id: DEVICE_ID
				// })

				displayToast('SUCCESS', 'Device updated successfully')

				setUser({
					...user,
					device_id: DEVICE_ID,
				})

			} catch (error:any) {
				displayToast('ERROR', error?.message)
			} finally {
				setScannedData('')
				setIsLoading(false)
			}
		};

		updateCard()
	}, [scannedData])
	
    // If it's the first launch, the root layout handles redirecting to index
    if (isFirstLaunch) {
        // Should be handled by root, but as a safety net
      return <Redirect href={"/" as ExternalPathString} />;
    }

    // If the user is not signed in, redirect away from the app group
    if (!session) {
      // Redirect to the login screen
      return <Redirect href={"/(root)/(auth)/login" as RelativePathString} />;
    }

    // Render the child route within the authenticated group (tabs, settings)
    return (
		<React.Fragment>
			<Stack
				screenOptions={{
					headerShadowVisible: false,
				}}
			>
				<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
				<Stack.Screen 
					name="(card)" 
					options={{ 
						title: "", 
						headerShown: true, 
						headerShadowVisible: false,
					}}
				/>
				<Stack.Screen 
					name="(college)" 
					options={{ 
						title: "", 
						headerShown: true, 
						headerShadowVisible: false,				}}
				/>
				<Stack.Screen 
					name="(session)" 
					options={{ 
						title: "", 
						headerShown: false,
						headerShadowVisible: false,
					}}
				/>
				<Stack.Screen 
					name="(department)" 
					options={{ 
						title: '',
						headerShown: true, 
						headerShadowVisible: false,
					}}
				/>
				<Stack.Screen 
					name="(course)" 
					options={{ 
						title: '',
						headerShown: true, 
						headerShadowVisible: false,
					}}
				/>
				<Stack.Screen 
					name="(lecturer)" 
					options={{ 
						title: '',
						headerShown: true, 
						headerShadowVisible: false,
					}}
				/>
				<Stack.Screen 
					name="(admin)" 
					options={{ 
						title: '',
						headerShown: true, 
						headerShadowVisible: false,
					}}
				/>
				<Stack.Screen 
					name="(schedule)" 
					options={{ 
						title: '',
						headerShown: false, 
						headerShadowVisible: false,
					}}
				/>
				<Stack.Screen 
					name="college" 
					options={{ 
						title: "", 
						headerShown: true, 
						headerShadowVisible: false,
					}}
				/>
				<Stack.Screen 
					name="department" 
					options={{ 
						title: "", 
						headerShown: true, 
						headerShadowVisible: false,
					}}
				/>
				<Stack.Screen 
					name="course" 
					options={{ 
						title: "", 
						headerShown: true, 
						headerShadowVisible: false,
					}}
				/>

				<Stack.Screen 
					name="lecturer" 
					options={{ 
						title: "", 
						headerShown: false, 
						headerShadowVisible: false,
					}}
				/>
				
				<Stack.Screen 
					name="records" 
					options={{ 
						title: "", 
						headerShown: false, 
						headerShadowVisible: false,
					}}
				/>
				<Stack.Screen 
					name="session" 
					options={{
						headerBackVisible: false,
						headerBackTitle: "",
						headerTitle: () => <InterText fontSize={32} fontWeight={600} lineHeight={35}>Session</InterText>,
						headerLeft: () => <View style={{marginRight: 6}}><SessionIcon width={40} height={40}/></View>,
					}} 
				/>
				<Stack.Screen 
					name="attendance" 
					options={{
						headerBackVisible: false,
						headerBackTitle: "",
						headerTitle: () => <InterText fontSize={32} fontWeight={600} lineHeight={35}>Attendance</InterText>,
						headerLeft: () => <View style={{marginRight: 6}}><SessionIcon width={40} height={40}/></View>,
					}} 
				/>
				<Stack.Screen 
					name="cards" 
					options={{
						headerBackVisible: false,
						headerBackTitle: "",
						headerLeft: () => <View style={{marginRight: 6}}><CardIcon width={40} height={40}/></View>,
						headerTitle: () => <InterText fontSize={32} fontWeight={600} lineHeight={35}>Cards</InterText>,
					}} 
				/>
				<Stack.Screen 
					name="colleges"
					options={{
						headerTintColor: colors.black,
						headerBackTitle: "",
						headerLeft: () => <View style={{marginRight: 6}}><CollegeIcon width={40} height={40}/></View>,
						headerTitle: () => <InterText fontSize={32} fontWeight={600} lineHeight={35}>Colleges</InterText>,
					}} 
				/>
				<Stack.Screen 
					name="courses"
					options={{
						headerBackTitle: "",
						headerTintColor: colors.black,
						headerLeft: () => <View style={{marginRight: 6}}><CourseIcon width={40} height={40}/></View>,
						headerTitle: () => <InterText fontSize={32} fontWeight={600} lineHeight={35}>Courses</InterText>,
					}} 
				/>
				<Stack.Screen 
					name="departments"
					options={{
						headerBackTitle: "",
						headerTintColor: colors.black,
						headerLeft: () => <View style={{marginRight: 6}}><DepartmentIcon width={40} height={40}/></View>,
						headerTitle: () => <InterText fontSize={32} fontWeight={600} lineHeight={35}>Departments</InterText>,
					}} 
				/>
				<Stack.Screen 
					name="lecturers"
					options={{
						headerTintColor: colors.black,
						headerBackTitle: "",
						headerLeft: () => <View style={{marginRight: 6}}><LecturerIcon width={40} height={40}/></View>,
						headerTitle: () => <InterText fontSize={32} fontWeight={600} lineHeight={35}>Lecturers</InterText>,
					}} 
				/>

				<Stack.Screen 
					name="schedules"
					options={{
						headerTintColor: colors.black,
						headerBackTitle: "",
						headerLeft: () => <View style={{marginRight: 6}}><ScheduleIcon width={40} height={40}/></View>,
						headerTitle: () => <InterText fontSize={32} fontWeight={600} lineHeight={35}>Schedules</InterText>,
					}} 
				/>

				<Stack.Screen 
					name="changePin"
					options={{
						headerTintColor: colors.black,
						headerBackTitle: "",
						headerLeft: () => <View style={{marginRight: 6}}><FontAwesome5 name="key" size={20} color={colors.primary} /></View>,
						headerTitle: () => <InterText fontSize={32} fontWeight={600} lineHeight={35}>Change Pin</InterText>,
					}} 
				/>

				<Stack.Screen 
					name="changePassword"
					options={{
						headerTintColor: colors.black,
						headerBackTitle: "",
						headerLeft: () => <View style={{marginRight: 6}}><MaterialIcons name="password" size={40} color={colors.primary} /></View>,
						headerTitle: () => <InterText fontSize={32} fontWeight={600} lineHeight={35}>Change Password</InterText>,
					}} 
				/>

				<Stack.Screen 
					name="support"
					options={{
						headerTintColor: colors.black,
						headerBackTitle: "",
						headerLeft: () => <View style={{marginRight: 6}}><MaterialIcons name="support-agent" size={40} color={colors.primary} /></View>,
						headerTitle: () => <InterText fontSize={32} fontWeight={600} lineHeight={35}>Get Help</InterText>,
					}} 
				/>

				<Stack.Screen 
					name="tickets"
					options={{
						headerTintColor: colors.black,
						headerBackTitle: "",
						headerLeft: () => <View style={{marginRight: 6}}><Ionicons name="ticket-outline" size={44} color={colors.primary} /></View>,
						headerTitle: () => <InterText fontSize={32} fontWeight={600} lineHeight={35}>Tickets</InterText>,
					}} 
				/>

				<Stack.Screen 
					name="completeRegistration"
					options={{
						headerTintColor: colors.black,
						headerBackTitle: "",
						headerTitle: () => <InterText fontSize={32} fontWeight={600} lineHeight={35}>Complete Registration</InterText>,
					}} 
				/>

				<Stack.Screen 
					name="registerCourse"
					options={{
						headerTintColor: colors.black,
						headerBackTitle: "",
						headerTitle: () => <InterText fontSize={32} fontWeight={600} lineHeight={35}>Course Registration</InterText>,
					}} 
				/>

				<Stack.Screen 
					name="changeCard"
					options={{
						headerBackTitle: "",
						headerTintColor: colors.black,
						headerLeft: () => <View style={{marginRight: 6}}><AntDesign name='creditcard' size={40} color={colors.primary} /></View>,
						headerTitle: () => <InterText fontSize={32} fontWeight={600} lineHeight={35}>Change card</InterText>,
					}} 
				/>

				<Stack.Screen 
					name="authoriseStudent"
					options={{
						headerBackTitle: "",
						headerTintColor: colors.black,
						headerLeft: () => <View style={{marginRight: 6}}><AntDesign name="unlock" size={40} color={colors.primary} /></View>,
						headerTitle: () => <InterText fontSize={32} fontWeight={600} lineHeight={35}>Authorise student</InterText>,
					}} 
				/>
			</Stack>
			{(user && user?.account_type === AccountType.Student && user?.device_id && DEVICE_ID !== user?.device_id) && (
				<Flex
					flex={1}
					height={'100%'}
					width={'100%'}
					backgroundColor={colors.white}
					// paddingTop={50}
					justifyContent='center'
					alignItems='center'
					// paddingHorizontal={20}
					style={{
						position: 'absolute',
						top: 0,
						left: 0,
						zIndex: 100,
						display: 'none'
					}}
				>
					{!isScanning ? (
						<React.Fragment>
							<Flex
								gap={20}
								justifyContent='center'
								alignItems='center'
								paddingBottom={30}
								paddingHorizontal={20}
							>
								<InterText
									fontWeight={500}
									fontSize={30}
									lineHeight={40}
								>
									New device detected
								</InterText>
								<InterText
									textAlign='center'
								>
									Go back to your old device or meet a lecturer to authorise use of new device
								</InterText>
							</Flex>
							<Flex
								paddingHorizontal={20}
								width={'100%'}
								gap={20}
							>
								<CustomButton
									text='Authorise device'
									isLoading={isLoading}
									onPress={() => {
										setIsScanning(true)
									}}
								/>
								<CustomButton
									text='Logout'
									isSecondary={true}
									isLoading={isLoadingSecondary}
									onPress={handleLogout}
								/>
							</Flex>
						</React.Fragment>
					) : (
						<React.Fragment>
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
										setScannedData(data.replace(`${baseUrl}?`, ''))
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
						</React.Fragment>
					)}
				</Flex>
			)}
		</React.Fragment>
	);
}