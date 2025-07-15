import { Keyboard, ScrollView, StyleSheet, TextInput, View } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { colors } from '@/utilities/colors'
import CustomButton from '@/components/CustomButton'
import { HEIGHT, WIDTH } from '@/utilities/dimensions'
import FixedWrapper from '@/components/FixedWrapper'
import Input from '@/components/Input'
import SelectInput from '@/components/SelectInput'
import CustomBottomSheet from '@/components/CustomBottomSheet'
import { BottomSheetFlashList, BottomSheetModal } from '@gorhom/bottom-sheet'
import { Course, Department, RfidCard } from '@/types/api'
import OptionListItem from '@/components/OptionListItem'
import { ListRenderItemInfo } from '@shopify/flash-list'
import { useLocalSearchParams, usePathname, useRouter } from 'expo-router'
import { handleDisableDataLoading } from '@/utilities/handleDisableDataLoading'
import { useAppStore } from '@/stores/useAppStore'
import handleDepartments from '@/api/handleDepartments'
import { Role } from '@/types/general'
import handleLecturers from '@/api/handleLecturers'
import handleRfidCards from '@/api/handleRfidCards'
import Flex from '@/components/Flex'
import Container from '@/components/Container'
import handleCourses from '@/api/handleCourses'

// Define the combined type for clarity
type SelectableDepartment = Department & { is_selected: boolean };
type SelectableRfidCard = RfidCard & { is_selected: boolean };
type SelectableRole = {
	id: string,
	title: Role,
	is_selected: boolean
}
type BottomSheetContent = 'Select Department' | 'Select Role' | 'Select Card' | 'Select Course';

type SelectableCourse = Course & {
	is_selected: boolean;
};

