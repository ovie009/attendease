import { supabase } from "@/lib/supabase"
import { College, Response } from "@/types/api";


const create = async (college_name: string): Promise<Response & {data: College}> => {
    try {
        const { data, error, status } = await supabase
            .from('colleges')
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

export default {
    create
}
