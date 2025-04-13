import { StyleSheet, Text, TextProps, TextStyle } from 'react-native'
import React, { FC, ReactNode } from 'react'
import { colors } from '../utilities/colors'


export interface InterTextProps extends TextProps {
    fontWeight?: string | number | undefined,
    fontSize?: number | undefined,
    lineHeight?: number | undefined,
    color?: string | undefined,
    numberOfLines?: number | undefined,
    capitalize?: boolean | undefined,
    textAlign?: 'center' | 'left' | 'right' | undefined,
    textStyle?: TextStyle | undefined,
    onPress?: () => void | undefined,
    children?: ReactNode | undefined,
}

const InterText: FC<InterTextProps> = ({children, fontWeight, fontSize, lineHeight, color, numberOfLines, capitalize, textAlign, textStyle, onPress, ...rest}) => {

    return (
        <Text
            {...rest}
            style={[
                styles.defaultText,
                color && { color },
                fontSize !== undefined && { fontSize },
                lineHeight !== undefined  && { lineHeight },
                fontWeight !== undefined && ["medium", "Medium", 500, "500"].includes(fontWeight) && { fontFamily: 'inter-medium'},
                fontWeight !== undefined && ["semibold", "Semibold", 600, "600"].includes(fontWeight) && { fontFamily: 'inter-semibold'},
                fontWeight !== undefined && ["bold", "bold", 700, "700"].includes(fontWeight) && { fontFamily: 'inter-bold'},
                fontWeight !== undefined && ["extrabold", "Extrabold", 800, "800"].includes(fontWeight) && { fontFamily: 'inter-extrabold'},
                capitalize && { textTransform: 'capitalize' },
                textAlign && { textAlign },
                textStyle && textStyle,
            ]}
            numberOfLines={numberOfLines}
            ellipsizeMode="tail"
            onPress={onPress}
            suppressHighlighting={onPress === undefined}
        >
            {children}
        </Text>
    )
}

export default InterText

const styles = StyleSheet.create({
    defaultText: {
        fontFamily: 'inter-regular',
        fontSize: 14,
        lineHeight: 17,
        color: colors.black,
    },
})