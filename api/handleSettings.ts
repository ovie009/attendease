import { supabase } from "@/lib/supabase"
import { Response, Setting } from "@/types/api";
import { Key, KeyValueType } from "@/types/general";

const tableName = "settings"

export type SettingPayload = {
    key: Key,
    value: string,
    type: KeyValueType,
}

const create = async ({key, value, type}: SettingPayload): Promise<Response<Setting>> => {
    try {
        const { data, error, status } = await supabase
            .from(tableName)
            .insert({ 
                key,
                value,
                type
            })
            .select('*')
            .single();

        if (error && status !== 406) {
            throw error;
        }

        return {
            isSuccessful: true,
            message: "Setting created successfully",
            data: data
        }
    } catch (error) {
        throw error;
    }
}

const update = async ({key, value, type}: SettingPayload): Promise<Response<Setting>> => {
    try {
        const { data, error, status } = await supabase
            .from(tableName)
            .update({ 
                value,
                type,
            })
            .eq("key", key)
            .select('*')
            .single();

        if (error && status !== 406) {
            throw error;
        }

        return {
            isSuccessful: true,
            message: "Setting updated successfully",
            data: data
        }
    } catch (error) {
        throw error;
    }
}

const getAll = async (): Promise<Response<Setting[] | []>> => {
    try {
        const { data, error, status } = await supabase
            .from(tableName)
            .select('*');

        if (error && status !== 406) {
            throw error;
        }

        return {
            isSuccessful: true,
            message: "Setting selected successfully",
            data: data || [],
        } 
    } catch (error) {
        throw error;
    }
}

const getByKey = async (key: Key): Promise<Response<Setting>> => {
    try {
        const { data, error, status } = await supabase
            .from(tableName)
            .select('*')
            .eq('key', key)
            .single();
            
        if (error && status !== 406) {
            throw error;
        }

        return {
            isSuccessful: true,
            message: "Setting selected successfully",
            data,
        } 
    } catch (error) {
        throw error;
    }
}

const getByKeys = async (keys: Key[]): Promise<Response<Setting[]>> => {
    try {
        const { data, error, status } = await supabase
            .from(tableName)
            .select('*')
            .in('key', keys)
            
        if (error && status !== 406) {
            throw error;
        }

        return {
            isSuccessful: true,
            message: "Setting selected successfully",
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
    getByKey,
    getByKeys,
}
