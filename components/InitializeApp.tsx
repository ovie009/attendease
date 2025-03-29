import { useEffect } from 'react';
import { BackHandler, Keyboard } from 'react-native';
import { useAppStore } from '../stores/useAppStore';

const InitializeApp = () => {
    
    // Split selectors to minimize re-renders
    const isLoading = useAppStore(state => state.isLoading);
    const isLoadingSecondary = useAppStore(state => state.isLoadingSecondary);
    const pageLoading = useAppStore(state => state.pageLoading);
    const bottomSheetHandler = useAppStore(state => state.bottomSheetHandler);
    const stackedBottomSheetHandler = useAppStore(state => state.stackedBottomSheetHandler);
    const backGestureEnabled = useAppStore(state => state.backGestureEnabled);
    const toast = useAppStore(state => state.toast);

    // Separate actions to prevent unnecessary re-renders
    const {
        setKeyboardHeight,
        setBackGestureEnabled,
        setBottomSheetHandler,
        setStackedBottomSheetHandler,
        setToast,
    } = useAppStore.getState();

    // Keyboard listeners
    useEffect(() => {
        const onKeyboardShow = (event: any) => {
            // console.log("🚀 ~ onKeyboardShow ~ event:", event)
            setKeyboardHeight(event.endCoordinates.height);
        };

        const onKeyboardHide = () => {
            setKeyboardHeight(0);
        };

        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', onKeyboardShow);
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', onKeyboardHide);

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    // Toast effect
    useEffect(() => {
        let timeoutId: any;
        if (toast.visible) {
            timeoutId = setTimeout(() => {
                setToast({ ...toast, visible: false });
            }, 6000);
        }
        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [toast.visible]);

    // Back handler
    useEffect(() => {
        const backAction = () => {
            // console.log('back button pressed');
            if (isLoading || isLoadingSecondary || !backGestureEnabled) {
                return true;
            }

            if (stackedBottomSheetHandler.opened) {
                stackedBottomSheetHandler.close();
                setStackedBottomSheetHandler({ ...stackedBottomSheetHandler, opened: false })
                return true;
            }
            if (bottomSheetHandler.opened) {
                bottomSheetHandler.close();
                setBottomSheetHandler({ ...bottomSheetHandler, opened: false })
                return true;
            }

            return false;
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        return () => backHandler.remove();
    }, [
        isLoading,
        isLoadingSecondary,
        backGestureEnabled,
        bottomSheetHandler,
        stackedBottomSheetHandler,
    ]);

    // console.log('bottomSheetHandler', bottomSheetHandler)

    // Loading state effect on back gesture
    useEffect(() => {
        setBackGestureEnabled(!(isLoading || isLoadingSecondary));
    }, [isLoading, isLoadingSecondary]);

    // Page loading effect on back gesture
    useEffect(() => {
        setBackGestureEnabled(!pageLoading);
    }, [pageLoading]);

    return <></>;
};

export default InitializeApp;