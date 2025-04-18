// ./app/(app)/colleges.tsx
import { Platform, StyleSheet, View } from 'react-native'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Paragraph, Title } from 'react-native-paper'
import { FlashList } from '@shopify/flash-list'
import { College } from '@/types/api'
import { HEIGHT, WIDTH } from '@/utilities/dimensions'
import { useAppStore } from '@/stores/useAppStore'
import handleColleges from '@/api/handleColleges'
import { handleDisableDataLoading } from '@/utilities/handleDisableDataLoading'
import CollegeListItem from '@/components/CollegeListItem'
import { getLoadingData } from '@/utilities/getLoadingData'
import Input from '@/components/Input'
import FixedButton from '@/components/FixedButton'
import AddCircleIcon from "@/assets/svg/AddCircleIcon.svg"
import { useRouter } from 'expo-router'
import { colors } from '@/utilities/colors'
import CustomButton from '@/components/CustomButton'

// Let's stick with 'is_loading' as used in useMemo annotation.
type CollegeListItemProps = College & {
    is_loading?: boolean | undefined;
	onPress?: () => void | undefined;
};

const CollegeDetails = () => {

	const router = useRouter()

	const keyboardHeight = useAppStore(state => state.keyboardHeight);

	const {
		displayToast,
	} = useAppStore.getState()
	// console.log("🚀 ~ Colleges ~ keyboardHeight:", keyboardHeight)

	const [dataLoading, setDataloading] = useState<{colleges: boolean}>({
		colleges: true,
	});

	// list of collegs
	const [colleges, setColleges] = useState<College[]>([]);
	const [searchInput, setSearchInput] = useState<string>("");

	const data = useMemo<any>(() => {
		if (dataLoading.colleges) {
			return getLoadingData(['college_name'], ['loading...']);
		}

		if (searchInput) {
			return colleges.filter(item => item.college_name.toLowerCase().includes(searchInput.toLowerCase())).map(item => ({
				...item,
				onPress: () => {
					router.push({
						pathname: '/(root)/(app)/college/[college_name]',
						params: {
							college_name: item?.college_name,
							created_at: item?.created_at,
							updated_at: item?.updated_at,
							id: item?.id,
						}
					})
				},
				is_loading: false
			}));
		}

		return colleges.map(item => ({
			...item,
			onPress: () => {
				router.push({
					pathname: '/(root)/(app)/college/[college_name]',
					params: {
						college_name: item?.college_name,
						created_at: item?.created_at,
						updated_at: item?.updated_at,
						id: item?.id
					}
				})
			},
			is_loading: false
		}));
	}, [colleges, dataLoading.colleges, searchInput]);


	useEffect(() => {
		// (async () => )
		const fetchColleges = async () => {
			try {
				const collegesResponse = await handleColleges.getAll();

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
			
	}, [])

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
				ListHeaderComponent={
					<View style={styles.header}>
						<Input
							value={searchInput}
							onChangeText={setSearchInput}
							placeholder='Search Departments'
						/>
					</View>
				}
				data={data}
				renderItem={RenderItem}
				estimatedItemSize={100}
				ListEmptyComponent={(
					<View style={styles.listEmptyComponent}>
						<View style={styles.text}>
							<Title>
								No college added
							</Title>
							<Paragraph>
								Add colleges to your instituition
							</Paragraph>
						</View>
						<CustomButton
							onPress={() => {
								router.push('/(root)/(app)/(college)/addCollege')				
							}}
							text={"Add Department"}
							Icon={<AddCircleIcon />}
						/>
					</View>
				)}
			/> 
		</View>
		<FixedButton
			onPress={() => {
				router.push('/(root)/(app)/(college)/addCollege')				
			}}
			text={"Add Department"}
			Icon={<AddCircleIcon />}
		/>
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