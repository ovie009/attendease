import { ActivityIndicator, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native'
import React, { FC, ReactNode } from 'react';
// text
import { colors } from '../utilities/colors';
import InterText, { InterTextProps } from './InterText';
import { FontWeight } from '@/types/general';

export interface CustomButtonProps extends InterTextProps {
    onPress: () => any,
    disabled?: boolean | undefined,
    isLoading?: boolean | undefined,
    isSecondary?: boolean | undefined,
    isNeutral?: boolean | undefined,
    buttonStyle?: ViewStyle | undefined,
    width?: number | undefined,
    height?: number | undefined,
    text: string,
    TextComponent?: ReactNode | undefined,
    Icon?: ReactNode | undefined,
    diabledButtonColor?: string | undefined,
}

const CustomButton: FC<CustomButtonProps> = ({onPress, disabled, isLoading, isNeutral, isSecondary, buttonStyle, width, height, diabledButtonColor, fontWeight, fontSize, lineHeight, color, text, TextComponent, Icon, ...rest}) => {
// console.log("🚀 ~ Icon:", Icon)

    // handle font color
    const handleFontColor = (): string => {
        if (color) return color;
        if (isSecondary) return colors.primary;
        return colors.white;
    }

    // handle font size
    const handleFontSize = (): number => {
        if (fontSize) return fontSize;
        return 16;
    }

    // handle line height
    const handleLineHeight = (): number => {
        if (lineHeight) return lineHeight;
        return 19;
    }

    // handle font weight
    const handleFontWeight = (): FontWeight  => {
        if (fontWeight) return fontWeight;
        return "semibold";
    }

    return (
        <TouchableOpacity
            onPress={onPress}
            style={[
                styles.button,
                width !== undefined && { width },
                height !== undefined && { height },
                (disabled && !diabledButtonColor && !isSecondary) && {backgroundColor: colors.primaryDisable},
                diabledButtonColor && {backgroundColor: diabledButtonColor},
                isNeutral === true && { backgroundColor: colors.grey}, 
                isSecondary === true && { backgroundColor: colors.secondary}, 
                (buttonStyle?.height !== undefined || height !== undefined) && { minHeight: undefined },
                buttonStyle && buttonStyle,
            ]}
            disabled={(() => {
                if (disabled) return true;
                if (isLoading) return true;
                return false;
            })()}
        >
            {/* if no loading and text component is available, render text component */}
            {!isLoading && TextComponent && TextComponent}
            {!isLoading && !TextComponent && Icon && Icon}
            {/* /if no text component and no loading, render text */}
            {!isLoading && !TextComponent && (
                <InterText
                    color={handleFontColor()}
                    fontSize={handleFontSize()}
                    lineHeight={handleLineHeight()}
                    fontWeight={handleFontWeight()}
                    textAlign={'center'}
                    {...rest}
                >
                    {text}
                </InterText>
            )}
            {isLoading && (
                <ActivityIndicator 
                    color={colors.white} 
                />
            )}
        </TouchableOpacity>
    )
}

export default CustomButton

const styles = StyleSheet.create({
    button: {
        width: "100%",
        minHeight: 42,
        borderRadius: 42,
        justifyContent: 'center',
        alignItems: 'center',
        display: 'flex',
        paddingHorizontal: 14,
        backgroundColor: colors.primary,
        gap: 12,
        flexDirection: 'row',
    },
})