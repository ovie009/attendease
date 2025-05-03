import { StyleSheet, View } from 'react-native'
import React, { FC } from 'react'
import { Button, Text } from 'react-native-paper'
import { colors } from '@/utilities/colors'
import { WIDTH } from '@/utilities/dimensions'
import Skeleton from './Skeleton'

interface CollegeCardProps {
    id: string,
    collegeName?: string,
    numberOfDepartments?: number | undefined,
    nameOfDean?: string | undefined,
    onPressEdit?: (id: string) => void,
    isLoading?: boolean,
}

const CollegeCard: FC<CollegeCardProps> = ({id, collegeName, numberOfDepartments, nameOfDean, onPressEdit, isLoading}) => {
    return (
        <View style={styles.container}>
            <View style={styles.titleText}>
                {isLoading ? (
                    <Skeleton
                        width={150}
                        height={20}
                    />
                ) : (
                    <Text 
                        variant='titleMedium'
                        numberOfLines={2}
                    >
                        {collegeName}
                    </Text>
                )}
            </View>
            <View style={styles.subTextWrapper}>
                <View style={styles.subtext}>
                    {isLoading ? <>
                        <Skeleton
                            width={95}
                            height={16}
                        />
                        <Skeleton
                            width={70}
                            height={16}
                        />
                    </> : <>
                        <Text 
                            variant='bodyMedium' 
                            numberOfLines={1}
                        >
                            Dean: {nameOfDean || "N/A"}
                        </Text>
                        <Text 
                            variant='bodySmall' 
                            numberOfLines={1}
                        >
                            {(!numberOfDepartments || numberOfDepartments === 0) ? `No departments added` : `${numberOfDepartments} Departments`}
                        </Text>
                    </>}
                </View>
                {isLoading ? (
                    <Skeleton
                        width={70}
                        height={40}
                        borderRadius={20}
                    />
                ) : (
                    <Button
                        mode={'contained-tonal'}
                        buttonColor={colors.neutral}
                        textColor={colors.primary}
                        onPress={() => {
                            if (!onPressEdit) return; 
                            onPressEdit(id)
                        }}
                    >
                        Edit
                    </Button>
                )}
            </View>
        </View>
    )
}

export default CollegeCard

const styles = StyleSheet.create({
    container: {
        width: WIDTH - 40,
        marginBottom: 20,
        display: 'flex',
        gap: 10,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        padding: 10,
        elevation: 3,
        backgroundColor: colors.white,
        shadowColor: colors.skeleton1,
    },
    titleText: {
        width: '100%',
    },
    subTextWrapper: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        flexDirection: 'row',
        gap: 10,
        width: '100%',
        // backgroundColor: 'pink',        
    },
    subtext: {
        flex: 1,
        gap: 4,
    }
})