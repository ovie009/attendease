import { AccountType, Key, KeyValueType, Level, Role, Semester, UserType } from "./general";

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
    other_department_ids: string[];
    created_at: string;
    updated_at: string;
};

export type CourseRegistration = {
    id: string,
    student_id: string,
    level: Level, 
    course_ids: string[], 
    session: string,
    created_at: string,
    updated_at: string,
}

export type AttendanceSession = {
    id: string;
    lecturer_id: string;
    course_id: string;
    started_at: string;
    ended_at: string;
    latitude: number;
    longitude: number;
    academic_session: string;
    created_at: string;
    updated_at: string;
};

export type Schedule = {
    id: string;
    session: string;
    days_of_the_week: number[]; 
    lecture_hours: number[];
    lecture_start_time: number[];
    course_id: string | null;
    course_code: string;
    level: Level; 
    semester: Semester;
    venue: string,
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

export type Student = {
    id: string;
    full_name: string;
    matric_number: string,
    department_id: string,
    device_id: string,
    pin: string,
    email: string;
    level: Level,
    rfid: string,
    is_active: boolean,
    created_at: string;
    updated_at: string;
};


export type Dean = {
    lecturer: Lecturer,
    college_id: string,
}

export type Admin = {
    id: string;
    email: string;
    profile_picture: string | null;
    full_name: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export type Setting = {
    id: string;
    key: Key;
    value: string;
    type: KeyValueType;
    created_at: string;
    updated_at: string;
}

export type RfidCard = {
    id: string;
    card_uid: string;
    assigned_for: UserType;
    created_at: string;
    updated_at: string;
}

export type User = {
    id: string;
    email: string;
    full_name: string;
    is_active?: boolean | undefined;
    department_id?: string;
    level?: Level,
    course_ids?: string[] | null;
    is_admin: boolean;
    rfid?: string | undefined;
    pin?: string | null | undefined;
    role?: Role | undefined;
    device_id?: string,
    created_at: string;
    updated_at: string;
    account_type: AccountType;
}

export type Response<T> = {
    isSuccessful: boolean;
    message: string;
    data: T;
} 


export type AttendanceRecord = {
    id: string;
    student_id: string;
    attendance_session_id: string;
    academic_session: string;
    semester: Semester;
    created_at: string;
    updated_at: string;
};

export type Ticket = {
    id: string,
    title: string,
    description: string,
    student_id: string | null,
    lecturer_id: string | null,
    is_active: boolean,
    created_at: string;
    updated_at: string;
}