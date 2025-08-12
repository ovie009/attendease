import { supabase } from "@/lib/supabase"
import { CourseRegistration, Response } from "@/types/api";
import { Level } from "@/types/general";

const tableName = "course_registration"

type AddCourseRegistrationPayload = {
    student_id: string,
    level: Level, 
    course_ids: string[], 
    session: string,
}

const create = async (payload: AddCourseRegistrationPayload): Promise<Response<CourseRegistration>> => {
    console.log("🚀 ~ create ~ payload:", payload)
    try {
        const { data, error, status } = await supabase
            .from(tableName)
            .insert(payload)
            .select('*')
            .single();

        if (error && status !== 406) {
            throw error;
        }

        return {
            isSuccessful: true,
            message: "Course created successfully",
            data: data
        }
    } catch (error) {
        throw error;
    }
}

const getByStudentIdAndSession = async ({student_id, session}: {student_id: string, session: string}): Promise<Response<CourseRegistration | null>> => {
    try {
        const { data, error, status } = await supabase
            .from(tableName)
            .select('*')
            .eq('student_id', student_id)
            .eq('session', session)
            .single();

        if (error && status !== 406) {
            throw error;
        }

        return {
            isSuccessful: true,
            message: "Courses selected successfully",
            data: data || null,
        } 
    } catch (error) {
        throw error;
    }
}

const getByCourseIdAndSession = async ({course_id, session}: {course_id: string, session: string}): Promise<Response<Array<CourseRegistration>>> => {
    try {
        const { data, error, status } = await supabase
            .from(tableName)
            .select('*')
            .eq('session', session)
            .contains('course_ids', [course_id])

        if (error && status !== 406) {
            throw error;
        }

        return {
            isSuccessful: true,
            message: "Courses selected successfully",
            data: data || [],
        } 
    } catch (error) {
        throw error;
    }
}

export default {
    create,
    getByCourseIdAndSession,
    getByStudentIdAndSession,
}
