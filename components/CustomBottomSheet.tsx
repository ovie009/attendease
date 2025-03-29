import { TouchableOpacity, StyleSheet, ViewStyle } from "react-native";
import {
    BottomSheetModal,
    BottomSheetBackdrop,
    BottomSheetView,
    BottomSheetModalProps,
} from "@gorhom/bottom-sheet";
import React, { useMemo, useCallback } from "react"; // Removed FC, added forwardRef
import ModalHandle from "./ModalHandle";
// import CloseIcon from "../assets/icons/CloseIcon";
import AntDesign from '@expo/vector-icons/AntDesign'
import { colors } from "../utilities/colors";
import { HEIGHT } from "../utilities/dimensions";
import { Text, Title } from "react-native-paper";
import { BottomSheetDefaultBackdropProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types";

// Interface for props remains mostly the same
interface CustomBottomSheetProps extends Omit<BottomSheetModalProps, 'children' | 'snapPoints'> { // Omit props handled explicitly
    closeBottomSheet: () => void | undefined;
    snapPoints: Array<string | number>;
    children?: React.ReactNode | undefined;
    sheetTitle?: string; // Make optional if sometimes not needed
    hideSheetHeader?: boolean;
    contentContainerStyle?: ViewStyle;
    backgroundStyle?: ViewStyle;
    backgroundColor?: string;
    opacity?: number;
    onPressClose?: () => void;
    removeBackdrop?: boolean;
    zIndex?: number;
}

// Use React.forwardRef
// Generic arguments:
// 1. The type of the instance the ref will point to (BottomSheetModal)
// 2. The type of the props the component receives (CustomBottomSheetProps)
const CustomBottomSheet = React.forwardRef<BottomSheetModal, CustomBottomSheetProps>(
    (
        {
            // Props received by the component
            closeBottomSheet,
            snapPoints,
            children,
            sheetTitle,
            hideSheetHeader,
            contentContainerStyle,
            backgroundStyle,
            backgroundColor,
            opacity,
            onPressClose,
            removeBackdrop,
            zIndex,
            ...rest // Spread remaining BottomSheetModalProps
        },
        ref // The forwarded ref from the parent
    ) => {
        const snapPointArray = useMemo(() => snapPoints, [snapPoints]);

        // render popup bottomsheet modal backdrop
        const RenderBackdrop = useCallback(
            (props: BottomSheetDefaultBackdropProps) => (
                <BottomSheetBackdrop
                    {...props}
                    disappearsOnIndex={-1}
                    appearsOnIndex={0}
                    opacity={opacity ?? 0.3}
                    onPress={closeBottomSheet} // Consider if backdrop press should always close
                />
            ),
            [opacity, closeBottomSheet] // Added closeBottomSheet dependency
        );

        const handleOpenSheetStates = (index: number) => {
            // if sheet is closed after snapping (or dismissed)
            if (index < 0 && typeof closeBottomSheet === 'function') {
                // console.log('Sheet index changed to closed:', index);
                // Note: This onChange happens *after* closing animation starts or finishes.
                // Calling closeBottomSheet() here might be redundant if it was already called.
                // It might be better used for *detecting* the closed state rather than triggering it again.
                // If you only want to react *after* it's fully closed, consider onDismiss prop.
                // closeBottomSheet(); // Reconsider if this is needed here
            }
        };

        return (
            <BottomSheetModal
                // Pass the forwarded ref to the actual BottomSheetModal
                ref={ref}
                {...rest} // Spread the rest of the props
                snapPoints={snapPointArray}
                backgroundStyle={[
                    styles.backgroundStyle,
                    backgroundColor ? { backgroundColor } : undefined, // Corrected conditional style
                    backgroundStyle, // Apply custom backgroundStyle last to override
                ]}
                handleComponent={ModalHandle}
                backdropComponent={!removeBackdrop ? RenderBackdrop : undefined}
                containerStyle={zIndex ? { zIndex } : undefined}
                onChange={handleOpenSheetStates} // onChange is useful for reacting to state changes
                // If you need an action *when dismissed*, use onDismiss prop from BottomSheetModalProps
                // onDismiss={() => { if (typeof closeBottomSheet === 'function') closeBottomSheet(); }}
                maxDynamicContentSize={HEIGHT} // Consider if this is always needed
                enableDynamicSizing={false} // Usually true if maxDynamicContentSize is used, or false with fixed snap points
                // Pass children explicitly here, not via {...rest}
            >
                {!hideSheetHeader && (
                    <BottomSheetView style={styles.sheetHeader}>
                        <TouchableOpacity
                            style={styles.closeButtonWrapper}
                            // Use onPressClose if provided, otherwise fall back to closeBottomSheet
                            onPress={typeof onPressClose === 'function' ? onPressClose : closeBottomSheet}
                        >
                            <AntDesign name="close" size={20} color={colors.black} />
                        </TouchableOpacity>
                        {sheetTitle && (
                            <BottomSheetView style={styles.sheetTitle}>
                                <Text variant={'titleLarge'}>{sheetTitle}</Text>
                            </BottomSheetView>
                        )}
                    </BottomSheetView>
                )}
                <BottomSheetView
                    style={[
                        styles.modalWrapper,
                        // {maxHeight: 300},
                        contentContainerStyle && contentContainerStyle, // Apply custom contentContainerStyle
                    ]}
                >
                    {children}
                </BottomSheetView>
            </BottomSheetModal>
        );
    }
);

// Optional: Add display name for better debugging in React DevTools
CustomBottomSheet.displayName = 'CustomBottomSheet';

const styles = StyleSheet.create({
    // ... your existing styles (make sure they are complete)
    backgroundStyle: {
        borderRadius: 24,
        backgroundColor: colors.white, // Ensure colors.white is defined
    },
    sheetHeader: {
        width: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        paddingHorizontal: 20,
        marginTop: 9,
        marginBottom: 10, // Added margin for spacing below header
        position: 'relative',
    },
    sheetTitle: {
        flexGrow: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        // Adjust paddingEnd if close button is present to center title properly
        paddingRight: 30, // Example: add padding to account for close button width + space
        paddingLeft: 30, // Example: add padding to keep centered
    },
    closeButtonWrapper: {
        position: 'absolute', // Position absolutely for better control
        left: 15, // Adjust position
        top: 0, // Adjust vertical alignment
        padding: 5, // Add padding for easier touch
        zIndex: 1, // Ensure it's above the title container potentially
        // transform: [ // Rotation moved to the icon/text itself for clarity
        //     {rotateZ: '45deg'}
        // ]
    },
    modalWrapper: {
        flex: 1,
        paddingHorizontal: 20,
    }
});


export default CustomBottomSheet;