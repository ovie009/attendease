import { Keyboard, ScrollView, StyleSheet, TextInput } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { colors } from '@/utilities/colors'
import Flex from '@/components/Flex'
import { HEIGHT, WIDTH } from '@/utilities/dimensions'
import Input from '@/components/Input'
import CustomButton from '@/components/CustomButton'
import InterText from '@/components/InterText'
import SelectInput from '@/components/SelectInput'
import AntDesign from '@expo/vector-icons/AntDesign';
import { router, usePathname } from 'expo-router'
import { CameraView } from 'expo-camera'
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAppStore } from '@/stores/useAppStore'
import * as Device from 'expo-device';
import handleAuth from '@/api/handleAuth'
import handleStudents from '@/api/handleStudents'
import * as Crypto from 'expo-crypto';
import { Department } from '@/types/api'
import { AccountType, Level } from '@/types/general'
import { BottomSheetFlashList, BottomSheetModal } from '@gorhom/bottom-sheet'
import CustomBottomSheet from '@/components/CustomBottomSheet'
import handleDepartments from '@/api/handleDepartments'
import { handleDisableDataLoading } from '@/utilities/handleDisableDataLoading'
import { ListRenderItemInfo } from '@shopify/flash-list'
import OptionListItem from '@/components/OptionListItem'
import handleRfidCards from '@/api/handleRfidCards'
import { useAuthStore } from '@/stores/useAuthStore'

// Define the combined type for clarity
type SelectableDepartment = Department & { is_selected: boolean };

type SelectableLevel = {
	id: string,
	value: Level,
	is_selected: boolean
}

type BottomSheetContent = 'Select Department' | 'Select Level';


