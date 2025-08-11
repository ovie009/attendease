import { StyleSheet, Text, View } from 'react-native'
import React, { FC } from 'react'
import Flex from './Flex';
import OutlinedContainer from './OutlinedContainer';
import { Student } from '@/types/api';
import Avatar from './Avatar';
import InterText from './InterText';
import { colors } from '@/utilities/colors';
import moment from 'moment';
import Skeleton from './Skeleton';

export interface StudentAttendancRecordProps {
    student: Student,
    created_at: string,
    is_loading?: boolean,
}

const StudentAttendancRecord: FC<StudentAttendancRecordProps> = ({student, created_at, is_loading}) => {
    console.log("🚀 ~ StudentAttendancRecord ~ is_loading:", is_loading)
    return (
        <OutlinedContainer
            gap={16}
            paddingHorizontal={16}
            paddingVertical={16}
            style={{
                marginBottom: 20
            }}
        >
            <Flex
                flexDirection='row'
                alignItems='center'
                gap={16}
            >
                {is_loading ? (
                    <React.Fragment>
                        <Skeleton
                            width={40}
                            height={40}
                            borderRadius={20}
                        />
                        <Flex
                            gap={2}
                        >
                            <Skeleton 
                                width={100}
                                height={20}
                            />
                            <Skeleton 
                                width={75}
                                height={17}
                            />
                        </Flex>
                    </React.Fragment>
                ) : (
                    <React.Fragment>
                        <Avatar
                            name={student?.full_name}
                            imageUri={null}
                        />
                        <Flex
                        >
                            <InterText
                                fontSize={16}
                                lineHeight={20}
                                fontWeight={500}
                            >
                                {student?.full_name}
                            </InterText>
                            <InterText
                                color={colors.subtext}
                            >
                                {student?.email}
                            </InterText>
                        </Flex>
                    </React.Fragment>
                )}
            </Flex>
            {is_loading ? (
                <Skeleton
                    width={125}
                    height={17}
                />
            ) : (
                <InterText
                    color={colors.subtext}
                >
                    Logged at:&nbsp;
                    <InterText>
                        {moment(created_at).format('h:mma')}
                    </InterText>
                </InterText>
            )}
        </OutlinedContainer>
    )
}

export default StudentAttendancRecord;