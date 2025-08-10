import { StyleSheet, Text, View } from 'react-native'
import React, { FC } from 'react'
import { Lecturer, Student } from '@/types/api'
import OutlinedContainer from './OutlinedContainer'
import InterText from './InterText'
import CustomButton from './CustomButton'
import Flex from './Flex'
import { WIDTH } from '@/utilities/dimensions'
import { colors } from '@/utilities/colors'
import moment from 'moment'
import Skeleton from './Skeleton'
import { getRandomNumber } from '@/utilities/getRandomNumbers'

interface TicketCardProp {
    title: string,
    description: string,
    lecturer?: Lecturer,
    student?: Student,
    isLoading?: boolean,
    isActive?: boolean,
    timestamp: string,
    onPressEdit: () => void
}

const TicketCard: FC<TicketCardProp> = ({title, description, lecturer, student, isLoading, isActive, timestamp, onPressEdit}) => {
    return (
        <OutlinedContainer
            gap={12}
            paddingHorizontal={12}
            paddingVertical={12}
            width={WIDTH - 40}
        >
            {isLoading ? (
                <React.Fragment>
                    {[1, 2, 3, 4].map(item => (
                        <Flex
                            key={item}
                            gap={20}
                            width={'100%'}
                            flexDirection='row'
                            justifyContent='space-between'
                        >
                            <Skeleton
                                width={getRandomNumber(75, 100)}
                                height={20}
                            />
                            <Skeleton
                                width={item === 3 ? 50 : getRandomNumber(50, 120)}
                                height={20}
                            />
                            
                        </Flex>
                    ))}
                    <Flex
                        alignItems='flex-end'
                        width={'100%'}
                    >
                        <Skeleton
                            height={42}
                            borderRadius={42}
                            width={125}
                        />
                    </Flex>
                </React.Fragment>
            ) : (
                <React.Fragment>
                    <Flex
                        width={'100%'}
                        flexDirection='row'
                        alignItems='center'
                        justifyContent='space-between'
                        gap={20}
                    >
                        <InterText
                            color={colors.subtext}
                        >
                            Title
                        </InterText>
                        <InterText
                            fontWeight={500}
                        >
                            {title}
                        </InterText>
                    </Flex>
                    <Flex
                        width={'100%'}
                        flexDirection='row'
                        alignItems='center'
                        justifyContent='space-between'
                        gap={20}
                    >
                        <InterText
                            color={colors.subtext}
                        >
                            Description
                        </InterText>
                        <InterText
                            fontWeight={500}
                        >
                            {description}
                        </InterText>
                    </Flex>
                    <Flex
                        width={'100%'}
                        flexDirection='row'
                        alignItems='center'
                        justifyContent='space-between'
                        gap={20}
                    >
                        <InterText
                            color={colors.subtext}
                        >
                            {student?.full_name ? "Student" : ""}
                            {lecturer?.full_name ? "Lecturer" : ""}
                        </InterText>
                        <InterText
                            fontWeight={500}
                            textAlign='right'
                        >
                            {student?.full_name ? student?.full_name : lecturer?.full_name +" • "+ lecturer?.role}
                        </InterText>
                    </Flex>
                    <Flex
                        width={'100%'}
                        flexDirection='row'
                        alignItems='center'
                        justifyContent='space-between'
                        gap={20}
                    >
                        <InterText
                            color={colors.subtext}
                        >
                            Created at
                        </InterText>
                        <InterText
                            fontWeight={500}
                        >
                            {moment(timestamp).format('H:mma DD MMM, YYYY')}
                        </InterText>
                    </Flex>
                    <Flex
                        alignItems='flex-end'
                        width={'100%'}
                    >
                        {isActive ? (
                            <InterText
                                fontSize={16}
                                lineHeight={20}
                                color={colors.subtext}
                            >
                                Closed
                            </InterText>
                        ) : (
                            <CustomButton
                                width={125}
                                isSecondary={true}
                                text='Close ticket'
                                onPress={onPressEdit}
                            />
                        )}
                    </Flex>
                </React.Fragment>
            )}
        </OutlinedContainer>
    )
}

export default TicketCard

const styles = StyleSheet.create({})