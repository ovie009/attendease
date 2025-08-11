import { StyleSheet, Text, View } from 'react-native'
import React, { FC, memo } from 'react'
import OutlinedContainer from './OutlinedContainer'
import Flex from './Flex'
import { AttendanceRecord, AttendanceSession, Lecturer } from '@/types/api'
import InterText from './InterText'
import { colors } from '@/utilities/colors'
import moment from 'moment'
import Skeleton from './Skeleton'
import { getRandomNumber } from '@/utilities/getRandomNumbers'

interface ClassAttendedListItemProps {
    lecturer: Lecturer,
    attendance_session: AttendanceSession,
    created_at?: string,
    is_loading?: boolean,
}

const ClassAttendedListItem: FC<ClassAttendedListItemProps> = ({lecturer, attendance_session, created_at, is_loading}) => {
    return (
        <OutlinedContainer
            paddingHorizontal={12}
            paddingVertical={12}
            gap={16}
        >
            {is_loading ? (
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
                </React.Fragment>
            ) : (
                <React.Fragment>
                    <Flex
                        flexDirection='row'
                        justifyContent='space-between'
                        alignItems='center'
                        gap={20}
                        width={'100%'}
                    >
                        <InterText
                            color={colors.subtext}
                        >
                            Lecturer
                        </InterText>
                        <InterText
                            fontWeight={500}
                        >
                            {lecturer?.full_name}
                        </InterText>
                    </Flex>
                    <Flex
                        flexDirection='row'
                        justifyContent='space-between'
                        alignItems='center'
                        gap={20}
                        width={'100%'}
                    >
                        <InterText
                            color={colors.subtext}
                        >
                            Date
                        </InterText>
                        <InterText
                            fontWeight={500}
                        >
                            {moment(attendance_session?.created_at).format("DD MMM, YYYY")}
                        </InterText>
                    </Flex>
                    <Flex
                        flexDirection='row'
                        justifyContent='space-between'
                        alignItems='center'
                        gap={20}
                        width={'100%'}
                    >
                        <InterText
                            color={colors.subtext}
                        >
                            Period
                        </InterText>
                        <InterText
                            fontWeight={500}
                        >
                            {moment(attendance_session?.started_at).format("h:mma")} -&nbsp;
                            {moment(attendance_session?.ended_at).format("h:mma")}
                        </InterText>
                    </Flex>
                    {created_at && (
                        <Flex
                            flexDirection='row'
                            justifyContent='space-between'
                            alignItems='center'
                            gap={20}
                            width={'100%'}
                        >
                            <InterText
                                color={colors.subtext}
                            >
                                Recorded at
                            </InterText>
                            <InterText
                                fontWeight={500}
                            >
                                {moment(created_at).format("h:mma")}
                            </InterText>
                        </Flex>
                    )}
                </React.Fragment>
            )}
        </OutlinedContainer>
    )
}

export default memo(ClassAttendedListItem)

const styles = StyleSheet.create({})