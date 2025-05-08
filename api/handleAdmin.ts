import { supabase } from "@/lib/supabase"
import { Admin, Response } from "@/types/api";

const tableName = "admins"

const getAdminByEmail = async (email: string): Promise<Response<Admin | null>> => {
    try {
        const { data, error, status } = await supabase
            .from(tableName)
            .select('*')
            .eq('email', email)
            .single();

        if (error && status !== 406) {
            throw error;
        }

        return {
            isSuccessful: true,
            message: "Admin selected successfully",
            data
        }
    } catch (error) {
        throw error;
    }
}

const getAdminById = async (id: string): Promise<Response<Admin | null>> => {
    try {
        const { data, error, status } = await supabase
            .from(tableName)
            .select('*')
            .eq('id', id)
            .single();
            // console.log("🚀 ~ getAdminById ~ data:", data)
            // console.log("🚀 ~ getAdminById ~ id:", id)

        if (error && status !== 406) {
            throw error;
        }

        return {
            isSuccessful: true,
            message: "Admin selected successfully",
            data
        }
    } catch (error) {
        throw error;
    }
}

const getAll = async (): Promise<Response<Admin[] | []>> => {
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
            message: "Location created successfully",
            data: data || [],
        } 
    } catch (error) {
        throw error;
    }
}

export default {
    getAdminByEmail,
    getAdminById,
    getAll,
}
