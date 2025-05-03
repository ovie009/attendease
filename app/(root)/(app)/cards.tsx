// ./app/(app)/courses.tsx
import { StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { colors } from '@/utilities/colors'
import { FlashList } from '@shopify/flash-list'
import Input from '@/components/Input'
import loadingData from '@/data/loading_data.json';
import CardListItem from '@/components/CardListItem'
import { UserType } from '@/types/general'
import handleRfidCards from '@/api/handleRfidCards'
import { RfidCard } from '@/types/api'
import { handleDisableDataLoading } from '@/utilities/handleDisableDataLoading'
import { useAppStore } from '@/stores/useAppStore'


type CardListItemObject = RfidCard & {
	id: string,
	is_loading?: boolean | undefined;
}

const Cards = () => {

	const {
		displayToast,
	} = useAppStore.getState();

	const [searchQuery, setSearchQuery] = useState<string>('')
	const [dataloading, setDataLoading] = useState<{rfidCards: boolean}>({
		rfidCards: true,
	});

	const [rfidCards, setRfidCards] = useState<CardListItemObject[] | []>([])

	useEffect(() => {
		const fetchAllCards = async (): Promise<void> => {
			try {
				const rfidCardResponse = await handleRfidCards.getAll();
				setRfidCards(rfidCardResponse.data)

				handleDisableDataLoading('rfidCards', setDataLoading)
			} catch (error: any) {
				displayToast('ERROR', error?.message)
			}
		}
		
		fetchAllCards()
	}, [])

	const data = useMemo<any>(() => {
		if (dataloading.rfidCards) return loadingData;

		return rfidCards
	}, [dataloading.rfidCards, rfidCards, searchQuery]);

	const renderItem = useCallback(({item}: {item: CardListItemObject}) => (
		<CardListItem
			isLoading={item?.is_loading}
			cardUid={item?.card_uid}
			assignedFor={item?.assigned_for as UserType | undefined}
			status={item?.lecturer_id !== null || item?.student_id !== null}
			onPress={() => {

			}}
		/>
	), []);

    return (
		<View style={styles.container}>
			<FlashList
				data={data}
				contentContainerStyle={styles.contentContainerStyle}
				ListHeaderComponent={(
					<View style={styles.headerComponent}>
						<Input
							placeholder='Search card id'
							value={searchQuery}
							onChangeText={setSearchQuery}
							returnKeyType='search'
						/>
					</View>
				)}
				keyExtractor={item => item.id}
				estimatedItemSize={81}
				renderItem={renderItem}
			/>
		</View>
    )
}

export default Cards

const styles = StyleSheet.create({
	container: {
		backgroundColor: colors.white,
		width: '100%',
		height: '100%',
		paddingHorizontal: 20,
	},
	contentContainerStyle: {
		paddingVertical: 30,
	},
	headerComponent: {
		marginBottom: 30,
	}
})