const Signup = () => {

	const pathname = usePathname();

	const {
		displayToast,
		setIsLoading,
		setLoadingPages,
	} = useAppStore.getState();

	const {
		setUser,
	} = useAuthStore.getState()

	const isLoading = useAppStore(state => state.isLoading);

	const loadingPages = useAppStore(state => state.loadingPages)
	
	useEffect(() => {
		if (pathname) {
			setLoadingPages([...loadingPages, pathname])
		}
	}, []);

	const scrollRef = useRef<ScrollView>(null)

	
	const [email, setEmail] = useState<string>('');
	const emailRef = useRef<TextInput>(null)
	
	const [password, setPassword] = useState<string>('');
	const passwordRef = useRef<TextInput>(null)
	
	const [fullName, setFullName] = useState<string>('');
	const [matricNumber, setMatricNumber] = useState<string>('');


	const [departments, setDepartments] = useState<SelectableDepartment[]>([]);
	const [departmentName, setDepartmentName] = useState<string>('');
	const [departmentId, setDepartmentId] = useState<string>('');

	const [level, setLevel] = useState<Level | null>(null);
	const [levelOptions, setLevelOptions] = useState<SelectableLevel[]>([]);

	const [cardId, setCardId] = useState<string>('');

	const [pin, setPin] = useState<string>('')

	const [step, setStep] = useState<number>(1);

	// console.log('device', Device.manufacturer, Device.modelName, Device.brand)
	const DEVICE_ID = Device.manufacturer+''+Device.brand+''+Device.modelName;

	const [dataLoading, setDataLoading] = useState<{departments: boolean}>({
		departments: true,
	})

	useEffect(() => {
		if (!departmentId) return;

		const foundDepartment = departments.find(item => item.id === departmentId);

		const courseDuration: number | undefined = foundDepartment?.course_duration;

		if (!courseDuration) return;
		const levelsArray: any = Array.from({ length: courseDuration }, (_, index: number) => ({
			id: `level-${index + 1}`,
			value: (index + 1)*100,
			is_selected: false,
		}));
		// console.log("🚀 ~ levelsArray ~ levelsArray:", levelsArray);

		if (level && levelOptions.some(item => item.value === level)) {
			setLevelOptions(levelsArray.map((item: SelectableLevel) => {
				if (item.value === level) {
					return {
						...item,
						is_selected: true
					}
				}
				return item;
			}))
		} else {
			setLevelOptions(levelsArray)

			setLevel(null)
		}

		// foundDepartment.
	}, [departmentId])

	const sheetRef = useRef<BottomSheetModal>(null);
	const [sheetParameters, setSheetParameters] = useState<{snapPoints: [string | number], content: BottomSheetContent}>({
		snapPoints: ['50%'],
		content: 'Select Department',
	})

	const openBottomSheet = useCallback((content: BottomSheetContent) => {
		Keyboard.dismiss()
		const minHeight = 130;
		const listItemHieght = 60;

		if (content === 'Select Level' && !departmentId) {
			displayToast('ERROR', 'Please select a department first')
			return;
		}

		let height = 0;
		if (content === 'Select Department') {
			height = Math.min(HEIGHT, minHeight + listItemHieght*departments.length);
		} else if (content === 'Select Level') {
			height = Math.min(HEIGHT, minHeight + listItemHieght*levelOptions.length);
		}

		setSheetParameters({
			snapPoints: [height],
			content,
		})

		sheetRef?.current?.present();
	}, [departments, levelOptions, departmentId])

	const closeBottomSheet = () => {
		sheetRef?.current?.close();
	}
	

	useEffect(() => {
		// (async () => )
		const fetchDepartments = async () => {
			try {
				const departmentsResponse = await handleDepartments.getAll();

				if (departmentsResponse.isSuccessful) {
					setDepartments(departmentsResponse.data.map(item => ({...item, is_selected: false})))
				}
				// console.log("🚀 ~ fetchDepartments ~ departmentsResponse.data:", departmentsResponse.data)
			} catch (error: any) {
				displayToast('ERROR', error?.message)
			} finally {
				handleDisableDataLoading('departments', setDataLoading)
			}
		}

		fetchDepartments();
			
	}, [])

	useEffect(() => {
		if (!dataLoading.departments) {
			// disable loading pages
			setLoadingPages(loadingPages.filter(item => item !== pathname))
		}
	}, [dataLoading.departments])

	const handleSelectDepartment = useCallback((id: string): void => {
		// console.log("🚀 ~ handleSelectDepartment ~ id:", id)
		// console.log("🚀 ~ handleSelectDepartment ~ departments:", departments)
		// This check ensures that 'find' below will succeed.
		if (departments.some(item => item.id === id)) {
			// Add '!' after find(...) to assert it's not null/undefined
			const foundDepartment = departments.find((item) => item.id === id)!;
			setDepartmentName(foundDepartment.department_name); // Now TypeScript knows foundLecturer is Lecturer, not Lecturer | undefined

			setDepartmentId(id);

			// update lecturer list
			setDepartments(prevState => {
				return prevState.map(item => {
					if (item.id === id) {
						return {
							...item,
							is_selected: true,
						}
					}
					return {
						...item,
						is_selected: false,
					}
				})
			})

			closeBottomSheet()
		}
		// Optional: Handle the else case if needed, though 'some' prevents it here.
		// else { console.warn(`Lecturer with id ${id} not found unexpectedly.`); }
	}, [departments]); // <-- Add setDean to dependencies

	const handleSelectLevel = useCallback((id: string): void => {
		// This check ensures that 'find' below will succeed.
		if (levelOptions.some(item => item.id === id)) {
			// Add '!' after find(...) to assert it's not null/undefined
			const foundValue = levelOptions.find((item) => item.id === id)!;
			setLevel(foundValue.value); // Now TypeScript knows foundLecturer is Lecturer, not Lecturer | undefined

			// update lecturer list
			setLevelOptions(prevState => {
				return prevState.map(item => {
					if (item.id === id) {
						return {
							...item,
							is_selected: true,
						}
					}
					return {
						...item,
						is_selected: false,
					}
				})
			})

			closeBottomSheet()
		}
		// Optional: Handle the else case if needed, though 'some' prevents it here.
		// else { console.warn(`Lecturer with id ${id} not found unexpectedly.`); }
	}, [levelOptions]); // <-- Add setDean to dependencies

	const renderDepartmentItem = useCallback(({item}: ListRenderItemInfo<SelectableDepartment>) => (
		<OptionListItem
			id={item?.id}
			text={item?.department_name}
			isSelected={item?.is_selected}
			onPress={() => {
				handleSelectDepartment(item.id)
			}}
		/>
	), [handleSelectDepartment]);

	const renderLevelItem = useCallback(({item}: ListRenderItemInfo<SelectableLevel>) => (
		<OptionListItem
			id={item?.id}
			text={item?.value ? `${item.value} level` : ""}
			isSelected={item?.is_selected}
			onPress={() => {
				handleSelectLevel(item.id)
			}}
		/>
	), [handleSelectLevel]);

	useEffect(() => {
		if (!cardId) return;
		console.log("🚀 ~ useEffect ~ cardId:", cardId)
		const signupUser = async () => {
			try {
				if (!level) throw new Error('Please select a level')

				scrollRef.current?.scrollTo({
					x: WIDTH,
					y: 0,
					animated: true
				})

				setIsLoading(true);

				// chekc if card exist
				const cardResponse = await handleRfidCards.getByCardUid(cardId)
				console.log("🚀 ~ signupUser ~ cardId:", cardId)
				console.log("🚀 ~ signupUser ~ cardResponse:", cardResponse)

				if (!cardResponse.data) {
					throw new Error('card doesn\'t exist');
				}

				if (cardResponse.data?.lecturer_id || cardResponse.data?.student_id) {
					throw new Error('card already in use');
				}

				if (!level) {
					throw new Error('Please select a level');
				}

				const createUserResponse = await handleAuth.signup({
					email,
					password,
					data: {
						account_type: AccountType.Student,
						full_name: fullName,
						email_verified: true
					}
				})

				await handleAuth.login({
					email,
					password
				})

				if (!createUserResponse?.data?.user) {
					throw new Error('Failed to create user')
				}

				const hashedPin = await Crypto.digestStringAsync(
					Crypto.CryptoDigestAlgorithm.SHA256,
					password
				);
				// console.log("🚀 ~ signupUser ~ createUserResponse:", createUserResponse)

				const createStudentResponse = await handleStudents.create({
					id: createUserResponse?.data?.user?.id,
					level,
					email,
					full_name: fullName,
					matric_number: matricNumber,
					department_id: departmentId,
					rfid: cardId,
					pin: hashedPin,
					device_id: DEVICE_ID
				})

				setUser({
					...createStudentResponse?.data,
					account_type: AccountType.Student,
					is_admin: false,
				})

			} catch (error:any) {
				displayToast('ERROR', error?.message)
			} finally {
				setIsLoading(false);
				setCardId('')
			}
		};

		signupUser()
	}, [cardId])
 
	return (
		<React.Fragment>
			<Flex
				paddingHorizontal={20}
				backgroundColor={colors.white}
				paddingTop={20}
				paddingBottom={10}
				flexDirection='row'
				gap={34}
			>
				<Flex
					paddingBottom={5}
					style={{
						borderBottomColor: step === 1 ? colors.primary : colors.subtext,
						borderBottomWidth: 2
					}}
				>
					<InterText
						fontWeight={600}
						fontSize={12}
						color={step === 1 ? colors.primary : colors.subtext}
					>
						Login Credential
					</InterText>
				</Flex>
				<Flex
					paddingBottom={5}
					style={{
						borderBottomColor: step === 2 ? colors.primary : colors.subtext,
						borderBottomWidth: 2
					}}
				>
					<InterText
						fontWeight={600}
						fontSize={12}
						color={step === 2 ? colors.primary : colors.subtext}
					>
						Personal Information
					</InterText>
				</Flex>
				<Flex
					paddingBottom={5}
					style={{
						borderBottomColor: step === 3 ? colors.primary : colors.subtext,
						borderBottomWidth: 2
					}}
				>
					<InterText
						fontWeight={600}
						fontSize={12}
						color={step === 3 ? colors.primary : colors.subtext}
					>
						Scan QR Code
					</InterText>
				</Flex>
			</Flex>
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
				// scrollEnabled={false}
			>
				<Flex
					flexDirection='row'
					// width={WIDTH}
				>
					<Flex
						width={WIDTH}
						paddingHorizontal={20}
						paddingBottom={50}
					>
						<Flex
							flex={1}
							gap={20}
						>
							<Input
								ref={emailRef}
								label='Email'
								width={WIDTH - 40}
								aria-label='Email'
								placeholder='Ove@email.com'
								defaultValue={email}
								onChangeText={setEmail}
								returnKeyType='next'
								onSubmitEditing={() => passwordRef.current?.focus()}
							/>
							<Input
								ref={passwordRef}
								label='Password'
								aria-label='Password'
								isPasswordInput={true}
								width={WIDTH - 40}
								placeholder='Password'
								defaultValue={password}
								onChangeText={setPassword}
							/>
						</Flex>
						<CustomButton
							text='Continue'
							disabled={!email || !password}
							onPress={() => {
								scrollRef.current?.scrollTo({
									x: WIDTH,
									y: 0,
									animated: true
								})

								setStep(2)
							}}
						/>
					</Flex>
					<Flex
						width={WIDTH}
						paddingHorizontal={20}
						gap={20}
						paddingBottom={50}
					>
						<Flex
							flex={1}
							gap={20}
						>
							<Input
								label='Full name'
								aria-label='Full name'
								width={WIDTH - 40}
								placeholder='John Spencer'
								defaultValue={fullName}
								onChangeText={setFullName}
							/>
							<Input
								label='Matric number'
								aria-label='Matric number'
								width={WIDTH - 40}
								placeholder='COS/1352/2022'
								defaultValue={matricNumber}
								onChangeText={setMatricNumber}
							/>
							<SelectInput
								label='Department'
								value={departmentName}
								placeholder='Select department'
								onPress={() => {
									openBottomSheet('Select Department')
								}}
							/>
							<SelectInput
								label='Level'
								value={level || ''}
								placeholder='Select level'
								onPress={() => {
									openBottomSheet('Select Level')
								}}
							/>
							<Input
								label='Pin'
								width={WIDTH - 40}
								placeholder='1234'
								isPasswordInput={true}
								defaultValue={pin}
								onChangeText={setPin}
							/>
						</Flex>
						<CustomButton
							text='Scan card QR Code'
							Icon={<AntDesign name="qrcode" size={24} color="white" />}
							isLoading={isLoading}
							disabled={!email || !password || !fullName || !matricNumber || !level || !departmentId || !pin}
							// onPress={handleContinue}
							onPress={() => {
								scrollRef.current?.scrollTo({
									x: WIDTH*2,
									y: 0,
									animated: true
								})

								setStep(3)
							}}
						/>
					</Flex>
					<Flex
						width={WIDTH}
						height={'100%'}
					>
						{step === 3 && (
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
									scrollRef.current?.scrollTo({
										x: WIDTH,
										y: 0,
										animated: true
									})

									setStep(2)

									displayToast('ERROR', 'Invalid QR code')
								}}
								barcodeScannerSettings={{
									barcodeTypes: ["qr"],
								}}
							>
								<Ionicons name="scan-outline" size={400} color="white" />
							</CameraView>
						)}
					</Flex>
				</Flex>
			</ScrollView>

		<CustomBottomSheet
			ref={sheetRef}
			sheetTitle={sheetParameters.content}
			snapPoints={sheetParameters.snapPoints}
			closeBottomSheet={closeBottomSheet}
		>
			{sheetParameters.content === 'Select Department' && (
				<BottomSheetFlashList
					data={departments}
					keyExtractor={(item) => item.id}
					contentContainerStyle={{paddingTop: 50}}
					estimatedItemSize={81}
					renderItem={renderDepartmentItem}
				/>
			)}
			{sheetParameters.content === 'Select Level' && (
				<BottomSheetFlashList
					data={levelOptions}
					keyExtractor={(item) => item.id}
					contentContainerStyle={{paddingTop: 50}}
					estimatedItemSize={81}
					renderItem={renderLevelItem}
				/>
			)}
		</CustomBottomSheet>
		</React.Fragment>
	)
}

export default Signup

const styles = StyleSheet.create({})