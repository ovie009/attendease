export type College = {
    id: string;
    college_name: string;
    created_at: string;
    updated_at: string;
};

export type Response<T> = {
    isSuccessful: boolean;
    message: string;
    data: T
} 