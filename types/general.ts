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

export type extraData = {
    cartType: CartType | undefined,
    servcieProviderId: number | undefined,
    productId: Array<number> | undefined,
    orderId: number | undefined,
    consultantId: number | undefined,
    serviceId: number | undefined,
    sharedServiceProviderIds: Array<number> | undefined,
    cartId: number | undefined,
}