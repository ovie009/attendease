import React, { FC } from 'react'
import { Key, KeyValueType } from '@/types/general';
import Flex from './Flex';
import InterText from './InterText';
import moment from 'moment';
import { colors } from '@/utilities/colors';
import { getSettingDescription } from '@/utilities/getSettingDescription';
import Skeleton from './Skeleton';

interface SettingListItemProps {
    settingKey?: Key | undefined;
    value?: string | undefined;
    type?: KeyValueType | undefined;
    isLoading?: boolean | undefined;
}

const SettingListItem: FC<SettingListItemProps> = ({settingKey, value, type, isLoading}) => {
    return (
        <Flex
            width={'100%'}
            justifyContent='space-between'
            alignItems='center'
            flexDirection='row'
            gap={20}
            style={{
                paddingBottom: 15,
                paddingTop: 5,
                marginBottom: 25,
                borderBottomWidth: 1,
                borderColor: colors.inputBorder,
            }}
        >
            {isLoading ? (
                <React.Fragment>
                    <Skeleton
                        height={19}
                        width={100}
                        borderRadius={2.5}
                    />
                    <Skeleton
                        height={17}
                        width={120}
                        borderRadius={2.5}
                    />
                </React.Fragment>
            ) : (
                <React.Fragment>
                    <Flex
                        flex={1}
                        justifyContent='center'
                        alignItems='flex-start'
                    >
                        <InterText
                            fontSize={16}
                            lineHeight={19}
                        >
                            {settingKey ? getSettingDescription(settingKey) : ''}
                        </InterText>
                    </Flex>
                    <Flex
                        flex={1}
                        justifyContent='center'
                        alignItems='flex-end'
                    >
                        <InterText
                            color={colors.subtext}
                        >
                            {(type === 'date' && value) ? moment(value).format('ddd, MMMM YYYY') : value}
                        </InterText>
                    </Flex>
                </React.Fragment>
            )}
        </Flex>
    )
}

export default SettingListItem