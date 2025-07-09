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

export enum AccountType {
    Admin = "Admin",
    Lecturer = "Lecturer",
    Student = "Student",
};

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

export type KeyValueType = 'number' | 'string' | 'date'; 

export type FontWeight = "medium" | "Medium" | 500 | "500" | "semibold" | "Semibold" | 600 | "600" | "bold" | "bold" | 700 | "700" | "extrabold" | "Extrabold" | 800 | "800";

export type FlatTab<T> = {
    id: string;
    name: T;
    active: boolean;
    IconRight?: ReactNode | undefined;
    IconLeft?: ReactNode | undefined;
    ActiveIconRight?: ReactNode | undefined;
    ActiveIconLeft?: ReactNode | undefined;
    width?: number | undefined;
    translateX?: number | undefined;
}


