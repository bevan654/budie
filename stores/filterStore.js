import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const defaultFilters = {
  universities: [],
  courses: [],
  years: [],
  studyTimes: [],
  studyMethod: '',
  ageRange: [18, 25],
};

const useFilterStore = create(
  persist(
    (set, get) => ({
      activeFilters: { ...defaultFilters },
      loading: false,

      setFilters: (filters) => set({ activeFilters: filters }),

      clearFilters: () => set({ activeFilters: { ...defaultFilters } }),

      hasActiveFilters: () => {
        const f = get().activeFilters;
        return (
          f.universities?.length > 0 ||
          f.courses.length > 0 ||
          f.years.length > 0 ||
          f.studyTimes.length > 0 ||
          f.studyMethod !== '' ||
          f.ageRange[0] !== 18 ||
          f.ageRange[1] !== 25
        );
      },
    }),
    {
      name: 'budie-filters',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useFilterStore;
