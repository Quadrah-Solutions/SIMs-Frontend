import { useState, useEffect, useCallback } from 'react';
import { visitService, mockVisitData } from '../services/visitService';

// Debounce utility function
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const useVisits = () => {
  const [visitsData, setVisitsData] = useState({
    visits: [],
    grades: [],
    classes: [],
    conditions: [],
    loading: true,
    error: null,
    currentPage: 1,
    totalPages: 1,
    totalCount: 0
  });

  const [filters, setFilters] = useState({
    search: '',
    grade: '',
    class: '',
    condition: '',
    dateFrom: '',
    dateTo: ''
  });

  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const [students, setStudents] = useState([]);

  // Create a debounced version of setDebouncedFilters
  const updateDebouncedFilters = useCallback(
    debounce((newFilters) => {
      setDebouncedFilters(newFilters);
    }, 300), // 300ms delay
    []
  );

  // Update debounced filters when filters change
  useEffect(() => {
    updateDebouncedFilters(filters);
  }, [filters, updateDebouncedFilters]);

  // Fetch visits when debounced filters change
  useEffect(() => {
    fetchVisits(1);
  }, [debouncedFilters]);

  const fetchVisits = async (page = 1) => {
    try {
      console.log('🔄 Fetching visits - Page', page);
      console.log('Applied filters:', debouncedFilters);
      
      setVisitsData(prev => ({ ...prev, loading: true, error: null }));
      
      // Transform filter keys for API
      const apiFilters = {
        ...debouncedFilters,
        className: debouncedFilters.class
      };
      
      const apiData = await visitService.getVisits(page, 10, apiFilters);
      
      setVisitsData(prev => ({
        ...prev,
        visits: apiData.visits || [],
        currentPage: apiData.currentPage || page,
        totalPages: apiData.totalPages || 1,
        totalCount: apiData.totalCount || 0,
        loading: false
      }));
      
    } catch (error) {
      console.error('❌ Error in fetchVisits:', error);
      setVisitsData(prev => ({
        ...prev,
        error: error.message,
        loading: false,
        visits: []
      }));
    }
  };

  // Fetch grades and classes
  const fetchGradesAndClasses = async () => {
    try {
      // Try to fetch from API first, fallback to mock data if it fails
      let grades, classes, conditions;
      
      try {
        // Use the service that fetches both concurrently
        const { grades: fetchedGrades, classes: fetchedClasses } = await visitService.getGradesAndClasses();
        grades = fetchedGrades;
        classes = fetchedClasses;
        conditions = await visitService.getConditions();
      } catch (apiError) {
        console.warn('API not available for grades/classes, using mock data');
        grades = mockVisitData.grades;
        classes = mockVisitData.classes;
        conditions = mockVisitData.conditions;
      }

      setVisitsData(prev => ({
        ...prev,
        grades: grades || [],
        classes: classes || [],
        conditions: conditions || []
      }));
      
    } catch (error) {
      console.error('Error fetching grades and classes:', error);
    }
  };

  // Fetch students from API
  const fetchStudents = async () => {
    try {
      const studentsData = await visitService.getStudents();
      setStudents(studentsData);
    } catch (error) {
      console.error('Error fetching students:', error);
      // Set mock students for development
      setStudents([
        { id: 1, studentId: "STU-2025-FWV0", firstName: "Bryan", lastName: "Danquah", gradeLevel: "Grade 9" },
        { id: 2, studentId: "STU-2025-ABC1", firstName: "John", lastName: "Doe", gradeLevel: "Grade 10" },
        { id: 3, studentId: "STU-2025-XYZ2", firstName: "Jane", lastName: "Smith", gradeLevel: "Grade 8" }
      ]);
    }
  };

  useEffect(() => {
    console.log('useVisits hook is running');
    
    const initializeData = async () => {
      await fetchVisits(1);
      await fetchGradesAndClasses();
      await fetchStudents(); // Fetch students too
    };

    initializeData();
  }, []);

  // Refetch when filters change
  useEffect(() => {
    fetchVisits(1);
  }, [filters]);

  const refetch = (page = 1) => {
    console.log('Refetch called with page:', page);
    fetchVisits(page);
  };

  const updateFilters = (newFilters) => {
    console.log('Filters updated:', newFilters);
    setFilters(newFilters);
  };

  const clearFilters = () => {
    console.log('Clearing filters');
    setFilters({
      search: '',
      grade: '',
      class: '',
      condition: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  const applyFilters = () => {
    console.log('Applying filters');
    fetchVisits(1);
  };

  // Return everything including students
  return {
    ...visitsData,
    filters,
    students,
    refetch: (page = 1) => fetchVisits(page),
    updateFilters,
    clearFilters,
    applyFilters: () => fetchVisits(1),
    fetchStudents
  };
};