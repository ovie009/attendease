import { StyleSheet, TouchableOpacity, View } from 'react-native'
import React, { useEffect, FC } from 'react'
import { WIDTH } from '../utilities/dimensions'
import { colors } from '../utilities/colors'
// icons
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
// reanimated library
import Animated, { useSharedValue, useAnimatedStyle, ReduceMotion, withSpring, withSequence, withDelay, withTiming } from 'react-native-reanimated';
import { ToastProps } from '@/types/general';
import { Text } from 'react-native-paper';
import { TOAST_TYPE } from '@/utilities/constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Toast: FC<ToastProps> = ({visible, toastType, message, messageTextProps}) => {

    // translate value
    const translate = useSharedValue(visible ? 0 : -100);
    // opacity value
    const opacity = useSharedValue(visible ? 1 : 0);

    const insets = useSafeAreaInsets();

    // insets.

    // animated style
    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {translateY: translate.value},
            ],
            opacity: opacity.value,
        }
    });

    // handle clos etoast function
    const closeToast = () => {
        // animate opacity to 0
        opacity.value = withTiming(0, {duration: 100})
    }

    useEffect(() => {
        // console.log('toast running...')
        if (!visible) {
            closeToast();
        };
        if (visible) {

            // animate opacity
            opacity.value = withTiming(1, {duration: 100});

            // animate translate
            translate.value = withSequence(
                withSpring(0, {
                    duration: 750,
                    dampingRatio: 1.2,
                    stiffness: 75,
                    overshootClamping: false,
                    restDisplacementThreshold: 0.01,
                    restSpeedThreshold: 2,
                    reduceMotion: ReduceMotion.System,
                }),
                withDelay(3250, withSpring(-200, {
                    duration: 1000,
                    dampingRatio: 1.2,
                    stiffness: 75,
                    overshootClamping: false,
                    restDisplacementThreshold: 0.01,
                    restSpeedThreshold: 2,
                    reduceMotion: ReduceMotion.System,
                })),
            );
        }

    }, [visible])
    
    return (
        <Animated.View 
            style={[
                styles.container,
                toastType === TOAST_TYPE.ERROR && {backgroundColor: colors.error},
                toastType === TOAST_TYPE.SUCCESS && {backgroundColor: colors.success},
                {top: insets.top},
                animatedStyle,
            ]}
        >
            <View style={styles.toastWrapper}>
                {toastType === TOAST_TYPE.ERROR && (
                    <MaterialIcons name="error-outline" size={16} color={colors.white} />
                )}
                {toastType === TOAST_TYPE.SUCCESS && (
                    <Ionicons name="checkmark-circle-outline" size={16} color={colors.white} />
                )}
                <View style={styles.toastMessage}>
                    <Text
                        variant={'titleMedium'}
                        style={{color: colors.white}}
                        {...messageTextProps}
                        
                    >
                        {toastType === TOAST_TYPE.ERROR && "Error!"}
                        {toastType === TOAST_TYPE.SUCCESS && "Success!"}
                    </Text>
                    <Text
                        variant={'bodySmall'}
                        style={{color: colors.white}}
                        {...messageTextProps}
                    >
                        {message}
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={closeToast}
                    style={styles.closeButton}
                >
                    <AntDesign name="close" size={16} color={colors.white} />
                </TouchableOpacity>
            </View>
        </Animated.View>
    )
}

export default Toast

const styles = StyleSheet.create({
    container: {
        width: WIDTH - 40,
        position: 'absolute',
        top: 0,
        left: 20,
        borderRadius: 12,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    toastWrapper: {
        width: '100%',
        paddingVertical: 15,
        paddingHorizontal: 12,
        paddingEnd: 40,
        position: 'relative',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexDirection: 'row',
        gap: 12,
    },
    toastMessage: {
        flex: 1,
        gap: 4,
    },
    closeButton: {
        position: 'absolute',
        right: 12,
        top: 15,
    }
})