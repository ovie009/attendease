import { supabase } from "@/lib/supabase"
import { Course, Department, Response } from "@/types/api";
import { Level, Semeter } from "@/types/general";

const tableName = "courses"

type Courses = Array<{course_title: string, course_code: string}>

type AddCoursesPayload = {
    department_id: string,
    level: Level, 
    semester: Semeter, 
    courses: Courses
}

type AddCoursePayload = {
    department_id: string,
    level: Level, 
    semester: Semeter, 
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
            message: "Department created successfully",
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
            message: "Department created successfully",
            data: data
        }
    } catch (error) {
        throw error;
    }
}

const getAll = async (): Promise<Response<Department[] | []>> => {
    try {
        const { data, error, status } = await supabase
            .from(tableName)
            .select('*')
            .order('department_name', {ascending: true});

        if (error && status !== 406) {
            throw error;
        }

        return {
            isSuccessful: true,
            message: "Departments selected successfully",
            data: data || [],
        } 
    } catch (error) {
        throw error;
    }
}

const getByCollegeId = async (college_id: string): Promise<Response<Department[] | []>> => {
    try {
        const { data, error, status } = await supabase
            .from(tableName)
            .select('*')
            .eq('college_id', college_id)
            .order('department_name', {ascending: true});

        if (error && status !== 406) {
            throw error;
        }

        return {
            isSuccessful: true,
            message: "Departments selected successfully",
            data: data || [],
        } 
    } catch (error) {
        throw error;
    }
}

const getByIds = async (ids: string[]): Promise<Response<Department[] | []>> => {
    try {
        if (ids.length === 0) {
            return {
                isSuccessful: true,
                message: "Departments selected successfully",
                data: [],
            }
        }

        const { data, error, status } = await supabase
            .from(tableName)
            .select('*')
            .in('id', ids)
            .order('department_name', {ascending: true});

        if (error && status !== 406) {
            throw error;
        }

        return {
            isSuccessful: true,
            message: "Departments selected successfully",
            data: data || [],
        } 
    } catch (error) {
        throw error;
    }
}

export default {
    create,
    getAll,
    getByIds,
    addCourses,
    getByCollegeId,
}
