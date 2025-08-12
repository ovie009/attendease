// ./app/(app)/colleges.tsx
import { StyleSheet, View } from 'react-native'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { FlashList } from '@shopify/flash-list'
import { College, Department, Lecturer } from '@/types/api'
import { HEIGHT, WIDTH } from '@/utilities/dimensions'
import { useAppStore } from '@/stores/useAppStore'
import handleColleges from '@/api/handleColleges'
import { handleDisableDataLoading } from '@/utilities/handleDisableDataLoading'
import { getLoadingData } from '@/utilities/getLoadingData'
import Input from '@/components/Input'
import FixedButton from '@/components/FixedButton'
import AddCircleIcon from "@/assets/svg/AddCircleIcon.svg"
import { useRouter, useSegments } from 'expo-router'
import { colors } from '@/utilities/colors'
import CustomButton from '@/components/CustomButton'
import handleDepartments from '@/api/handleDepartments'
import handleLecturers from '@/api/handleLecturers'
import LecturerListItem from '@/components/LecturerListItem'
import InterText from '@/components/InterText'
import { useAuthStore } from '@/stores/useAuthStore'
import { AccountType } from '@/types/general'
import { useRouteStore } from '@/stores/useRouteStore'

// Let's stick with 'is_loading' as used in useMemo annotation.
type LecturersListItemProps = Lecturer & {
	is_loading?: boolean | undefined;
	department_name?: string | undefined;
	college_name?: string | undefined;
};

