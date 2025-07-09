import { Platform, StyleSheet, ViewStyle } from 'react-native'
import React, { FC, ReactNode, useEffect } from 'react'
import { colors } from '../utilities/colors'
import { useAppStore } from '../stores/useAppStore'
import Animated, { useSharedValue, withTiming, Easing } from 'react-native-reanimated'


export interface FixedWrapperProps {
    contentContainerStyle?: ViewStyle | undefined,
    children?: ReactNode | undefined,
    backgroundColor?: string | undefined,
}

const FixedWrapper: FC<FixedWrapperProps> = ({contentContainerStyle, backgroundColor, children}) => {
    
    // global states
    const keyboardHeight = useAppStore(state => state.keyboardHeight);

    const bottom = useSharedValue(0);

    useEffect(() => {
        if (Platform.OS === "android") return;
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
            {children}
        </Animated.View>
    )
}

export default FixedWrapper

const styles = StyleSheet.create({
    fixedButton: {
        position: 'absolute',
        left: 0,
        bottom: 0,
        width: '100%',
        height: 150,
        paddingTop: 26,
        paddingHorizontal: 20,
        backgroundColor: colors.white,
    }
})