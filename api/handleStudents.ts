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

export default {
    getById,
    create,
}
