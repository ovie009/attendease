import { TextStyle } from "react-native";

export type ToastType = 'SUCCESS' | 'ERROR';

export type ToastProps = {
    toastType: ToastType,
    visible: boolean,
    message: string,
    messageTextProps: TextStyle,
};

export type SheetHandler = {
    opened: boolean,
    close: () => void,
};

