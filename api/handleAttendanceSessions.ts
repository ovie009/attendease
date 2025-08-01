import { supabase } from "@/lib/supabase"
import { AttendanceSession, Course, Response } from "@/types/api";
import { Level, Semester } from "@/types/general";

const tableName = "attendance_sessions"

type Courses = Array<{course_title: string, course_code: string}>

type AddCoursesPayload = {
    department_id: string,
    level: Level, 
    semester: Semester, 
    courses: Courses
}

type CreateAcademicSessionPayload = {
    lecturer_id: string,
    course_id: string, 
    started_at: string, 
    ended_at: string,
    latitude: number,
    longitude: number,
    academic_session: string,
    semester: Semester
}

const create = async (payload: CreateAcademicSessionPayload): Promise<Response<AttendanceSession>> => {
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

const getActiveSessionByLecturerId = async ({lecturer_id}: {lecturer_id: string}): Promise<Response<AttendanceSession | null>> => {
    try {
        const { data, error, status } = await supabase
            .from(tableName)
            .select('*')
            .eq('lecturer_id', lecturer_id)
            .eq('is_active', true)
            .single();

        if (error && status !== 406) {
            throw error;
        }

        return {
            isSuccessful: true,
            message: "Attendnace session selected successfully",
            data: data,
        } 
    } catch (error) {
        throw error;
    }
}

const getActiveSessionByCourseIds = async ({course_ids}: {course_ids: string[]}): Promise<Response<AttendanceSession[]>> => {
    try {
        const { data, error, status } = await supabase
            .from(tableName)
            .select('*')
            .in('course_id', course_ids)
            .eq('is_active', true)

        if (error && status !== 406) {
            throw error;
        }

        return {
            isSuccessful: true,
            message: "Attendnace session selected successfully",
            data: data || [],
        } 
    } catch (error) {
        throw error;
    }
}

const getAttendanceSessionBySemesterAcademicSesssionAndCourseIds = async ({course_ids, semester, session}: {course_ids: string[], semester: Semester, session: string}): Promise<Response<AttendanceSession[]>> => {
    try {
        const { data, error, status } = await supabase
            .from(tableName)
            .select('*')
            .in('course_id', course_ids)
            .eq('semester', semester)
            .eq('academic_session', session)

        if (error && status !== 406) {
            throw error;
        }

        return {
            isSuccessful: true,
            message: "Attendnace session selected successfully",
            data: data || [],
        } 
    } catch (error) {
        throw error;
    }
}

export default {
    create,
    getActiveSessionByLecturerId,
    getActiveSessionByCourseIds,
    getAttendanceSessionBySemesterAcademicSesssionAndCourseIds,
}
