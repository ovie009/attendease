import { Platform, StyleSheet, ViewStyle } from 'react-native'
import React, { FC, ReactNode, useEffect } from 'react'
import { colors } from '../utilities/colors'
import { useAppStore } from '../stores/useAppStore'
import CustomButton, { CustomButtonProps } from './CustomButton'
import Animated, { useSharedValue, withTiming, Easing } from 'react-native-reanimated'


interface FixedButtonProps extends CustomButtonProps {
    contentContainerStyle?: ViewStyle | undefined,
    ButtonComponent?: ReactNode | undefined,
    backgroundColor?: string | undefined,
}

const FixedButton: FC<FixedButtonProps> = ({text, onPress, disabled, contentContainerStyle, ButtonComponent, backgroundColor, isLoading, ...rest}) => {
    
    // global states
    const keyboardHeight = useAppStore(state => state.keyboardHeight);

    const bottom = useSharedValue(0);

    useEffect(() => {
        if (keyboardHeight && Platform.OS === "ios") {
            bottom.value = withTiming(keyboardHeight, {
                duration: 300,
                easing: Easing.inOut(Easing.quad),
            });
            return;
        }

        bottom.value = withTiming(0, {
            duration: 300,
            easing: Easing.inOut(Easing.quad),
        });
    }, [keyboardHeight]);
    
    return (
        <Animated.View 
            style={[
                styles.fixedButton,
                backgroundColor && {backgroundColor},
                contentContainerStyle && contentContainerStyle,
                {bottom}
            ]}
        >
            {/* if button component i available render that instead */}
            {ButtonComponent ? ButtonComponent : (
                <CustomButton
                    {...rest}
                    text={text}
                    onPress={onPress}
                    disabled={disabled}
                    isLoading={isLoading}
                />
            )}
        </Animated.View>
    )
}

export default FixedButton

const styles = StyleSheet.create({
    fixedButton: {
        position: 'absolute',
        left: 0,
        bottom: 0,
        width: '100%',
        height: 100,
        paddingTop: 26,
        paddingHorizontal: 20,
        backgroundColor: colors.white,
    }
})