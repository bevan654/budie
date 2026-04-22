import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FilterContext = createContext();

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};

const FILTER_STORAGE_KEY = '@budie_filters';

const defaultFilters = {
  universities: [],
  courses: [],
  years: [],
  studyTimes: [],
  ageRange: [18, 99],
};

export const FilterProvider = ({ children }) => {
  const [activeFilters, setActiveFilters] = useState(defaultFilters);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFilters();
  }, []);

  const loadFilters = async () => {
    try {
      const stored = await AsyncStorage.getItem(FILTER_STORAGE_KEY);
      if (stored) {
        const merged = { ...defaultFilters, ...JSON.parse(stored) };
        if (merged.ageRange?.[0] === 18 && merged.ageRange?.[1] === 25) {
          merged.ageRange = [18, 99];
        }
        setActiveFilters(merged);
      }
    } catch (error) {
      // Silently fail
    } finally {
      setLoading(false);
    }
  };

  const setFilters = async (filters) => {
    try {
      setActiveFilters(filters);
      await AsyncStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filters));
    } catch (error) {
      // Silently fail
    }
  };

  const clearFilters = async () => {
    try {
      setActiveFilters(defaultFilters);
      await AsyncStorage.removeItem(FILTER_STORAGE_KEY);
    } catch (error) {
      // Silently fail
    }
  };

  const hasActiveFilters = () => {
    return (
      activeFilters.universities?.length > 0 ||
      activeFilters.courses.length > 0 ||
      activeFilters.years.length > 0 ||
      activeFilters.studyTimes.length > 0 ||
      activeFilters.ageRange[0] !== 18 ||
      activeFilters.ageRange[1] !== 99
    );
  };

  return (
    <FilterContext.Provider
      value={{
        activeFilters,
        setFilters,
        clearFilters,
        hasActiveFilters: hasActiveFilters(),
        loading,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};
