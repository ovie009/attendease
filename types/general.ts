// ./type/general.ts
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

export type CartType = 'Cart sent'| 'Cart approved'| 'Cart edited'| 'Checkout completed';

export type sharedProfiles = {
    id: number,
    isConsultant: boolean | undefined,
} 

export type extraData = {
    chatId: string,
    messageId: string, // uuid v$
    cartType: CartType | undefined,
    servcieProviderId: number | undefined,
    productId: Array<number> | undefined,
    orderId: number | undefined,
    consultantId: number | undefined,
    serviceId: number | undefined,
    // sharedServiceProviderIds: Array<number> | undefined,
    sharedIds: Array<sharedProfiles> | undefined,
    cartId: number | undefined,
}