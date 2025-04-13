// ./app/(app)/colleges.tsx
import { Platform, StyleSheet, View } from 'react-native'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button, Paragraph, TextInput, Title } from 'react-native-paper'
import { FlashList } from '@shopify/flash-list'
import { colors } from '../../../utilities/colors'
import { College } from '@/types/api'
import { HEIGHT, WIDTH } from '@/utilities/dimensions'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6'
import CustomBottomSheet from '@/components/CustomBottomSheet'
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { useAppStore } from '@/stores/useAppStore'
import handleColleges from '@/api/handleColleges'
import { handleDisableDataLoading } from '@/utilities/handleDisableDataLoading'
import CollegeListItem from '@/components/CollegeListItem'
import { getLoadingData } from '@/utilities/getLoadingData'
import Input from '@/components/Input'
import FixedButton from '@/components/FixedButton'
import AddCircleIcon from "@/assets/svg/AddCircleIcon.svg"

// Let's stick with 'is_loading' as used in useMemo annotation.
type CollegeListItemProps = College & {
    is_loading?: boolean | undefined;
};

const Colleges = () => {

	const sheetRef = useRef<BottomSheetModal>(null);
	const [sheetParameters, setSheetParameters] = useState<{snapPoints: Array<string | number>, content: "Add College" | "Edit College"}>({
		snapPoints: [350],
		content: "Add College",
	});
	// console.log("🚀 ~ Colleges ~ sheetParameters:", sheetParameters)

	const keyboardHeight = useAppStore(state => state.keyboardHeight);
	const isLoading = useAppStore(state => state.isLoading);

	const {
		setIsLoading,
		displayToast,
	} = useAppStore.getState()
	// console.log("🚀 ~ Colleges ~ keyboardHeight:", keyboardHeight)


	const openBottomSheet = (content: "Add College" | "Edit College"): void => {
		setSheetParameters({
			snapPoints: [350],
			content,
		})

		sheetRef?.current?.present();
	}

	const closeBottomSheet = () => {
		sheetRef?.current?.close();

		// reset input
		setCollegeInput('')
	}

	useEffect(() => {
		if (keyboardHeight !== 0 && Platform.OS === 'ios') {
			setSheetParameters(prevState => {
				return {
					...prevState,
					snapPoints: [350 + keyboardHeight]
				}
			})
		}
	}, [keyboardHeight])
	
	const [collegeInput, setCollegeInput] = useState<string>("")
	
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
				is_loading: false
			}));
		}

		return colleges.map(item => ({
			...item,
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

	const handleCreateCollege = async () => {
		try {
			setIsLoading(true);
			const collegeResposne = await handleColleges.create(collegeInput);

			setColleges(prevState => {
				const array = [
					...prevState,
					collegeResposne.data
				];

				// sort array
				return array.sort((a, b) => a.college_name.localeCompare(b.college_name));
			})
			closeBottomSheet();
		} catch (error: any) {
			console.log("🚀 ~ handleCreateCollege ~ error:", error);
			displayToast('ERROR', error?.message)
		} finally {
			setIsLoading(false);
		}
	}

	const RenderItem = useCallback(({item, index}: {item: CollegeListItemProps, index: number}) => (
		<CollegeListItem
			index={index}
			isLoading={item?.is_loading}
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
							placeholder='Search Colleges'
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
						<Button 
							mode='contained' 
							buttonColor={colors.primary} 
							onPress={() => openBottomSheet("Add College")}
							style={{width: '100%'}}
							icon={({ size, color }) => (
								<FontAwesome6 name="add" size={size} color={color} />
							)}
						>
							Add Colleges
						</Button>
					</View>
				)}
			/> 
		</View>
		<FixedButton
			onPress={() => {}}
			text={"Add Department"}
			Icon={<AddCircleIcon />}
		/>
		<CustomBottomSheet
			ref={sheetRef}
			closeBottomSheet={closeBottomSheet}
			snapPoints={sheetParameters.snapPoints}
			sheetTitle={sheetParameters.content}
		>
			{sheetParameters.content === "Add College" && (
				<View style={[styles.sheetWrapper, Platform.OS === 'ios' && {paddingBottom: 30 + keyboardHeight}]}>
					<View style={styles.sheetForm}>
						<Paragraph>
							Add a college to you institutions
						</Paragraph>
						<TextInput
							label={"Name of College"}
							placeholder={"Name of College"}
							defaultValue={collegeInput}
							onChangeText={setCollegeInput}
							contentStyle={styles.input}
							// contentStyle={{flexGrow: 0}}
							outlineStyle={styles.inputOutline}
							style={{flexGrow: 0}}
							// dense={true}
							// outlineStyle={{alignSelf: 'flex-start'}}
						/>
					</View>
					<View style={styles.modalButtonWrapper}>
						<Button
							buttonColor={colors.primary}
							textColor={colors.white}
							disabled={!collegeInput}
							loading={isLoading}
							onPress={handleCreateCollege}
						>
							Create
						</Button>
					</View>
				</View>
			)} 
		</CustomBottomSheet>
	</>)
}

export default Colleges

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