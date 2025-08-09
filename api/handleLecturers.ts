import { supabase } from "@/lib/supabase"
import { Dean, Lecturer, Response } from "@/types/api";
import { Role } from "../types/general";
import { User } from "@supabase/supabase-js";

const tableName = "lecturers"

type AddLecturerResponse = {
    user: User,
    lecturer: Lecturer,
}

type AddLecturerPayload = {
    email: string,
    full_name: string,
    department_id: string,
    role: Role | undefined,
    rfid: string,
    course_ids: string[]
}

type UpdateLecturerPayload = {
    id: string,
    full_name?: string,
    department_id?: string,
    role?: Role,
    course_ids?: string[],
    pin?: string,
    rfid?: string,
}

const create = async ({full_name, role, department_id}: {full_name: string, role: Role, department_id: string}): Promise<Response<Lecturer>> => {
    try {
        const { data, error, status } = await supabase
            .from(tableName)
            .insert({ 
                department_id,
                full_name,
                role,
            })
            .select('*')
            .single();

        if (error && status !== 406) {
            throw error;
        }

        return {
            isSuccessful: true,
            message: "Lecturer created successfully",
            data: data
        }
    } catch (error) {
        throw error;
    }
}

const getAll = async (): Promise<Response<Lecturer[] | []>> => {
    try {
        const { data, error, status } = await supabase
            .from(tableName)
            .select('*')
            .order('full_name', {ascending: true});

        if (error && status !== 406) {
            throw error;
        }

        return {
            isSuccessful: true,
            message: "Lecturers selected successfully",
            data: data || [],
        } 
    } catch (error) {
        throw error;
    }
}

const getById = async (id: string): Promise<Response<Lecturer | null>> => {
    try {
        const { data, error, status } = await supabase
            .from(tableName)
            .select('*')
            .eq('id', id)
            .single();

        if (error && status !== 406) {
            throw error;
        }

        return {
            isSuccessful: true,
            message: "Lecturers selected successfully",
            data,
        } 
    } catch (error) {
        throw error;
    }
}

const getByRfids = async (rfids: string[]): Promise<Response<Array<Lecturer>>> => {
    try {
        const { data, error, status } = await supabase
            .from(tableName)
            .select('*')
            .in('rfid', rfids)

        if (error && status !== 406) {
            throw error;
        }

        return {
            isSuccessful: true,
            message: "Lecturers selected successfully",
            data: data || [],
        } 
    } catch (error) {
        throw error;
    }
}

const getByDepartmentId = async (department_id: string): Promise<Response<Lecturer[] | []>> => {
    try {
        const { data, error, status } = await supabase
            .from(tableName)
            .select('*')
            .eq('department_id', department_id)
            .order('full_name', {ascending: true});

        if (error && status !== 406) {
            throw error;
        }

        return {
            isSuccessful: true,
            message: "Lecturers selected successfully",
            data: data || [],
        } 
    } catch (error) {
        throw error;
    }
}

const getByCourseId = async (course_id: string): Promise<Response<Lecturer[] | []>> => {
    try {
        const { data, error, status } = await supabase
            .from(tableName)
            .select('*')
            .contains('course_ids', [course_id])
            .order('full_name', { ascending: true });

        if (error && status !== 406) {
            throw error;
        }

        return {
            isSuccessful: true,
            message: "Lecturers selected successfully",
            data: data || [],
        };
    } catch (error) {
        throw error;
    }
};

const getByDepartmentIds = async (department_ids: string[]): Promise<Response<Lecturer[] | []>> => {
    try {
        if (department_ids.length === 0) {
            return {
                isSuccessful: true,
                message: "Empty department ids",
                data: [],
            } 
        }

        const { data, error, status } = await supabase
            .from(tableName)
            .select('*')
            .in('department_id', department_ids)
            .order('full_name', {ascending: true});

        if (error && status !== 406) {
            throw error;
        }

        return {
            isSuccessful: true,
            message: "Lecturers selected successfully",
            data: data || [],
        } 
    } catch (error) {
        throw error;
    }
}

const addLecturer = async ({ email, full_name, department_id, role, rfid, course_ids }: AddLecturerPayload): Promise<Response<AddLecturerResponse>> => {
    try {
        // Validate inputs
        if (!email || !full_name || !department_id) {
            throw new Error('Email, full name, and department ID are required');
        }
    
        const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_PROJECT_URL}/functions/v1/add_lecturer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({ 
                email,
                full_name,
                department_id,
                rfid,
                course_ids,
                role // Optional, will default to 'Academic' if not provided
             }),
        });
    
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message);
        }
    
        if (!response.ok) {
            throw new Error(data.message);
        }
    
        console.log('Lecturer created successfully:', data);
        return {
            isSuccessful: true,
            message: "Lecturers selected successfully",
            data,
        } 
    } catch (error) {
        console.error('Error in createLecturer function:', error);
        throw error;
    }
};

const updateLecturer = async ({ id, full_name, department_id, role, course_ids, pin, rfid }: UpdateLecturerPayload):  Promise<Response<Lecturer>> => {
    try {

        const payload: Omit<UpdateLecturerPayload, 'id'> = {};

        if (!id) {
            throw new Error('Id is required')
        }

        if (!full_name && !department_id && !role && !course_ids && !pin && !rfid) {
            throw new Error('Empty fields')
        }

        if (full_name) {
            payload.full_name = full_name;
        }

        if (department_id) {
            payload.department_id = department_id;
        }

        if (role) {
            payload.role = role;
        }

        if (pin) {
            payload.pin = pin;
        }

        if (rfid) {
            payload.rfid = rfid;
        }

        if (course_ids) {
            payload.course_ids = course_ids;
        }
        console.log("🚀 ~ updateLecturer ~ payload:", payload)

        const { data, error, status } = await supabase
            .from(tableName)
            .update(payload)
            .eq("id", id)
            .select('*')
            .single();

        if (error && status !== 406) {
            throw error;
        }

        return {
            isSuccessful: true,
            message: "Lecturer created successfully",
            data: data
        }
    } catch (error) {
            console.error('Error in createLecturer function:', error);
        throw error;
    }
}

const getCollegeDeans = async (): Promise<Response<Array<Dean>>> => {
    try {
        const { data, error } = await supabase
            .rpc('get_college_deans');

        if (error) {
            throw error;
        }

        return {
            isSuccessful: true,
            message: "Course created successfully",
            data: data
        }
    } catch (error) {
        throw error;
    }
}

export default {
    create,
    getAll,
    getById,
    getByRfids,
    addLecturer,
    getByCourseId,
    updateLecturer,
    getCollegeDeans,
    getByDepartmentId,
    getByDepartmentIds,
}
