import { supabase } from "@/lib/supabase"
import { College, Response } from "@/types/api";

const tableName = "colleges"

const create = async (college_name: string): Promise<Response<College>> => {
    try {
        const { data, error, status } = await supabase
            .from(tableName)
            .insert({ 
                college_name 
            })
            .select('*')
            .single();

        if (error && status !== 406) {
            throw error;
        }

        return {
            isSuccessful: true,
            message: "Location created successfully",
            data: data
        }
    } catch (error) {
        throw error;
    }
}

const getAll = async (): Promise<Response<College[] | []>> => {
    try {
        const { data, error, status } = await supabase
            .from(tableName)
            .select('*')
            .order('college_name', {ascending: true});

        if (error && status !== 406) {
            throw error;
        }

        return {
            isSuccessful: true,
            message: "Location created successfully",
            data: data || [],
        } 
    } catch (error) {
        throw error;
    }
}

export default {
    create,
    getAll,
}
