import { supabase } from "@/lib/supabase"
import { Ticket, Response } from "@/types/api"

const tableName = "tickets"

// Create a new ticket
const create = async (ticketData: Omit<Ticket, 'id' | 'created_at' | 'updated_at' | 'is_active'>): Promise<Response<null>> => {
    try {
        const { error, status } = await supabase
            .from(tableName)
            .insert(ticketData)

        if (error && status !== 406) throw error

        return {
            isSuccessful: true,
            message: "Ticket created successfully",
            data: null,
        }
    } catch (error) {
        throw error
    }
}

// Get tickets sorted by is_active, default limit = 20
const select = async (limit: number = 20): Promise<Response<Ticket[] | []>> => {
    try {
        const { data, error, status } = await supabase
            .from(tableName)
            .select('*')
            .order('is_active', { ascending: false })
            .limit(limit)

        if (error && status !== 406) throw error

        return {
            isSuccessful: true,
            message: "Tickets fetched successfully",
            data: data || []
        }
    } catch (error) {
        throw error
    }
}

// Close a ticket (set is_active = false)
const closeTicket = async (id: string): Promise<Response<Ticket>> => {
    try {
        const { data, error, status } = await supabase
            .from(tableName)
            .update({ is_active: false })
            .eq("id", id)
            .select('*')
            .single()

        if (error && status !== 406) throw error

        return {
            isSuccessful: true,
            message: "Ticket closed successfully",
            data: data
        }
    } catch (error) {
        throw error
    }
}

export default {
    create,
    select,
    closeTicket
}
