import { supabase } from "@/lib/supabase"
import { Course, Response } from "@/types/api";
import { Level, Semester } from "@/types/general";

const tableName = "courses"

type Courses = Array<{course_title: string, course_code: string}>

type AddCoursesPayload = {
    department_id: string,
    level: Level, 
    semester: Semester, 
    courses: Courses
}

type AddCoursePayload = {
    department_id: string,
    level: Level, 
    semester: Semester, 
    course_title: string,
    course_code: string,
}

const create = async ({department_id, level, semester, course_code, course_title}: AddCoursePayload): Promise<Response<Course>> => {
    try {
        const { data, error, status } = await supabase
            .from(tableName)
            .insert({ 
                department_id,
                level,
                semester,
                course_code,
                course_title
            })
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

const addCourses = async ({department_id, level, semester, courses}: AddCoursesPayload): Promise<Response<null>> => {
    try {
        const { data, error } = await supabase
            .rpc('add_courses', { 
                department_id,
                level,
                semester,
                courses
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

const getAll = async (): Promise<Response<Course[] | []>> => {
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

const getByDepartmentId = async (department_id: string): Promise<Response<Course[] | []>> => {
    try {
        const { data, error, status } = await supabase
            .from(tableName)
            .select('*')
            .eq('department_id', department_id)
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

const getById = async (id: string): Promise<Response<Course | null>> => {
    try {
        const { data, error, status } = await supabase
            .from(tableName)
            .select('*')
            .eq('id', id)
            .single();

        if (error && status !== 406) {
            throw error;
        }

        return {
            isSuccessful: true,
            message: "Course selected successfully",
            data,
        } 
    } catch (error) {
        throw error;
    }
}

const getByIds = async (ids: string[]): Promise<Response<Course[] | []>> => {
    try {
        if (ids.length === 0) {
            return {
                isSuccessful: true,
                message: "Course selected successfully",
                data: [],
            }
        }

        const { data, error, status } = await supabase
            .from(tableName)
            .select('*')
            .in('id', ids)
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

export default {
    create,
    getAll,
    getById,
    getByIds,
    addCourses,
    getByDepartmentId,
}
