// ./type/general.ts
import { TextStyle } from "react-native";

export type ToastType = 'SUCCESS' | 'ERROR';

export type ToastProps = {
    toastType: ToastType;
    visible: boolean;
    message: string;
    messageTextProps: TextStyle;
};

export type SheetHandler = {
    opened: boolean,
    close: () => void,
};

export type ScannedCard = {
    device_id: string;
    card_uid: string;
    session_id: string | null;
    pin: string | null;
}

export type AccountType = 'Admin' | UserType;

export type UserType =  'Lecturer' | 'Student';

export type Role = 'Dean' | 'HOD' | 'Default';

export type CollegeRouteParams = {
	_college_id: string,
	_college_name: string,
	_dean_id: string | null,
}


// export type CartType = 'Cart sent'| 'Cart approved'| 'Cart edited'| 'Checkout completed';

// export type sharedProfiles = {
//     id: number,
//     isConsultant: boolean | undefined,
// } 

// export type extraData = {
//     chatId: string,
//     messageId: string, // uuid v$
//     cartType: CartType | undefined,
//     servcieProviderId: number | undefined,
//     productId: Array<number> | undefined,
//     orderId: number | undefined,
//     consultantId: number | undefined,
//     serviceId: number | undefined,
//     // sharedServiceProviderIds: Array<number> | undefined,
//     sharedIds: Array<sharedProfiles> | undefined,
//     cartId: number | undefined,
// }


