import { StyleSheet, TouchableOpacity, View } from 'react-native'
import React, { FC, ReactNode } from 'react'
import { colors } from '@/utilities/colors'
import InterText from './InterText'
import { RelativePathString, useRouter } from 'expo-router';
import RightArrowIcon from '../assets/svg/RIghtArrowIcon.svg';

interface CollegeCardProps {
    name: string,
    Icon: ReactNode,
    href: RelativePathString,
}

const SettingsListItem: FC<CollegeCardProps> = ({name, Icon, href}) => {

    const router = useRouter();

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={() => {
                router.push(href)
            }}
        >
            {Icon}
            <View style={styles.textWrapper}>
                <InterText color={colors.textSecondary}>
                    {name}
                </InterText>
            </View>
            <RightArrowIcon />
        </TouchableOpacity>
    )
}

export default SettingsListItem

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
        width: '100%',
        gap: 20,
        paddingVertical: 18,
    },
    textWrapper: {
        flex: 1,
    }
})