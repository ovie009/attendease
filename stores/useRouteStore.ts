import { create } from 'zustand';
import { Course, Lecturer } from '@/types/api';

interface RouteState {
    _editCourse: Course | null,
    _setEditCourse: (object: Course) => void,
    _lecturer: Lecturer | null,
    _setLecturer: (object: Lecturer) => void,
}

export const useRouteStore = create<RouteState>((set) => ({
    _editCourse: null,
    _setEditCourse: (object) => set({ _editCourse: object }),
    _lecturer: null,
    _setLecturer: (object) => set({ _lecturer: object }),
}));