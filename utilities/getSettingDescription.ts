import { Key } from "@/types/general"

export const getSettingDescription = (key: Key): string => {
    if (key === 'academic_session') return 'Academic Session';
    if (key === 'semester') return 'Semester';
    if (key === 'start_of_semester') return 'Start of Semester';
    if (key === 'end_of_semester') return 'End of Semester';
    return '';
} 