// ./app/(app)/colleges.tsx
import { StyleSheet, View } from 'react-native'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Paragraph, Title } from 'react-native-paper'
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
import { usePathname, useRouter, useSegments } from 'expo-router'
import { colors } from '@/utilities/colors'
import CustomButton from '@/components/CustomButton'
import handleDepartments from '@/api/handleDepartments'
import DepartmentListItem from '@/components/DepartmentListItem'
import handleLecturers from '@/api/handleLecturers'
import LecturerListItem from '@/components/LecturerListItem'

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
	// console.log("🚀 ~ Lecturers ~ dataLoading:", dataLoading)

	useEffect(() => {

	})

	// list of collegs
	const [colleges, setColleges] = useState<College[]>([]);
	const [collegeIds, setCollegeIds] = useState<string[]>([]);
	const [departmentIds, setDepartmentIds] = useState<string[]>([]);
	// console.log("🚀 ~ Departments ~ collegeIds:", collegeIds)
	const [searchInput, setSearchInput] = useState<string>("");
	const [departments, setDepartments] = useState<Department[]>([])
	const [lecturers, setLecturers] = useState<Lecturer[]>([])
	// console.log("🚀 ~ Departments ~ colleges:", colleges)
	// console.log("🚀 ~ Departments ~ departments:", departments)
	console.log("")

	const data = useMemo<any>(() => {
		if (dataLoading.colleges || dataLoading.departments || dataLoading.lecturers) {
			return getLoadingData(['college_name', 'department_name'], ['loading...', 'loading...']);
		}

		if (searchInput) {
			return lecturers
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
			.map(item => {
				const department = departments.find(i => i.id === item.department_id);
				const college = colleges.find(i => i.id === department?.college_id);

				return {
					...item,
					department_name: department?.department_name,
					college_name: college?.college_name
				}
			});
	}, [colleges, dataLoading.colleges, dataLoading.departments, searchInput, lecturers, dataLoading.lecturers]);
	console.log("🚀 ~ Lecturers ~ data:", data)


	useEffect(() => {
		// (async () => )
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

	useEffect(() => {
		const fetchLecturers = async () => {
			try {
				const lecturersResponse = await handleLecturers.getAll();
				console.log("🚀 ~ fetchLecturers ~ lecturersResponse:", lecturersResponse)

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



	const RenderItem = useCallback(({item}: {item: LecturersListItemProps}) => (
		<LecturerListItem
			isLoading={item?.is_loading}
			fullName={item?.full_name}
			collegeName={item?.college_name}
			departmentName={item?.department_name}
			courseIds={item?.course_ids}
			role={item?.role}
			onPress={() => {

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
							<Title>
								No lecturer added
							</Title>
							<Paragraph>
								Add lecturers to your instituition
							</Paragraph>
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
		{(!dataLoading.colleges && data.length !== 0) && (
			<FixedButton
				onPress={() => {
					router.push('/(root)/(app)/(lecturer)/AddLecturer')				
				}}
				text={"Add Lecturer"}
				Icon={<AddCircleIcon width={22.5} height={22.5} />}
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