import { supabase } from "@/lib/supabase"
import { Response, Student } from "@/types/api";

const tableName = "students";

const create = async (payload: Omit<Student, 'created_at' | 'updated_at' | 'is_active'>) => {
    try {
        const { data, error, status } = await supabase
            .from(tableName)
            .insert(payload)
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

const getById = async (id: string): Promise<Response<Student | null>> => {
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
            message: "Student selected successfully",
            data,
        } 
    } catch (error) {
        throw error;
    }
}

const getByRfids = async (rfids: string[]): Promise<Response<Array<Student>>> => {
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
            message: "Student selected successfully",
            data: data || [],
        } 
    } catch (error) {
        throw error;
    }
}

const getByIds = async (ids: string[]): Promise<Response<Array<Student>>> => {
    try {
        const { data, error, status } = await supabase
            .from(tableName)
            .select('*')
            .in('id', ids)

        if (error && status !== 406) {
            throw error;
        }

        return {
            isSuccessful: true,
            message: "Student selected successfully",
            data: data || [],
        } 
    } catch (error) {
        throw error;
    }
}

const updateStudent = async ({ id, pin, rfid }: {id: string, pin?: string, rfid?: string }):  Promise<Response<Student>> => {
    try {

        const payload: {id: string, pin?: string, rfid?: string } = { id };

        if (!id) {
            throw new Error('Id is required')
        }

        if (pin) {
            payload.pin = pin;
        }

        if (rfid) {
            payload.rfid = rfid;
        }

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

type UpdateDevicePayload = {
    p_auth_string: string,
    p_device_id: string, 
    p_student_id: string, 
}

const updateDeviceId = async (payload: UpdateDevicePayload): Promise<Response<Student>> => {
    console.log("🚀 ~ create ~ payload:", payload)
    try {
        const { data, error } = await supabase
            .rpc('change_student_device_id', payload);

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
    getById,
    getByIds,
    create,
    getByRfids,
    updateStudent,
    updateDeviceId
}
