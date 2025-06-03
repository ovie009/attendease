import { supabase } from "@/lib/supabase"
import { Response, Schedule } from "@/types/api";
import { Level, Semester } from "@/types/general";
import { ProcessScheduleResponse } from "./handleGroq";

const tableName = "schedules"

type AddSchedulePayload = {
    session: string,
    level: Level, 
    semester: string,
    schedule_array: ProcessScheduleResponse[] 
}

const addSchudules = async ({schedule_array, session, level, semester}: AddSchedulePayload): Promise<Response<null>> => {
    try {
        const { data, error } = await supabase
            .rpc('add_schedules', { 
                schedule_array,
                level,
                semester,
                session,
            });

        if (error) {
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

const getAll = async (): Promise<Response<Schedule[] | []>> => {
    try {
        const { data, error, status } = await supabase
            .from(tableName)
            .select('*')
            .order('course_code', {ascending: true});

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

const getBySessionAndSemester = async ({session, semester}: {session: string, semester: Semester}): Promise<Response<Schedule[] | []>> => {
    try {
        const { data, error, status } = await supabase
            .from(tableName)
            .select('*')
            .eq('session', session)
            .eq('semester', semester)
            .order('course_code', {ascending: true})
            .order('level', {ascending: true});

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

const getBySessionSemesterAndLevel = async ({session, semester, level}: {session: string, semester: Semester, level: Level}): Promise<Response<Schedule[] | []>> => {
    try {
        const { data, error, status } = await supabase
            .from(tableName)
            .select('*')
            .eq('session', session)
            .eq('semester', semester)
            .eq('level', level)
            .order('course_code', {ascending: true})
            .order('level', {ascending: true});

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

const getByCourseSchedule = async (course_id: string): Promise<Response<Schedule | null>> => {
    try {
        const { data, error, status } = await supabase
            .from(tableName)
            .select('*')
            .eq('course_id', course_id)
            .order('created_at', {ascending: false})
            .single();

        if (error && status !== 406) {
            throw error;
        }

        return {
            isSuccessful: true,
            message: "Courses selected successfully",
            data,
        } 
    } catch (error) {
        throw error;
    }
}

export default {
    getAll,
    addSchudules,
    getByCourseSchedule,
    getBySessionAndSemester,
    getBySessionSemesterAndLevel
}
