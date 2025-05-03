import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { colors } from '@/utilities/colors'
import CustomButton from '@/components/CustomButton'
import { WIDTH } from '@/utilities/dimensions'
import FixedWrapper from '@/components/FixedWrapper'
import Input from '@/components/Input'
import SelectInput from '@/components/SelectInput'
import CustomBottomSheet from '@/components/CustomBottomSheet'
import { BottomSheetFlashList, BottomSheetModal } from '@gorhom/bottom-sheet'
import OptionListItem from '@/components/OptionListItem'
import { ListRenderItemInfo } from '@shopify/flash-list'
import { useNavigation, useRouter } from 'expo-router'
import CardIcon from '@/assets/svg/CardIcon.svg';
import InterText from '@/components/InterText'
import Flex from '@/components/Flex'
import { useAppStore } from '@/stores/useAppStore'
import { UserType } from '@/types/general'
import handleRfidCards from '@/api/handleRfidCards'
import { TOAST_TYPE } from '@/utilities/constants'

// Define the combined type for clarity
type AccountTypeOption = {
    id: string, 
    account_type: UserType, 
    is_selected: boolean
};

const ScanCard = () => {

    const router = useRouter();
    const navigation = useNavigation();

    const isLoading = useAppStore(state => state.isLoading);

    const {
        setIsLoading,
        displayToast,
    } = useAppStore.getState()

    const [cardId, setCardId] = useState<string>('');
    const [assignedFor, setAssignedFor] = useState<UserType | ''>('');
    const [isFetchingCard, setIsFetchingCard] = useState<boolean>(true);

    const scannedCard = useAppStore(state => state.scannedCard);
    const scannedCardTopic = useAppStore(state => state.scannedCardTopic);

    useEffect(() => {
        // console.log("🚀 ~ useEffect ~ scannedCardTopic:", scannedCardTopic)
        if (scannedCardTopic === 'attendease/register') {
            if (!scannedCard?.card_uid) return;
            setCardId(scannedCard.card_uid)
            setIsFetchingCard(false);
        }
    }, [scannedCardTopic, scannedCard])

    useEffect(() => {
        navigation.setOptions({
            headerShown: !isFetchingCard, // Dynamically set based on state
        });
    }, [isFetchingCard, navigation]);

    const sheetRef = useRef<BottomSheetModal>(null);

    const openBottomSheet = () => {
        sheetRef?.current?.present();
    }

    const closeBottomSheet = () => {
        sheetRef?.current?.close();
    }

    const [accountTypeOptions, setAccountTypeOptions] = useState<Array<AccountTypeOption>>([
        {
            id: '1',
            account_type: 'Lecturer',
            is_selected: false,
        },
        {
            id: '2',
            account_type: 'Student',
            is_selected: false,
        },
    ]);

    const handleSelectedDean = useCallback((id: string): void => {
        // This check ensures that 'find' below will succeed.
        if (accountTypeOptions.some(item => item.id === id)) {
            // Add '!' after find(...) to assert it's not null/undefined
            const foundLecturer = accountTypeOptions.find((item) => item.id === id)!;
            setAssignedFor(foundLecturer.account_type); // Now TypeScript knows foundLecturer is Lecturer, not Lecturer | undefined

            // update lecturer list
            setAccountTypeOptions(prevState => {
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
    }, [accountTypeOptions, setAssignedFor]); // <-- Add setAssignedFor to dependencies

    const renderItem = useCallback(({item}: ListRenderItemInfo<AccountTypeOption>) => (
        <OptionListItem
            id={item?.id}
            text={item?.account_type}
            isSelected={item?.is_selected}
            onPress={handleSelectedDean}
        />
    ), []);

    const handleCreateRfidCard = async () => {
        try {
            setIsLoading(true);
            const createRfidCardResponse = await handleRfidCards.create({
                card_uid: cardId,
                assigned_for: assignedFor
            });
            console.log("🚀 ~ handleCreateRfidCard ~ createRfidCardResponse:", createRfidCardResponse)
        } catch (error: any) {
            displayToast(TOAST_TYPE.ERROR, error?.message)
        } finally {
            setIsLoading(false);
        }
    }

    return (<>
        <ScrollView
            keyboardShouldPersistTaps={'handled'}
            contentContainerStyle={styles.contentContainer}
        >
            <View style={styles.main}>
                <Input
                    value={cardId}
                    onChangeText={setCardId}
                    label='Card ID'
                    placeholder='Card id'
                    editable={false}
                />
                <SelectInput
                    label='Assigned for'
                    placeholder='Select account type'
                    onPress={openBottomSheet}
                    value={assignedFor}
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
                isSecondary={true}
                text='Cancel'
            />
            <CustomButton
                width={(WIDTH - 60)/2}
                text='Save'
                disabled={!cardId || !assignedFor}
                isLoading={isLoading}
                onPress={handleCreateRfidCard}
            />
        </FixedWrapper>
        <CustomBottomSheet
            ref={sheetRef}
            sheetTitle={'Select Account Type'}
            snapPoints={[250]}
            closeBottomSheet={closeBottomSheet}
        >
            <BottomSheetFlashList
                data={accountTypeOptions}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{paddingBottom: 30}}
                renderItem={renderItem}
                estimatedItemSize={60}
            />
        </CustomBottomSheet>
        {isFetchingCard && (
            <View style={styles.loader}>
                <CardIcon width={60} height={60} />
                <Flex
                    gap={10}
                    justifyContent='center'
                    alignItems='center'
                >
                    <InterText
                        fontWeight={600}
                        fontSize={20}
                        lineHeight={23}
                    >
                        Getting scannned Card
                    </InterText>
                    <InterText
                        fontWeight={500}
                        color={colors.label}
                    >
                        Scan card on Attendease device
                    </InterText>
                </Flex>
                <ActivityIndicator color={colors.black} size={'large'} />
            </View>
        )}
    </>)
}

export default ScanCard

const styles = StyleSheet.create({
    contentContainer: {
        backgroundColor: colors.white,
        paddingHorizontal: 20,
        flexGrow: 1,
        paddingTop: 30,
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
    loader: {
        flex: 1,
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 20,
        backgroundColor: colors.white,
        zIndex: 10,
        paddingBottom: 50,
        paddingHorizontal: 20,
    },
})