const Lecturers = () => {

	const router = useRouter()
	const segments = useSegments();

	const {
		displayToast,
	} = useAppStore.getState();
	
	const [dataLoading, setDataloading] = useState<{colleges: boolean, departments: boolean, lecturers: boolean}>({
		colleges: true,
		departments: true,
		lecturers: true,
	});

	const {
		_setLecturer
	} = useRouteStore.getState()
	// console.log("🚀 ~ Lecturers ~ dataLoading:", dataLoading)
	// console.log("🚀 ~ Lecturers ~ dataLoading:", dataLoading)

	const user = useAuthStore(state => state.user);

	// list of collegs
	const [colleges, setColleges] = useState<College[]>([]);
	const [collegeIds, setCollegeIds] = useState<string[]>([]);
	const [departmentIds, setDepartmentIds] = useState<string[]>([]);
	const [searchInput, setSearchInput] = useState<string>("");
	const [departments, setDepartments] = useState<Department[]>([])
	const [deanDepartment, setDeanDepartment] = useState<Department | null>(null)
	const [lecturers, setLecturers] = useState<Lecturer[]>([])

	const data = useMemo<any>(() => {
		if (dataLoading.colleges || dataLoading.departments || dataLoading.lecturers) {
			return getLoadingData(['college_name', 'department_name'], ['loading...', 'loading...']);
		}

		if (searchInput) {
			return lecturers
				.filter(item => item.id !== user?.id)
				.map(item => {
					const department = departments.find(i => i.id === item.department_id);
					const college = colleges.find(i => i.id === department?.college_id);

					return {
						...item,
						department_name: department?.department_name,
						college_name: college?.college_name
					}
				})
				.filter(item => (
					item.full_name.toLowerCase().includes(searchInput.toLowerCase())
					|| (item.college_name && item.college_name.toLowerCase().includes(searchInput.toLowerCase()))
					|| (item.department_name && item.department_name.toLowerCase().includes(searchInput.toLowerCase()))
				))
		}

		return lecturers
			.filter(item => item.id !== user?.id)
			.map(item => {
				const department = departments.find(i => i.id === item.department_id);
				const college = colleges.find(i => i.id === department?.college_id);

				return {
					...item,
					department_name: department?.department_name,
					college_name: college?.college_name
				}
			})
	}, [colleges, dataLoading.colleges, dataLoading.departments, searchInput, lecturers, dataLoading.lecturers]);

	// fetch departments
	useEffect(() => {
		const fetchColleges = async () => {
			if (collegeIds.length === 0) return;
			try {
				const collegesResponse = await handleColleges.getByIds(collegeIds);

				if (collegesResponse.isSuccessful) {
					setColleges(collegesResponse.data)
				}
			} catch (error: any) {
				displayToast('ERROR', error?.message)
			} finally {
				handleDisableDataLoading('colleges', setDataloading)
			}
		}

		fetchColleges();	
	}, [collegeIds])

	// fetch departments
	useEffect(() => {
		const fetchDepartments = async () => {
			if (departmentIds.length === 0) return;
			try {
				const departmentsResponse = await handleDepartments.getByIds(departmentIds);

				if (departmentsResponse.isSuccessful) {
					setDepartments(departmentsResponse.data)
					setCollegeIds(departmentsResponse.data.map(item => item.college_id))
				}
			} catch (error: any) {
				displayToast('ERROR', error?.message)
			} finally {
				handleDisableDataLoading('departments', setDataloading);
			}
		}

		fetchDepartments();
	}, [departmentIds]);
	
	// fetch department for dean
	useEffect(() => {
		if (user?.role !== 'Dean') return;
		const fetchDepartments = async () => {
			try {
				const departmentResponse = await handleDepartments.getById(user?.department_id!);

				if (departmentResponse.data) {
					const collegeDepartmentsResponse = await handleDepartments.getByCollegeId(departmentResponse.data.college_id) 
					setDepartments(collegeDepartmentsResponse.data)
					setDeanDepartment(departmentResponse.data)
					setCollegeIds([departmentResponse.data?.college_id])
				}
			} catch (error: any) {
				displayToast('ERROR', error?.message)
			} finally {
				handleDisableDataLoading('departments', setDataloading);
			}
		}

		fetchDepartments();
	}, []);

	// fetch lecturers for admins
	useEffect(() => {
		if (user?.account_type !== AccountType.Admin) return;
		const fetchLecturers = async () => {
			try {
				const lecturersResponse = await handleLecturers.getAll();
				// console.log("🚀 ~ fetchLecturers ~ lecturersResponse:", lecturersResponse)

				if (lecturersResponse.isSuccessful) {
					setLecturers(lecturersResponse.data)
					setDepartmentIds(lecturersResponse.data.map(item => item.department_id))

					if (lecturersResponse.data.length === 0) {
						handleDisableDataLoading('departments', setDataloading)
						handleDisableDataLoading('colleges', setDataloading)
					}
				}
			} catch (error: any) {
				displayToast('ERROR', error?.message)
			} finally {
				handleDisableDataLoading('lecturers', setDataloading)
			}
		}

		fetchLecturers();
	}, [segments]);

	// fetch lecturers for hods
	useEffect(() => {
		if (user?.role !== 'HOD') return;
		const fetchLecturers = async () => {
			try {
				const lecturersResponse = await handleLecturers.getByDepartmentId(user?.department_id!);
				// console.log("🚀 ~ fetchLecturers ~ lecturersResponse:", lecturersResponse)

				if (lecturersResponse.isSuccessful) {
					setLecturers(lecturersResponse.data)
					setDepartmentIds(lecturersResponse.data.map(item => item.department_id))

					if (lecturersResponse.data.length === 0) {
						handleDisableDataLoading('departments', setDataloading)
						handleDisableDataLoading('colleges', setDataloading)
					}
				}
			} catch (error: any) {
				displayToast('ERROR', error?.message)
			} finally {
				handleDisableDataLoading('lecturers', setDataloading)
			}
		}

		fetchLecturers();
	}, [segments]);

	// fetch lecturers for deans
	useEffect(() => {
		if (user?.role !== 'Dean') return;
		if (departments.length === 0) return;
		const fetchLecturers = async () => {
			try {
				const ids = departments.map(item => item.id);
				const lecturersResponse = await handleLecturers.getByDepartmentIds(ids);
				// console.log("🚀 ~ fetchLecturers ~ lecturersResponse:", lecturersResponse)

				if (lecturersResponse.data) {
					setLecturers(lecturersResponse.data)
				}
			} catch (error: any) {
				displayToast('ERROR', error?.message)
			} finally {
				handleDisableDataLoading('lecturers', setDataloading)
			}
		}
		fetchLecturers();
	}, [departments]);


	const RenderItem = useCallback(({item}: {item: LecturersListItemProps}) => (
		<LecturerListItem
			isLoading={item?.is_loading}
			fullName={item?.full_name}
			collegeName={item?.college_name}
			departmentName={item?.department_name}
			courseIds={item?.course_ids}
			role={item?.role}
			onPress={() => {
				if (user?.account_type === AccountType.Lecturer) {
					_setLecturer(item);

					router.push({
						pathname: '/lecturer/[_lecturer_fullname]',
						params: {
							_lecturer_fullname: item.full_name,
						}
					})

					return;
				}

				router.push({
					pathname: '/(root)/(app)/(lecturer)/EditLecturer',
					params: {
						_role: item?.role,
						_department_id: item?.department_id,
						_department_name: item?.department_name,
						_lecturer_id: item?.id,
						_full_name: item?.full_name,
						_rfid: item?.rfid,
						_course_ids: item?.course_ids?.join(',')
					}
				})
			}}
		/>
	), []);

	return (<>
		<View style={styles.contentContainerStyle}>
			<FlashList
				keyExtractor={(item) => item.id}
				ListHeaderComponent={(!dataLoading.colleges && colleges.length !== 0) ? (
					<View style={styles.header}>
						<Input
							defaultValue={searchInput}
							onChangeText={setSearchInput}
							placeholder='Search lecturers'
						/>
					</View>
				) : <></>}
				data={data}
				renderItem={RenderItem}
				estimatedItemSize={100}
				ListEmptyComponent={(colleges.length === 0 && data.length === 0) ? (
					<View style={styles.listEmptyComponent}>
						<View style={styles.text}>
							<InterText
								fontWeight={500}
								fontSize={16}
								lineHeight={19}
							>
								No lecturer added
							</InterText>
							<InterText>
								Add lecturers to your instituition
							</InterText>
						</View>
						<CustomButton
							onPress={() => {
								router.push('/(root)/(app)/(lecturer)/AddLecturer')				
							}}
							text={"Add Lecturer"}
							Icon={<AddCircleIcon width={22.5} height={22.5} />}
						/>
					</View>
				) : <></>}
			/> 
		</View>
		{(!dataLoading.colleges && data.length !== 0) && user?.account_type === AccountType.Admin && (
			<FixedButton
				onPress={() => {
					router.push('/(root)/(app)/(lecturer)/AddLecturer')				
				}}
				text={"Add Lecturer"}
				Icon={
					<AddCircleIcon 
						width={22.5} 
						height={22.5} 
					/>
				}
			/>
		)}
	</>)
}

