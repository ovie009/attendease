import { supabase } from "@/lib/supabase"
import { AttendanceRecord, AttendanceSession, Course, Response } from "@/types/api";
import { Level, Semester } from "@/types/general";

const tableName = "attendance_records"

type Courses = Array<{course_title: string, course_code: string}>

type AddCoursesPayload = {
    department_id: string,
    level: Level, 
    semester: Semester, 
    courses: Courses
}

type CreateAttendanceRecordPayload = {
    p_student_id: string,
    p_attendance_session_id: string, 
    p_latitude: number, 
    p_longitude: number,
}

const create = async (payload: CreateAttendanceRecordPayload): Promise<Response<AttendanceRecord>> => {
    console.log("🚀 ~ create ~ payload:", payload)
    try {
        const { data, error } = await supabase
            .rpc('insert_attendance_record', payload);

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

const getAttendanceRecordsBySemesterSessionAndStudnet = async ({semester, academic_session, student_id}: {semester: Semester, academic_session: string, student_id: string}): Promise<Response<AttendanceRecord[]>> => {
    try {
        const { data, error, status } = await supabase
            .from(tableName)
            .select('*')
            .eq('semester', semester)
            .eq('student_id', student_id)
            .eq('academic_session', academic_session)

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

const getAttendanceRecordsByAttendanceSessionSemesterSessionAndStudent = async ({semester, academic_session, student_id, attendance_session_ids}: {semester: Semester, academic_session: string, student_id: string, attendance_session_ids: string[]}): Promise<Response<AttendanceRecord[]>> => {
    try {
        const { data, error, status } = await supabase
            .from(tableName)
            .select('*')
            .eq('semester', semester)
            .eq('student_id', student_id)
            .eq('academic_session', academic_session)
            .in('attendance_session_id', attendance_session_ids)
            .order('created_at', {ascending: false})

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

const getRecordsForAttendanceSession = async ({semester, academic_session, attendance_session_ids}: {semester: Semester, academic_session: string, attendance_session_ids: string[]}): Promise<Response<AttendanceRecord[]>> => {
    try {
        const { data, error, status } = await supabase
            .from(tableName)
            .select('*')
            .eq('semester', semester)
            .eq('academic_session', academic_session)
            .in('attendance_session_id', attendance_session_ids)
            .order('created_at', {ascending: true})

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
    getRecordsForAttendanceSession,
    getAttendanceRecordsBySemesterSessionAndStudnet,
    getAttendanceRecordsByAttendanceSessionSemesterSessionAndStudent,
}
