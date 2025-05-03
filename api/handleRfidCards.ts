import { supabase } from "@/lib/supabase"
import { Response, RfidCard } from "@/types/api";

const tableName = "rfid_cards"

const create = async (payload: {card_uid: string, assigned_for: string}): Promise<Response<RfidCard>> => {
    try {
        const { data, error, status } = await supabase
            .from(tableName)
            .insert(payload)
            .select('*')
            .single()

        if (error && status !== 406) {
            throw error;
        }

        return {
            isSuccessful: true,
            message: "card inserted successfully",
            data,
        } 
    } catch (error) {
        throw error;
    }
}

const getAll = async (): Promise<Response<RfidCard[] | []>> => {
    try {
        const { data, error, status } = await supabase
            .from(tableName)
            .select('*')
            .order('card_uid', {ascending: true});

        if (error && status !== 406) {
            throw error;
        }

        return {
            isSuccessful: true,
            message: "Rfid cards selected successfully",
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
