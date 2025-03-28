// ./app/(app)/colleges.tsx
import { StyleSheet, View } from 'react-native'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import { Button, Paragraph, Title } from 'react-native-paper'
import { FlashList } from '@shopify/flash-list'
import { colors } from '../../../utilities/colors'
import { College } from '@/types/api'
import { HEIGHT, WIDTH } from '@/utilities/dimensions'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6'
import CustomBottomSheet from '@/components/CustomBottomSheet'
import { BottomSheetModal } from '@gorhom/bottom-sheet'

const Colleges = () => {

	const sheetRef = useRef<BottomSheetModal>(null);

	const openBottomSheet = () => {
		sheetRef?.current?.present();
	}

	const closeBottomSheet = () => {
		sheetRef?.current?.close();
	}
	

	// list of collegs
	const [colleges, setColleges] = useState<College[]>([]);

	const data = useMemo(() => {
		return colleges;
	}, [colleges]);

	const [dataLoading, setDataloading] = useState<{colleges: boolean}>({
		colleges: false,
	})

	const RenderItem = useCallback(({item, index}: {item: College, index: number}) => (
		<></>
	), []);

    return (<>
		<View style={styles.contentContainerStyle}>
			<FlashList
				keyExtractor={(item) => item.id}
				// ListHeaderComponent={}
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
							onPress={openBottomSheet}
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
		<CustomBottomSheet
			ref={sheetRef}
			closeBottomSheet={closeBottomSheet}
			snapPoints={[500]}
			sheetTitle='Add College/Faculty'
		>

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
		justifyContent: 'center',
		alignItems: 'center',
		gap: 20,
		width: '100%',
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
	}
})