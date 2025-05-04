import { supabase } from "@/lib/supabase"
import { Department, Response } from "@/types/api";

const tableName = "departments"

const create = async ({department_name, college_id, course_duration}: {department_name: string, college_id: string, course_duration: number}): Promise<Response<Department>> => {
    try {
        const { data, error, status } = await supabase
            .from(tableName)
            .insert({ 
                department_name,
                course_duration,
                college_id,
            })
            .select('*')
            .single();

        if (error && status !== 406) {
            throw error;
        }

        return {
            isSuccessful: true,
            message: "Department created successfully",
            data: data
        }
    } catch (error) {
        throw error;
    }
}

const getAll = async (): Promise<Response<Department[] | []>> => {
    try {
        const { data, error, status } = await supabase
            .from(tableName)
            .select('*')
            .order('department_name', {ascending: true});

        if (error && status !== 406) {
            throw error;
        }

        return {
            isSuccessful: true,
            message: "Departemnts selected successfully",
            data: data || [],
        } 
    } catch (error) {
        throw error;
    }
}

const getByCollegeId = async (college_id: string): Promise<Response<Department[] | []>> => {
    try {
        const { data, error, status } = await supabase
            .from(tableName)
            .select('*')
            .eq('college_id', college_id)
            .order('department_name', {ascending: true});

        if (error && status !== 406) {
            throw error;
        }

        return {
            isSuccessful: true,
            message: "Departemnts selected successfully",
            data: data || [],
        } 
    } catch (error) {
        throw error;
    }
}

export default {
    create,
    getAll,
    getByCollegeId,
}
