import { create } from 'zustand';
import { ScannedCard, SheetHandler, ToastProps, ToastType } from '@/types/general';

interface AppState {
    isLoading: boolean;
    isLoadingSecondary: boolean;
    pageLoading: boolean;
    loadingPages: string[],
    keyboardHeight: number;
    backGestureEnabled: boolean; // Defaults to true
    hideStatusBar: boolean;
    toast: ToastProps,
    scannedCardTopic: string | null,
    scannedCard: ScannedCard | null,
    bottomSheetHandler: SheetHandler,
    stackedBottomSheetHandler: SheetHandler,
    setIsLoading: (value: boolean) => void,
    setIsLoadingSecondary: (value: boolean) => void,
    setPageLoading: (value: boolean) => void,
    setKeyboardHeight: (height: number) => void,
    setBackGestureEnabled: (value: boolean) => void,
    setHideStatusBar: (value: boolean) => void,
    setToast: (toast: ToastProps) => void,
    displayToast: (type: ToastType, message: string) => void,
    setBottomSheetHandler: (handler: SheetHandler) => void,
    setStackedBottomSheetHandler: (handler: SheetHandler) => void,
    setScannedCard: (object: ScannedCard | null) => void,
    setScannedCardTopic: (topic: string | null) => void,
    setLoadingPages: (array: string[]) => void,
}

export const useAppStore = create<AppState>((set) => ({
    isLoading: false,
    isLoadingSecondary: false,
    pageLoading: false,
    loadingPages: [],
    keyboardHeight: 0,
    backGestureEnabled: true,
    hideStatusBar: false,
    scannedCard: null,
    scannedCardTopic: null,
    toast: {
        toastType: 'SUCCESS',
        visible: false,
        message: '',
        messageTextProps: {},
    },
    bottomSheetHandler: {
        opened: false,
        close: () => {},
    },
    stackedBottomSheetHandler: {
        opened: false,
        close: () => {},
    },
    setIsLoading: (loading) => set({ isLoading: loading }),
    setIsLoadingSecondary: (loading) => set({ isLoadingSecondary: loading }),
    setPageLoading: (loading) => set({ pageLoading: loading }),
    setKeyboardHeight: (height) => set({ keyboardHeight: height }),
    setBackGestureEnabled: (enabled) => set({ backGestureEnabled: enabled }),
    setHideStatusBar: (hide) => set({ hideStatusBar: hide }),
    setScannedCard: (object: ScannedCard | null) => set({ scannedCard: object }),
    setScannedCardTopic: (topic: string | null) => set({ scannedCardTopic: topic }),
    setLoadingPages: (array: string[]) => set({ loadingPages: array }),
    
    setToast: (toastData) => set((state) => ({
        toast: { ...state.toast, ...toastData }
    })),

    displayToast: (type, message) => set((state) => ({
        toast: { 
            ...state.toast, 
            toastType: type,
            visible: true,
            message: message,
        }
    })),

    setBottomSheetHandler: (handler) => set((state) => ({
        bottomSheetHandler: { ...state.bottomSheetHandler, ...handler }
    })),

    setStackedBottomSheetHandler: (handler) => set((state) => ({
        stackedBottomSheetHandler: { ...state.stackedBottomSheetHandler, ...handler }
    })),
}));