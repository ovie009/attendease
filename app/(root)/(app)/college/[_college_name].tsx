// ./app/(app)/colleges.tsx
import { Button, Platform, StyleSheet, View } from 'react-native'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Paragraph, Title } from 'react-native-paper'
import { FlashList } from '@shopify/flash-list'
import { College, Department } from '@/types/api'
import { HEIGHT, WIDTH } from '@/utilities/dimensions'
import { useAppStore } from '@/stores/useAppStore'
import handleColleges from '@/api/handleColleges'
import { handleDisableDataLoading } from '@/utilities/handleDisableDataLoading'
import CollegeListItem from '@/components/CollegeListItem'
import { getLoadingData } from '@/utilities/getLoadingData'
import Input from '@/components/Input'
import FixedButton from '@/components/FixedButton'
import AddCircleIcon from "@/assets/svg/AddCircleIcon.svg"
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router'
import { colors } from '@/utilities/colors'
import CustomButton from '@/components/CustomButton'
import handleDepartments from '@/api/handleDepartments'
import InterText from '@/components/InterText'

// Let's stick with 'is_loading' as used in useMemo annotation.
type CollegeListItemProps = College & {
    is_loading?: boolean | undefined;
	onPress?: () => void | undefined;
};

const CollegeDetails = () => {

	const router = useRouter()
	const navigation = useNavigation();

	// get route params
	const {
		_college_name,
		_college_id,
		_dean_id,
	} = useLocalSearchParams();
		console.log("🚀 ~ CollegeDetails ~ _dean_id:", _dean_id)
		console.log("🚀 ~ CollegeDetails ~ _college_id:", _college_id)
		// console.log("🚀 ~ CollegeDetails ~ useLocalSearchParams():", useLocalSearchParams())

	const {
		displayToast,
	} = useAppStore.getState()
	// console.log("🚀 ~ Colleges ~ keyboardHeight:", keyboardHeight)

	const [dataLoading, setDataloading] = useState<{departments: boolean}>({
		departments: true,
	});

	// list of collegs
	const [colleges, setColleges] = useState<College[]>([]);
	const [departments, setDepartments] = useState<Department[]>([]);
	const [searchInput, setSearchInput] = useState<string>("");

	useEffect(() => {
		// (async () => )
		const fetchDepartments = async () => {
			try {
				const departmentsResponse = await handleDepartments.getByCollegeId(_college_id as string);

				if (departmentsResponse.isSuccessful) {
					setDepartments(departmentsResponse.data)
				}
			} catch (error: any) {
				displayToast('ERROR', error?.message)
			} finally {
				handleDisableDataLoading('departments', setDataloading)
			}
		}

		fetchDepartments();
			
	}, [])

	const data = useMemo<any>(() => {
		if (dataLoading.departments) {
			return getLoadingData(['college_name'], ['loading...']);
		}

		if (searchInput) {
			return colleges.filter(item => item.college_name.toLowerCase().includes(searchInput.toLowerCase())).map(item => ({
				...item,
				onPress: () => {
				},
				is_loading: false
			}));
		}

		return colleges.map(item => ({
			...item,
			onPress: () => {
			},
			is_loading: false
		}));
	}, [colleges, dataLoading.departments, searchInput]);

	const handleEditCollege = () => {
		router.push({
			pathname: '/(root)/(app)/(college)/editCollege',
			params: {
				_college_name,
				_college_id,
				_dean_id,
			}
		})
	}

	useEffect(() => {
		navigation.setOptions({
			headerRight: () => (
				<CustomButton
					onPress={handleEditCollege}
					text='Edit'
					buttonStyle={{
						width: 'auto', 
						borderRadius: 14,
						minHeight: 30,
					}}
					isSecondary={true}
				/>
			)
		});
	}, []);

	const RenderItem = useCallback(({item, index}: {item: CollegeListItemProps, index: number}) => (
		<CollegeListItem
			index={index}
			isLoading={item?.is_loading}
			onPress={item?.onPress}
			collegeName={item.college_name}
		/>
	), []);

    return (<>
		<View style={styles.contentContainerStyle}>
			<FlashList
				keyExtractor={(item) => item.id}
				ListHeaderComponent={!(!dataLoading.departments && departments.length === 0) ? (
					<View style={styles.header}>
						<Input
							value={searchInput}
							onChangeText={setSearchInput}
							placeholder='Search Departments'
						/>
					</View>
				) : undefined}
				data={data}
				renderItem={RenderItem}
				estimatedItemSize={100}
				ListEmptyComponent={(
					<View style={styles.listEmptyComponent}>
						<View style={styles.text}>
							<InterText
								fontWeight={600}
								fontSize={16}
								lineHeight={19}
							>
								No departments found
							</InterText>
							<InterText
								color={colors.subtext}
							>
								Add departments to {_college_name}
							</InterText>
						</View>
						<CustomButton
							onPress={() => {
								router.push('/(root)/(app)/(department)/addDepartment')				
							}}
							text={"Add Department"}
							Icon={<AddCircleIcon />}
						/>
					</View>
				)}
			/> 
		</View>
		{!(!dataLoading.departments && departments.length === 0) && (
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

export default CollegeDetails

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
		gap: 10,
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