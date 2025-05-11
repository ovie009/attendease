import { TouchableWithoutFeedback, TouchableOpacity, View, StyleSheet, ViewStyle } from "react-native";
import { colors } from "../utilities/colors";
import InterText from "./InterText";
import { useAppStore } from "../stores/useAppStore";
// helpers
import * as Haptics from 'expo-haptics';
import { FC } from "react";
import { MenuButton } from "@/types/general";


interface MenuProps {
    menuButtons: MenuButton[];
    top?: number | undefined;
    right?: number | undefined;
    left?: number | undefined;
    hideTouchableBackground?: boolean | undefined;
    buttonStyle?: ViewStyle | undefined;
    overlayColor?: string | undefined;
    localControl?: boolean | undefined;
    isLocalMenuOpened?: boolean | undefined;
    onPressOption: (title: string) => void;
}


const Menu: FC<MenuProps> = ({menuButtons, top, right, hideTouchableBackground, left, buttonStyle, overlayColor, localControl, isLocalMenuOpened, onPressOption}) => {

    const isMenuOpened = useAppStore(state => state.isMenuOpened);

    const { closeMenu } = useAppStore.getState();

    if (!localControl && !isMenuOpened) return null;
    if (localControl && !isLocalMenuOpened) return null;

    return (
        <>  
            {!hideTouchableBackground && (
                <TouchableWithoutFeedback  
                    onPress={closeMenu}
                >
                    <View 
                        style={[
                            styles.withoutFeedbackContent, 
                            overlayColor && {backgroundColor: overlayColor}
                        ]} 
                    />
                </TouchableWithoutFeedback>
            )}
            <View 
                style={[
                    styles.menuContainer,
                    left !== undefined && {left},
                    right !== undefined && {right},
                    top !== undefined && {top},
                ]}
            >
                {menuButtons?.map(menuButton => (
                    <TouchableOpacity
                        key={menuButton.title}
                        onPress={() => {
                            if (onPressOption) {
                                onPressOption(menuButton.title);
                            }

                            // vibrate device
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)

                            // close menu
                            closeMenu();
                        }}
                        style={[
                            styles.menuButton,
                            buttonStyle && buttonStyle,
                        ]}
                    >
                        {menuButton.Icon && menuButton.Icon}
                        <InterText 
                            fontSize={14}
                            lineHeight={16}
                            fontWeight={500}
                        >
                            {menuButton.title}
                        </InterText>
                    </TouchableOpacity>
                ))}
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    withoutFeedbackContent: {
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        right: 0,
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
    },
    menuContainer: {
        zIndex: 10,
        backgroundColor: colors.white,
        position: "absolute",
        top: 42,
        minWidth: 121,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingVertical: 10,
        borderRadius: 15,
        shadowOffset: { 
            width: 0,
            height: 4
        },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 5,
    },
    menuButton: {
        width: "100%",
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: 16,
        gap: 10,
        // backgroundColor: colors.error
    }
})
 
export default Menu;