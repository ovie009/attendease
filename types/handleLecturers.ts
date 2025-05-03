import { supabase } from "@/lib/supabase"
import { Lecturer, Response } from "@/types/api";
import { Role } from "./general";

const tableName = "lecturers"

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

export default {
    create,
    getAll,
    getByDepartmentId,
    getByDepartmentIds,
}
