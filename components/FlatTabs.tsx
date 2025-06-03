import React, { FC } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
// components
import InterText, { InterTextProps } from './InterText';
// utilities
import { FlatTab } from '@/types/general';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { colors } from '../utilities/colors';
import { WIDTH } from '../utilities/dimensions';
import Flex from './Flex';

interface FlatTabsProps {
    tabs: FlatTab<any>[];
    setTabs: React.Dispatch<React.SetStateAction<FlatTab<any>[]>>;
    previousWidth?: React.RefObject<number> | undefined; // required for recycling
    previousTranslateX?: React.RefObject<number> | undefined; // required for recycling
    previousTabs?: React.RefObject<FlatTab<any>[]> | undefined; // required for recycling
    gap?: number | undefined;
    hideTrack?: boolean | undefined;
    fontProps?: InterTextProps | undefined;
    activeColor?: string | undefined;
    inActiveColor?: string | undefined;
    indicatorHeight?: number | undefined;
    contentContainerStyle?: ViewStyle | undefined;
    buttonPaddingHorizontal?: number | undefined;
    justifyContent?: 'center' | 'space-between' | 'space-evenly' | 'space-around' | 'flex-start' | 'flex-end' | undefined;
}

const FlatTabs: FC<FlatTabsProps> = ({
    tabs,
    setTabs,
    gap,
    hideTrack,
    fontProps,
    indicatorHeight,
    activeColor,
    inActiveColor,
    justifyContent,
    contentContainerStyle,
    previousWidth,
    previousTranslateX,
    buttonPaddingHorizontal,
    previousTabs
}) => {

    // indicator width
    const width = useSharedValue(previousWidth?.current || 0);
    // ndicator x offset
    const translateX = useSharedValue(previousTranslateX?.current || 0);
    
    // recycle translate value from ref
    if (previousTranslateX?.current !== undefined) {
        if (translateX.value !== previousTranslateX?.current) {
            translateX.value = withSpring(previousTranslateX.current, {
                damping: 20,
                stiffness: 100,
                overshootClamping: false,
            });
        }
    }
    
    // recycle width value from ref
    if (previousWidth?.current !== undefined) {
        if (width.value !== previousWidth.current) {
            // animate width
            width.value = withSpring(previousWidth.current, {
                damping: 20,
                stiffness: 100,
                overshootClamping: false,
            });
        }
    }
    
    // recycle tabs
    if (previousTabs?.current !== undefined && previousTabs?.current?.find(item => item?.active)?.name !== tabs?.find(item => item?.active)?.name) {
        setTabs(previousTabs?.current);
    }
    
    // aniomate style
    const animatedStyle = useAnimatedStyle(() => {
        return {
            width: width.value,
            transform: [
                { translateX: translateX.value }, 
                { translateY: 1 }
            ]
        }
    })
    
    // function to handle selecting a particular tab
    const handleOnPressTab = (id: string) => {
        // update previous tabs
        if (previousTabs) {
            if (!previousTabs?.current) return;
            previousTabs.current = tabs.map((tab) => {
                if (tab.id === id) {
                    return {...tab, active: true};
                }
                return {...tab, active: false};
            });
        }

        // console.log("🚀 ~ translateX:", translateX.value)
        
        // update tab
        setTabs((prevTabs) => {
            return prevTabs.map((tab) => {
                if (tab.id === id) {
                    // animate width
                    if (tab?.width !== undefined) {
                        width.value = withSpring(tab?.width, {
                            damping: 20,
                            stiffness: 100,
                            overshootClamping: false,
                        });
                    }

                    // update ref
                    if (previousWidth && tab?.width !== undefined) {
                        previousWidth.current = tab?.width;
                    }

                    // animate position
                    if (tab?.translateX !== undefined) {
                        translateX.value = withSpring(tab?.translateX, {
                            damping: 20,
                            stiffness: 100,
                            overshootClamping: false,
                        });
                        // console.log("🚀 ~ returnprevTabs.map ~ tab?.translateX:", tab?.translateX)
                    }

                    // update ref
                    if (previousTranslateX && tab?.translateX !== undefined) {
                        previousTranslateX.current = tab?.translateX;
                    }

                    return {...tab, active: true};
                }
                return {...tab, active: false};
            })
        });
    }

    // update all button width
    const handleButtonWidth = (id: string, width: number, translateX: number) => {
        // update parent tab
        setTabs(prevTab => {
            return prevTab.map((tab) => {
                if (tab.id === id) {
                    return {...tab, width, translateX};
                } 
                return tab;
            })
        });
    }

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[
                // styles.container,
                {paddingEnd: 20},
                contentContainerStyle,
            ]}  
        >
            <Flex
                flexDirection='row'
                justifyContent={justifyContent || 'flex-start'}
                alignItems='center'
                gap={gap || 0}
                style={[
                    {position: 'relative'},
                ]}
            >
                {tabs.map((tab) => (
                    <TouchableOpacity
                        key={tab.name}
                        onPress={() => handleOnPressTab(tab.id)}
                        onLayout={(e) => {
                            // console.log('getting tabs layout...')
                            // layout object
                            const layout = e.nativeEvent.layout;
                            
                            if (tab.active) {
                                // animate width
                                width.value = withSpring(layout?.width, {
                                    damping: 20,
                                    stiffness: 100,
                                    overshootClamping: false,
                                });

                                // update previous width ref
                                if (previousWidth) {
                                    previousWidth.current = layout?.width;
                                }

                                // animate position
                                translateX.value = withSpring(layout?.x, {
                                    damping: 20,
                                    stiffness: 100,
                                    overshootClamping: false,
                                });

                                if (previousTranslateX) {
                                    // update previous translate ref
                                    previousTranslateX.current = layout?.x;
                                }
                            }

                            // update tab state with width and x offset
                            if (tab.width === undefined || tab.translateX === undefined) {
                                handleButtonWidth(tab.id, layout.width, layout.x)
                            }
                        }}
                        style={styles.tabButton}
                    >
                        <Flex
                            flexDirection='row'
                            gap={6}
                            justifyContent='center'
                            alignItems='center'
                            paddingBottom={6}
                            paddingHorizontal={buttonPaddingHorizontal || 16}
                        >
                            {!tab.active && tab?.IconLeft && tab?.IconLeft}
                            {tab.active && tab?.ActiveIconLeft && tab?.ActiveIconLeft}
                            <InterText
                                fontWeight={'medium'}
                                fontSize={16}
                                color={(() => {
                                    // if the tabs is active, return primary color
                                    if (tab?.active) {
                                        if (activeColor) return activeColor
                                        return colors.primary;
                                    }
                                    if (inActiveColor) return inActiveColor
                                    // else return a different color
                                    return colors.textSecondary
                                })()}
                                {...fontProps}
                            >
                                {tab?.name}
                            </InterText>
                            {!tab.active && tab?.IconRight && tab?.IconRight}
                            {tab.active && tab?.ActiveIconRight && tab?.ActiveIconRight}
                        </Flex>
                    </TouchableOpacity>
                ))}
                <Flex
                    justifyContent='flex-start'
                    // alignItems='center'
                    width={'100%'}
                    // height={5}
                    height={indicatorHeight || 2}
                    backgroundColor={hideTrack ? undefined : colors.subtext}
                    style={{
                        position: 'absolute',
                        left: 0,
                        bottom: 0,
                    }}
                >
                    <Animated.View 
                        style={[
                            indicatorHeight !== undefined && {height: indicatorHeight},
                            styles.indicator,
                            animatedStyle,
                        ]} 
                    />
                </Flex>
            </Flex>
        </ScrollView>
    )
}

export default FlatTabs

const styles = StyleSheet.create({
    container: {
        // width: '100%',
        minWidth: WIDTH - 16,
        display: 'flex',
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingRight: 20,
        gap: 20,
        borderColor: 'blue',
        position: 'relative',
        // backgroundColor: 'red',
    },
    tabButton: {
        paddingBottom: 8,
    },
    indicatorWrapper: {
        width: '100%',
        minWidth: WIDTH - 40,
        position: 'absolute',
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        // borderBottomColor: colors.lowContrast,
        borderBottomWidth: 1,
        bottom: 0,
        left: 0,
        // height: 1,
        // flexGrow: 1,
        // backgroundColor: colors.lowContrast
    },
    indicator: {
        height: 2,
        borderRadius: 26,
        backgroundColor: colors.primary,
        zIndex: 1,
        transform: [
            {translateY: 1}
        ]
    }
})