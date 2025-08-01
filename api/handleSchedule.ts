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

type UpdateSchedulePayload = {
    course_code: string,
	course_id: string,
	venue: string,
    level: Level,
	days_of_the_week: number[],
	lecture_hours: number[],
	lecture_start_time: number[],
	id: string,
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

const getBySessionSemesterAndCourseCode = async ({session, semester, course_codes}: {session: string, semester: Semester, course_codes: string[]}): Promise<Response<Schedule[]>> => {
    try {
        const { data, error, status } = await supabase
            .from(tableName)
            .select('*')
            .eq('session', session)
            .eq('semester', semester)
            .in('course_code', course_codes)

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

const getBySessionSemesterAndCourseIds = async ({session, semester, course_ids}: {session: string, semester: Semester, course_ids: string[]}): Promise<Response<Schedule[]>> => {
    try {
        const { data, error, status } = await supabase
            .from(tableName)
            .select('*')
            .eq('session', session)
            .eq('semester', semester)
            .in('course_id', course_ids)

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

const update = async ({id, course_code, level, course_id, venue, days_of_the_week, lecture_hours, lecture_start_time}: UpdateSchedulePayload): Promise<Response<Schedule>> => {
    try {

        if (!id || !course_code || !level || !course_id || !venue || !days_of_the_week || !lecture_hours || !lecture_start_time) {
            throw new Error('All fields are required');
        }
        console.log("🚀 ~ update ~ days_of_the_week:", days_of_the_week)
        console.log("🚀 ~ update ~ lecture_hours:", lecture_hours)
        console.log("🚀 ~ update ~ lecture_start_time:", lecture_start_time)

        

        const { data, error, status } = await supabase
            .from(tableName)
            .update({
                course_code,
                course_id,
                venue,
                level,
                days_of_the_week,
                lecture_hours,
                lecture_start_time
            })
            .eq('id', id)
            .select('*')
            .single()

        if (error && status !== 406) {
            throw error;
        }

        return {
            isSuccessful: true,
            message: "Courses selected successfully",
            data,
        }
    } catch (error:any) {
        throw error;
    }
}

export default {
    update,
    getAll,
    addSchudules,
    getByCourseSchedule,
    getBySessionAndSemester,
    getBySessionSemesterAndLevel,
    getBySessionSemesterAndCourseCode,
    getBySessionSemesterAndCourseIds
}
