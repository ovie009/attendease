import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { FC } from 'react'
import Flex from './Flex';
import { colors } from '@/utilities/colors';
import InterText from './InterText';
import moment from 'moment';
import Skeleton from './Skeleton';
import { WIDTH } from '@/utilities/dimensions';
import { Course, Schedule } from '@/types/api';

interface ScheduleListItemProps {
    isLoading?: boolean,
    day: number,
    schedules: Array<Schedule & {
        course: Course | undefined,
        is_active?: boolean, 
        attendance_session_id?: string | null
    }>,
    onPress: (schedule: Schedule & {
        id: string,
        course: Course | undefined,
        is_active?: boolean, 
        attendance_session_id?: string | null
    }) => void,
}

const ScheduleListItem: FC<ScheduleListItemProps> = ({ isLoading, day, schedules, onPress }) => {
    return (
        <Flex
			gap={10}
			paddingBottom={20}
		>
			{!isLoading && (
				<InterText
					fontWeight={500}
					// fontSize={16}
					color={colors.subtext}
				>
					{moment().day(day).format('ddd')}
				</InterText>
			)}
			<Flex
				gap={10}
			>
				{isLoading && (
					<Flex
						gap={10}
					>
						<Skeleton
							height={17}
							width={50}
						/>
						<Skeleton
							width={WIDTH - 40}
							height={75}
							borderRadius={12}	
						/>
					</Flex>
				)}
				{!isLoading &&
				schedules.some(i => i.days_of_the_week.includes(day)) 
				&& schedules.filter((i) => i.days_of_the_week.includes(day)).map((i, index:number) => (
					<TouchableOpacity
						key={index}
						onPress={() => {
                            onPress(i);
                        }}
					>
						<Flex
							borderRadius={12}
							width={WIDTH - 40}
							gap={10}
							flexDirection='row'
							alignItems='flex-start'
							justifyContent='space-between'
							backgroundColor={colors.lightBackground}
							style={{
								padding: 10,
								borderColor: colors.border,
								borderWidth: 1,
							}}
						>
							<Flex>
								<InterText
									color={colors.subtext}
								>
									{moment().hour(i.lecture_start_time[i.days_of_the_week.findIndex(i => i === day)]).format('ha')} -&nbsp;
									{moment().hour(i.lecture_start_time[i.days_of_the_week.findIndex(i => i === day)] + i.lecture_hours[i.days_of_the_week.findIndex(i => i === day)]).format('ha')}
								</InterText>
							</Flex>
							<Flex 
								width={3}
								borderRadius={1.5}
								height={'100%'}
								backgroundColor={colors.primary}
							/>
							<Flex 
								gap={8}
								flex={1}
							>
								<Flex
									flex={1}
									alignSelf='stretch'
									flexDirection='row'
									alignItems='center'
									justifyContent='space-between'
								>
									<InterText
										fontSize={16}
										lineHeight={19}
										fontWeight={'500'}
									>
										{i.course_code}
									</InterText>
									{i.is_active && (
										<Flex
											paddingVertical={5}
											paddingHorizontal={10}
											backgroundColor="#27A55133"
											borderRadius={10}
										>
											<InterText
												color={"green"}
											>
												Active
											</InterText>
										</Flex>
									)}
								</Flex>
								<InterText
									lineHeight={19}
									// fontWeight={'500'}
								>
									{i?.course?.course_title}
								</InterText>
								<InterText
									lineHeight={12}
									color={colors.subtext}
									// fontWeight={'500'}
								>
									{i.level} level • {moment(i.semester, 'd').format('do')} semester • {i.venue}
								</InterText>
							</Flex>
						</Flex>
					</TouchableOpacity>
				))}
				{!isLoading && !schedules.some(i => i.days_of_the_week.includes(day)) && (
					<InterText
						color={colors.subtext}
					>
						Nill
					</InterText>
				)}
			</Flex>
		</Flex>
    )
}

export default ScheduleListItem

const styles = StyleSheet.create({})