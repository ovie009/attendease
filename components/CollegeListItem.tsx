import { StyleSheet, TouchableOpacity, View } from 'react-native'
import React, { FC } from 'react'
import { colors } from '@/utilities/colors'
import { WIDTH } from '@/utilities/dimensions'
import Skeleton from './Skeleton'
import InterText from './InterText'

interface CollegeCardProps {
    index: number,
    collegeName?: string,
    nameOfDean?: string | undefined,
    isLoading?: boolean | undefined,
    onPress?: () => void | undefined,
}

const CollegeListItem: FC<CollegeCardProps> = ({index, collegeName, nameOfDean, isLoading, onPress}) => {
    return (
        <TouchableOpacity 
            style={styles.container}
            onPress={onPress}
        >
            {isLoading ? (
                <Skeleton
                    width={45}
                    height={45}
                    borderRadius={45/2}
                />
            ) : (
                <View style={styles.number}>
                    <InterText
                        fontWeight={'bold'}
                        fontSize={22}
                        lineHeight={22}
                        color={colors.white}
                    >
                        {index + 1}
                    </InterText>
                </View>
            )}
            <View style={styles.detailsWrapper}>
                {isLoading ? <>
                    <Skeleton
                        width={100}
                        height={16}
                        borderRadius={2.5}
                    />
                    <Skeleton
                        width={75}
                        height={12}
                        borderRadius={2.5}
                    />
                </> : <>
                    <InterText
                        fontSize={16}
                        lineHeight={16}
                    >
                        {collegeName}
                    </InterText>
                    <InterText
                        color={colors.textSecondary}
                        fontSize={12}
                        lineHeight={12}
                    >
                        Dean: {nameOfDean ? nameOfDean : 'N/A'}
                    </InterText>
                </>}
            </View>
        </TouchableOpacity>
    )
}

export default CollegeListItem

const styles = StyleSheet.create({
    container: {
        width: WIDTH - 40,
        marginBottom: 20,
        display: 'flex',
        gap: 20,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 16,
        flexDirection: 'row',
        borderWidth: 1,
        borderRadius: 14,
        borderColor: colors.border,
    },
    number: {
        width: 45,
        height: 45,
        borderRadius: 45/2,
        backgroundColor: colors.primary,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    detailsWrapper: {
        display: 'flex',
        gap: 5,
    }
})