export default Lecturers

const styles = StyleSheet.create({
	contentContainerStyle: {
		flex: 1,
		// backgroundColor: 'white',
		paddingHorizontal: 20,
		paddingVertical: 30,
		display: 'flex',
		// justifyContent: 'center',
		// alignItems: 'center',
		gap: 20,
		width: WIDTH,
		backgroundColor: colors.white,
		position: 'relative',
	},
	header: {
		marginBottom: 40,
	},
	text: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
	},
	listEmptyComponent: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		gap: 20,
		height: HEIGHT/2,
		width: '100%',
		// width: WIDTH - 20,
	},
	buttonWrapper: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		width: '100%',
		backgroundColor: colors.grey,
		height: 100,
	},
	// BOTTOM SHEEET
	// BOTTOM SHEEET
	sheetWrapper: {
		// height: '100%',
		flex: 1,
		display: 'flex',
		justifyContent: 'flex-start',
		alignItems: 'flex-start',
		paddingBottom: 30,
		width: '100%',
		// backgroundColor: 'pink',
		gap: 20
	},
	sheetForm: {
		width: '100%',
		gap: 20,
		// backgroundColor: 'teal'
	},
	input: {
		flexGrow: 0,
		width: WIDTH - 40,
		flex: 0,
		// maxHeight: 50,
		// backgroundColor: 'red',
		// opacity: 0.3,
	},
	inputOutline: {
		backgroundColor: 'orange',
	},
	modalButtonWrapper: {
		flex: 1,
		justifyContent: 'flex-end',
		// display: 'flex',`
		width: '100%'
	}
})