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
            message: "College created successfully",
            data: data
        }
    } catch (error) {
        throw error;
    }
}

const update = async ({college_name, id}: {college_name: string, id: string}): Promise<Response<College>> => {
    try {
        const { data, error, status } = await supabase
            .from(tableName)
            .update({ 
                college_name 
            })
            .eq("id", id)
            .select('*')
            .single();

        if (error && status !== 406) {
            throw error;
        }

        return {
            isSuccessful: true,
            message: "College created successfully",
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
            message: "College created successfully",
            data: data || [],
        } 
    } catch (error) {
        throw error;
    }
}

const getByIds = async (ids: string[]): Promise<Response<College[] | []>> => {
    try {
        if (ids.length === 0) {
            return {
                isSuccessful: true,
                message: "College created successfully",
                data: [],
            } 
        }
        // console.log("🚀 ~ getByIds ~ ids:", ids)

        const { data, error, status } = await supabase
            .from(tableName)
            .select('*')
            .in('id', ids)
            .order('college_name', {ascending: true});
        // console.log("🚀 ~ getByIds ~ data:", data)
            
        if (error && status !== 406) {
            throw error;
        }

        return {
            isSuccessful: true,
            message: "College created successfully",
            data: data || [],
        } 
    } catch (error) {
        throw error;
    }
}



export default {
    create,
    getAll,
    update,
    getByIds,
}
