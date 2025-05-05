import { supabase } from "@/lib/supabase"
import { Response, RfidCard } from "@/types/api";
import { UserType } from "@/types/general";

const tableName = "rfid_cards"

const create = async (payload: {card_uid: string, assigned_for: UserType}): Promise<Response<RfidCard>> => {
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

const getUnassignedLecturerCards = async (): Promise<Response<RfidCard[] | []>> => {
    try {
        const { data, error, status } = await supabase
            .from(tableName)
            .select('*')
            .eq('assigned_for', 'Lecturer')
            .is('lecturer_id', null)
            .is('student_id', null)
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
    getUnassignedLecturerCards,
}
