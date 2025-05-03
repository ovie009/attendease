import { StyleSheet, TouchableOpacity, View } from 'react-native'
import React, { FC } from 'react'
import { colors } from '@/utilities/colors'
import InterText from './InterText'
import { Checkbox } from 'react-native-paper';

interface OptionLIstItemProps {
    id: string,
    text: string,
    subtext?: string | undefined,
    isSelected: boolean,
    onPress: (id: string) => void,
}


const OptionListItem: FC<OptionLIstItemProps> = ({id, text, subtext, isSelected, onPress}) => {
    return (
        <TouchableOpacity
            style={styles.container}
            onPress={() => {
                onPress(id)
            }}
        >
            <View style={styles.textWrapper}>
                <InterText 
                    fontSize={17}
                    lineHeight={19}
                    color={colors.black}
                    fontWeight={'medium'}
                >
                    {text}
                </InterText>
                {subtext && (
                    <InterText color={colors.textSecondary}>
                        {subtext}
                    </InterText>
                )}
            </View>
            <Checkbox
                status={isSelected ? 'checked' : 'unchecked'}
                color={colors.primary}
                onPress={() => {
                    onPress(id)
                }}
            />
        </TouchableOpacity>
    )
}

export default OptionListItem

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
        width: '100%',
        gap: 20,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderColor: colors.neutral,
        // marginBottom: 16,
    },
    textWrapper: {
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        gap: 5,
        alignItems: 'flex-start',
    }
})