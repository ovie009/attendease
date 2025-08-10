import { ScrollView, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import { colors } from '@/utilities/colors'
import Flex from '@/components/Flex'
import InterText from '@/components/InterText'
import OptionListItem from '@/components/OptionListItem'
import Input from '@/components/Input'
import { useAppStore } from '@/stores/useAppStore'
import FixedButton from '@/components/FixedButton'
import { handleSelectOption } from '@/utilities/handleSelectOption'
import handleTickets from '@/api/handleTickets'
import { useAuthStore } from '@/stores/useAuthStore'
import { AccountType } from '@/types/general'
import { router } from 'expo-router'

const Support = () => {

    const user = useAuthStore(state => state.user);

    const keyboardHeight = useAppStore(state => state.keyboardHeight)
    const displayToast = useAppStore(state => state.displayToast)
    const isLoading = useAppStore(state => state.isLoading)
    const setIsLoading = useAppStore(state => state.setIsLoading)

    const [description, setDescription] = useState<string>('')
    const [options, setOptions] = useState([
        {
            id: '1',
            name: 'Card issues',
            isSelected: false,
        },
        {
            id: '2',
            name: 'Account issues',
            isSelected: false,
        },
        {
            id: '3',
            name: 'Pin issues',
            isSelected: false,
        },
        {
            id: '4',
            name: 'Others',
            isSelected: false,
        },
    ]);

    const handleSubmitTicket = async () => {
        try {
            setIsLoading(true)
            const title = options.find(item => item.isSelected)?.name;

            if (!title) {
                throw new Error('Please select an options')
            }

            if (!description) {
                throw new Error("Please add a description")
            }

            await handleTickets.create({
                title,
                description,
                student_id: user?.account_type === AccountType.Student ? user.id : null,
                lecturer_id: user?.account_type === AccountType.Lecturer ? user.id : null,
            })

            displayToast('SUCCESS', 'Sumbitted successfully');

            router.back();
        } catch (error:any) {
            displayToast('ERROR', error?.message)
        } finally {
            setIsLoading(false)
        }
    }
    

    return (
        <React.Fragment>
            <ScrollView
                contentContainerStyle={{
                    flexGrow: 1,
                    paddingHorizontal: 20,
                    backgroundColor: colors.white,
                    paddingBottom: keyboardHeight + 150
                }}
            >
                <Flex
                    paddingTop={30}
                    gap={20}
                >
                    <InterText
                        fontSize={16}
                    >
                        What type of issue are youe experince
                    </InterText>
                    <Flex>
                        {options.map(item => (
                            <OptionListItem
                                key={item?.id}
                                id={item?.id}
                                text={item?.name}
                                isSelected={item?.isSelected}
                                onPress={(id) => {
                                    handleSelectOption(id, setOptions, 'single')
                                    // handleSelectDepartment(item.id)
                                }}
                            />
                        ))}
                    </Flex>
                    <Input
                        label='Description'
                        defaultValue={description}
                        onChangeText={setDescription}
                        height={100}
                        multiline={true}
                        placeholder='Please give us more details about your challenges'
                    />
                </Flex>
            </ScrollView>
            <FixedButton
                text='Submit'
                isLoading={isLoading}
                disabled={!description || !options.some(item => item.isSelected)}
                onPress={handleSubmitTicket}
            />
        </React.Fragment>
    )
}

export default Support

const styles = StyleSheet.create({})