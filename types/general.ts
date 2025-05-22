// ./type/general.ts
import { ReactNode } from "react";
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

export type MenuButton = {
    title: string;
    Icon?: ReactNode | undefined;
}

export type AccountType = 'Admin' | UserType;

export type UserType =  'Lecturer' | 'Student';

export type Bucket = 'profiles' | 'groq';

export type Role = 'Dean' | 'HOD' | 'Academic';

export type Semester = 1 | 2;

export type Level = 100 | 200 | 300 | 400 | 500;

export type CollegeRouteParams = {
	_college_id: string,
	_college_name: string,
	_dean_id: string | null,
}

export type Key = 'academic_session' | 'semester' | 'start_of_semester' | 'end_of_semester';

export type KeyValueType = 'number' | 'string'; 

export type FontWeight = "medium" | "Medium" | 500 | "500" | "semibold" | "Semibold" | 600 | "600" | "bold" | "bold" | 700 | "700" | "extrabold" | "Extrabold" | 800 | "800";

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


