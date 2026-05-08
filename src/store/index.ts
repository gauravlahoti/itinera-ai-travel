import { create } from 'zustand';
import { Trip, Activity } from '../types';

interface AppState {
  currentTrip: Trip | null;
  setCurrentTrip: (trip: Trip) => void;
  updateActivityTime: (dayId: string, activityId: string, newStartTime: string) => void;
  reorderActivities: (dayId: string, activeId: string, overId: string) => void;
  replaceActivity: (dayId: string, oldActivityId: string, newActivity: Activity) => void;
  setBudget: (amount: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentTrip: null,
  setCurrentTrip: (trip) => set({ currentTrip: trip }),
  
  updateActivityTime: (dayId, activityId, newStartTime) => set((state) => {
    if (!state.currentTrip) return state;
    
    const newDays = state.currentTrip.days.map((day) => {
      if (day.id !== dayId) return day;
      
      const newActivities = day.activities.map((act) => {
        if (act.id !== activityId) return act;
        return { ...act, startTime: newStartTime };
      });
      
      return { ...day, activities: newActivities };
    });
    
    return { currentTrip: { ...state.currentTrip, days: newDays } };
  }),
  
  reorderActivities: (dayId, activeId, overId) => set((state) => {
    if (!state.currentTrip) return state;
    
    const newDays = state.currentTrip.days.map((day) => {
      if (day.id !== dayId) return day;
      
      const oldIndex = day.activities.findIndex((a) => a.id === activeId);
      const newIndex = day.activities.findIndex((a) => a.id === overId);
      
      if (oldIndex === -1 || newIndex === -1) return day;

      const newActivities = Array.from(day.activities);
      const [removed] = newActivities.splice(oldIndex, 1);
      newActivities.splice(newIndex, 0, removed);
      
      return { ...day, activities: newActivities };
    });
    
    return { currentTrip: { ...state.currentTrip, days: newDays } };
  }),

  setBudget: (amount) => set((state) => {
    if (!state.currentTrip) return state;
    return {
      currentTrip: {
        ...state.currentTrip,
        budget: { ...state.currentTrip.budget, total: amount }
      }
    };
  }),

  replaceActivity: (dayId, oldActivityId, newActivity) => set((state) => {
    if (!state.currentTrip) return state;
    const newDays = state.currentTrip.days.map((day) => {
      if (day.id !== dayId) return day;
      const newActivities = day.activities.map((a) => (a.id === oldActivityId ? newActivity : a));
      return { ...day, activities: newActivities };
    });
    return { currentTrip: { ...state.currentTrip, days: newDays } };
  }),
}));
