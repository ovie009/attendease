import { create } from 'zustand';
import { SheetHandler, ToastProps, ToastType } from '@/types/general';

interface AppState {
    isLoading: boolean;
    isLoadingSecondary: boolean;
    pageLoading: boolean;
    keyboardHeight: number;
    backGestureEnabled: boolean; // Defaults to true
    hideStatusBar: boolean;
    toast: ToastProps,
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
}

export const useAppStore = create<AppState>((set) => ({
    isLoading: false,
    isLoadingSecondary: false,
    pageLoading: false,
    keyboardHeight: 0,
    backGestureEnabled: true,
    hideStatusBar: false,
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