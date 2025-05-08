import { supabase } from "@/lib/supabase"
import { Admin, Response } from "@/types/api";
import { User } from "@supabase/supabase-js";

const tableName = "admins"

type AddAdminResponse = {
    user: User,
    admin: Admin,
}

type AddAdminPayload = {
    email: string,
    full_name: string
}

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

const addAdmin = async ({ email, full_name }: AddAdminPayload): Promise<Response<AddAdminResponse>> => {
    try {
        // Validate inputs
        if (!email || !full_name) {
            throw new Error('Email, full name');
        }
    
        const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_PROJECT_URL}/functions/v1/add_admin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({ 
                email,
                full_name
             }),
        });
    
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message);
        }
    
        if (!response.ok) {
            throw new Error(data.message);
        }
    
        // console.log('Admin created successfully:', data);
        return {
            isSuccessful: true,
            message: "Admins selected successfully",
            data,
        } 
    } catch (error) {
        console.error('Error in createAdmin function:', error);
        throw error;
    }
};

export default {
    getAll,
    addAdmin,
    getAdminById,
    getAdminByEmail,
}