const AddLecturer = () => {

	const router = useRouter();
    const pathname = usePathname();

	const {
		_department_id,
	} = useLocalSearchParams();

	const {
		setIsLoading,
		displayToast,
        setLoadingPages,
	} = useAppStore.getState();

	const isLoading = useAppStore(state => state.isLoading);
	const keyboardHeight = useAppStore(state => state.keyboardHeight);
    const loadingPages = useAppStore(state => state.loadingPages)
    
    useEffect(() => {
        if (pathname) {
            setLoadingPages([...loadingPages, pathname])
        }
    }, []);

	const [dataLoading, setDataLoading] = useState<{departments: boolean, rfid_cards: boolean, courses: boolean}>({
		departments: true,
        rfid_cards: true,
		courses: true,
	})

    const [fullName, setFullName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const emailRef = useRef<TextInput>(null)
	const [departments, setDepartments] = useState<SelectableDepartment[]>([]);
	const [departmentName, setDepartmentName] = useState<string>('');
	const [departmentId, setDepartmentId] = useState<string>('');
	const [role, setRole] = useState<Role>('Academic')
	const [rfid, setRfid] = useState<string>('');
    const [rfidCards, setRfidCards] = useState<SelectableRfidCard[]>([])

		// list of collegs
	const [courses, setCourses] = useState<SelectableCourse[]>([]);
	const [courseIds, setCourseIds] = useState<string[]>([]) // [courseIds]
	const [courseNames, setCourseNames] = useState<string[]>([])


	const [roles, setRoles] = useState<SelectableRole[]>([
		{
			id: '1',
			title: 'Academic',
			is_selected: true,
		},
		{
			id: '2',
			title: 'Dean',
			is_selected: false,
		},
		{
			id: '3',
			title: 'HOD',
			is_selected: false,
		},
	])

	const sheetRef = useRef<BottomSheetModal>(null);
	const [sheetParameters, setSheetParameters] = useState<{snapPoints: [string | number], content: BottomSheetContent}>({
		snapPoints: ['50%'],
		content: 'Select Department',
	})

	const openBottomSheet = useCallback((content: BottomSheetContent) => {
		const minHeight = 130;
		const listItemHieght = 60;

		Keyboard.dismiss()

		if (content === 'Select Course' && departmentId === '') {
			displayToast('ERROR', "Please select a department first")
			return;
		}

		let height = 0;
		if (content === 'Select Department') {
			height = Math.min(HEIGHT, minHeight + listItemHieght*departments.length);
		} else if (content === 'Select Role') {
			height = Math.min(HEIGHT, minHeight + listItemHieght*roles.length);
		} else if (content === 'Select Course') {
			height = HEIGHT;
		} else {
			height = Math.min(HEIGHT, minHeight + listItemHieght*rfidCards.length);
        }

		setSheetParameters({
			snapPoints: [height],
			content,
		})

		sheetRef?.current?.present();
	}, [roles, departments])

	const closeBottomSheet = () => {
		sheetRef?.current?.close();
	}
	

	useEffect(() => {
		// (async () => )
		const fetchDepartments = async () => {
			try {
				const departmentsResponse = await handleDepartments.getAll();

				if (departmentsResponse.isSuccessful) {
					setDepartments(departmentsResponse.data.map(item => ({...item, is_selected: item?.id === _department_id})))

					if (_department_id) {
						const foundDepartment = departmentsResponse.data.find((item) => item.id === _department_id)!;
						setDepartmentName(foundDepartment.department_name); // Now TypeScript knows foundLecturer is Lecturer, not Lecturer | undefined

						setDepartmentId(_department_id as string);
					}
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
		// (async () => )
		const fetchRfidCards = async () => {
			try {
				const rfidCardsResponse = await handleRfidCards.getUnassignedLecturerCards();
				console.log("🚀 ~ fetchRfidCards ~ rfidCardsResponse:", rfidCardsResponse)

				if (rfidCardsResponse.isSuccessful) {
					setRfidCards(rfidCardsResponse.data.map(item => ({...item, is_selected: false})))
				}
			} catch (error: any) {
				displayToast('ERROR', error?.message)
			} finally {
				handleDisableDataLoading('rfid_cards', setDataLoading)
			}
		}

		fetchRfidCards();
	}, [])

	useEffect(() => {
		if (!departmentId) return;
		const fetchCourses = async () => {
			try {
				setDataLoading({...dataLoading, courses: true})

				const courseResponse = await handleCourses.getByDepartmentId(departmentId);
				
				setCourses(courseResponse.data.map(item => ({...item, is_selected: false})))

			} catch (error: any) {
				displayToast('ERROR', error?.message)
			} finally {
				handleDisableDataLoading('courses', setDataLoading)
			}
		}

		fetchCourses();
			
	}, [departmentId])

    useEffect(() => {
        if (!dataLoading.departments && !dataLoading.rfid_cards) {
            // disable loading pages
            setLoadingPages(loadingPages.filter(item => item !== pathname))
        }
    }, [dataLoading.departments, dataLoading.rfid_cards])

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
	
	const handleSelectRole = useCallback((id: string): void => {
		// This check ensures that 'find' below will succeed.
		if (roles.some(item => item.id === id)) {
			// Add '!' after find(...) to assert it's not null/undefined
			const foundRole = roles.find((item) => item.id === id)!;
			setRole(foundRole.title); // Now TypeScript knows foundLecturer is Lecturer, not Lecturer | undefined

			// update lecturer list
			setRoles(prevState => {
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
	}, [roles]); // <-- Add setDean to dependencies

	const handleSelectCard = useCallback((id: string): void => {
		// This check ensures that 'find' below will succeed.
		if (rfidCards.some(item => item.id === id)) {
			// Add '!' after find(...) to assert it's not null/undefined
			const foundCard = rfidCards.find((item) => item.id === id)!;
			setRfid(foundCard.card_uid); // Now TypeScript knows foundLecturer is Lecturer, not Lecturer | undefined

			// update lecturer list
			setRfidCards(prevState => {
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
	}, [rfidCards]); // <-- Add setDean to dependencies

	const handleSelectCourse = useCallback((id: string): void => {
		console.log("🚀 ~ handleSelectCourse ~ id:", id)
		// This check ensures that 'find' below will succeed.
		if (courses.some(item => item.id === id)) {
			// Add '!' after find(...) to assert it's not null/undefined

			// update lecturer list
			setCourses(prevState => {
				return prevState.map(item => {
					if (item.id === id) {
						return {
							...item,
							is_selected: !item.is_selected,
						}
					}
					return item;
				})
			})
		}
		// Optional: Handle the else case if needed, though 'some' prevents it here.
		// else { console.warn(`Lecturer with id ${id} not found unexpectedly.`); }
	}, [courses]); // <-- Add setDean to dependencies

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

	const renderRoleItem = useCallback(({item}: ListRenderItemInfo<SelectableRole>) => (
		<OptionListItem
			id={item?.id}
			text={item?.title}
			isSelected={item?.is_selected}
			onPress={() => {
				handleSelectRole(item.id)
			}}
		/>
	), [handleSelectRole]);

	const renderCardItem = useCallback(({item}: ListRenderItemInfo<SelectableRfidCard>) => (
		<OptionListItem
			id={item?.id}
			text={item?.card_uid}
			isSelected={item?.is_selected}
			onPress={() => {
				handleSelectCard(item.id)
			}}
		/>
	), [handleSelectCard]);

	const renderCourseItem = useCallback(({item}: ListRenderItemInfo<SelectableCourse>) => (
		<OptionListItem
			id={item?.id}
			text={item?.course_code}
			subtext={item?.course_title}
			isSelected={item?.is_selected}
			onPress={() => {
				handleSelectCourse(item.id)
			}}
		/>
	), [handleSelectCourse]);

	const handleCreateDepartment = async () => {
		try {
			setIsLoading(true);

            const lecturerResponse = await handleLecturers.addLecturer({
                email,
                full_name: fullName,
                department_id: departmentId,
                role,
                rfid,
				course_ids: courseIds,
            })

            if (lecturerResponse.isSuccessful) {
                router.back()
            }
		} catch (error: any) {
			displayToast('ERROR', error?.message)
		} finally {
			setIsLoading(false);
		}
	}
	

	return (<>
		<ScrollView
			keyboardShouldPersistTaps={'handled'}
			contentContainerStyle={[styles.contentContainer, {paddingBottom: keyboardHeight + 100}]}
		>
			<View style={styles.main}>
				<Input
					defaultValue={fullName}
					onChangeText={setFullName}
					label='Lecturer Full Name'
					placeholder='Lecturer Full Name'
                    onSubmitEditing={() => emailRef.current?.focus()}
				/>
				<Input
                    ref={emailRef}
					defaultValue={email}
					onChangeText={setEmail}
					label='Lecturer email address'
					placeholder='Ofulagabe@fupre.com'
					keyboardType='email-address'
				/>
				<SelectInput
					label='Select Department'
					placeholder='Select from available departments'
					onPress={() => openBottomSheet('Select Department')}
					value={departmentName}
				/>
				<SelectInput
					label='Select Card'
					placeholder='Select from unassigned cards'
					onPress={() => openBottomSheet('Select Card')}
					value={rfid}
				/>
				<SelectInput
					label='Lecturer role'
					placeholder='Select lecturer role'
					onPress={() => openBottomSheet('Select Role')}
					value={role}
				/>
				<SelectInput
					label='Courses'
					placeholder='Select lecturer course'
					onPress={() => openBottomSheet('Select Course')}
					value={courseNames.join(', ')}
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
				onPress={handleCreateDepartment}
				width={(WIDTH - 60)/2}
				text='Save'
				isLoading={isLoading}
				disabled={!departmentId || !email || !role || !fullName || courseIds.length === 0}
			/>
		</FixedWrapper>
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
			{sheetParameters.content === 'Select Role' && (
				<BottomSheetFlashList
					data={roles}
					keyExtractor={(item) => item.id}
					contentContainerStyle={{paddingTop: 50}}
					estimatedItemSize={81}
					renderItem={renderRoleItem}
				/>
			)}
			{sheetParameters.content === 'Select Card' && (
				<BottomSheetFlashList
					data={rfidCards}
					keyExtractor={(item) => item.id}
					contentContainerStyle={{paddingTop: 50}}
					estimatedItemSize={81}
					renderItem={renderCardItem}
				/>
			)}
			{sheetParameters.content === 'Select Course' && (
				<Container
					height={HEIGHT - 50}
					width={WIDTH - 40}
					style={{
						position: "relative",
						paddingBottom: 20,
					}}
				>
					<BottomSheetFlashList
						data={courses}
						keyExtractor={(item) => item.id}
						contentContainerStyle={{paddingTop: 50, paddingBottom: 150}}
						estimatedItemSize={81}
						renderItem={renderCourseItem}
					/>
					<CustomButton
						text='Done'
						onPress={() => {
							const selectedCourses = courses.filter((item) => item.is_selected);
							setCourseIds(selectedCourses.map(item => item.id)); 
							setCourseNames(selectedCourses.map(item => item.course_code)); 

							closeBottomSheet()
						}}
					/>
				</Container>
			)}
		</CustomBottomSheet>
    </>)
}

export default AddLecturer

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