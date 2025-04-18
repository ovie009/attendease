export type College = {
    id: string;
    college_name: string;
    created_at: string;
    updated_at: string;
};

export type Lecturer = {
    id: string;
    full_name: string;
    department_id: string,
    course_ids: [string] | null,
    role: 'Lecturer' | 'Dean' | 'HOD',
    created_at: string;
    updated_at: string;
};

export type Admin = {
    id: string,
    email: string,
    is_active: boolean,
    full_name: string,
    created_at: string;
    updated_at: string;
}

export type User = Admin & {
    isAdmin: boolean,
    role?: string,
}

export type Response<T> = {
    isSuccessful: boolean;
    message: string;
    data: T
} 