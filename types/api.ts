import { Level, Role, Semester, UserType } from "./general";

export type College = {
    id: string;
    college_name: string;
    created_at: string;
    updated_at: string;
};

export type Department = {
    id: string;
    department_name: string;
    course_duration: number;
    college_id: string;
    created_at: string;
    updated_at: string;
};

export type Course = {
    id: string;
    department_id: string;
    level: Level;
    semester: Semester;
    course_code: string;
    course_title: string;
    created_at: string;
    updated_at: string;
};

export type Lecturer = {
    id: string;
    email: string;
    full_name: string;
    department_id: string,
    course_ids?: string[] | null,
    role: Role,
    pin: string,
    rfid: string,
    created_at: string;
    updated_at: string;
};

export type Admin = {
    id: string;
    email: string;
    profile_picture: string | null;
    full_name: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export type RfidCard = {
    id: string;
    card_uid: string;
    assigned_for: UserType;
    lecturer_id?: string | null;
    student_id?: string | null;
    created_at: string;
    updated_at: string;
}

export type User = {
    id: string;
    email: string;
    full_name: string;
    is_active?: boolean | undefined;
    is_admin: boolean;
    rfid?: string | undefined;
    pin?: string | null | undefined;
    role?: Role | undefined;
    created_at: string;
    updated_at: string;
}

export type Response<T> = {
    isSuccessful: boolean;
    message: string;
    data: T;
} 