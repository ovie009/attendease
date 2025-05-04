// ./app/(app)/colleges.tsx
import { StyleSheet, View } from 'react-native'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Paragraph, Title } from 'react-native-paper'
import { FlashList } from '@shopify/flash-list'
import { College, Department } from '@/types/api'
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
import DepartmentListItem from '@/components/DepartmentListItem'

// Let's stick with 'is_loading' as used in useMemo annotation.
type DepartmentsListItemProps = Department & {
    is_loading?: boolean | undefined;
	hod?: string | undefined;
	college_name?: string | undefined;
};

const Departments = () => {

	const router = useRouter()
	const segments = useSegments();

	const {
		displayToast,
	} = useAppStore.getState()
	
	const [dataLoading, setDataloading] = useState<{colleges: boolean, departments: boolean}>({
		colleges: true,
		departments: true,
	});

	// list of collegs
	const [colleges, setColleges] = useState<College[]>([]);
	const [collegeIds, setCollegeIds] = useState<string[]>([]);
	// console.log("🚀 ~ Departments ~ collegeIds:", collegeIds)
	const [searchInput, setSearchInput] = useState<string>("");
	const [departments, setDepartments] = useState<Department[]>([])
	// console.log("🚀 ~ Departments ~ colleges:", colleges)
	// console.log("🚀 ~ Departments ~ departments:", departments)
	console.log("")

	const data = useMemo<any>(() => {
		if (dataLoading.colleges || dataLoading.departments) {
			return getLoadingData(['college_name', 'department_name'], ['loading...', 'loading...']);
		}

		if (searchInput) {
			return departments
			.map(item => {
				return {
					...item,
					hod: undefined,
					college_name: colleges.find(i => i.id === item.college_id)?.college_name,
				}
			})
			.filter(item => item.department_name.toLowerCase().includes(searchInput.toLowerCase())
				|| (item.college_name && item.college_name.toLowerCase().includes(searchInput.toLowerCase()))
			)
		}

		return departments.map(item => {
			return {
				...item,
				hod: undefined,
				college_name: colleges.find(i => i.id === item.college_id)?.college_name,
			}
		});
	}, [colleges, dataLoading.colleges, dataLoading.departments, searchInput]);


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
			try {
				const departmentsResponse = await handleDepartments.getAll();

				if (departmentsResponse.isSuccessful) {
					setDepartments(departmentsResponse.data)
					setCollegeIds(departmentsResponse.data.map(item => item.college_id))
				}
			} catch (error: any) {
				displayToast('ERROR', error?.message)
			} finally {
				handleDisableDataLoading('departments', setDataloading)
			}
		}

		fetchDepartments();
	}, [segments])

	const RenderItem = useCallback(({item, index}: {item: DepartmentsListItemProps, index: number}) => (
		<DepartmentListItem
			index={index}
			isLoading={item?.is_loading}
			departmentName={item?.department_name}
			collegeName={item.college_name}
			hod={item?.hod}
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
							value={searchInput}
							onChangeText={setSearchInput}
							placeholder='Search Department'
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
								No departments added
							</Title>
							<Paragraph>
								Add departments to your instituition
							</Paragraph>
						</View>
						<CustomButton
							onPress={() => {
								router.push('/(root)/(app)/(department)/addDepartment')				
							}}
							text={"Add College"}
							Icon={<AddCircleIcon />}
						/>
					</View>
				) : <></>}
			/> 
		</View>
		{(!dataLoading.colleges && data.length !== 0) && (
			<FixedButton
				onPress={() => {
					router.push('/(root)/(app)/(department)/addDepartment')				
				}}
				text={"Add Department"}
				Icon={<AddCircleIcon />}
			/>
		)}
	</>)
}

export default Departments

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