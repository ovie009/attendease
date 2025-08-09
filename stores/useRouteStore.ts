import { create } from 'zustand';
import { Course } from '@/types/api';

interface RouteState {
    _editCourse: Course | null,
    _setEditCourse: (object: Course) => void,
}

export const useRouteStore = create<RouteState>((set) => ({
    _editCourse: null,
    _setEditCourse: (object) => set({ _editCourse: object }),
}));