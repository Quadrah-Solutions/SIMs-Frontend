import { useState, useEffect } from 'react';
import { studentService, mockStudentData } from '../services/studentService';

export const useStudents = () => {
  const [studentsData, setStudentsData] = useState({
    students: [],
    grades: [],
    classes: [],
    loading: true,
    error: null,
    currentPage: 1,
    totalPages: 1,
    totalCount: 0
  });

  const [filters, setFilters] = useState({
    search: '',
    grade: '',
    class: ''
  });

  const fetchStudents = async (page = 1) => {
    try {
      setStudentsData(prev => ({ ...prev, loading: true, error: null }));
      
      // Try to fetch from API first, fallback to mock data if it fails
      let data;
      try {
        data = await studentService.getStudents(page, 10, filters);
      } catch (apiError) {
        console.warn('API not available, using mock data:', apiError);
        // Use mock data with pagination simulation
        const startIndex = (page - 1) * 10;
        const endIndex = startIndex + 10;
        data = {
          students: mockStudentData.students.slice(startIndex, endIndex),
          totalPages: Math.ceil(mockStudentData.students.length / 10),
          totalCount: mockStudentData.students.length,
          currentPage: page
        };
      }

      setStudentsData(prev => ({
        ...prev,
        students: data.students,
        currentPage: data.currentPage || page,
        totalPages: data.totalPages || 1,
        totalCount: data.totalCount || data.students?.length || 0,
        loading: false
      }));
    } catch (error) {
      setStudentsData(prev => ({
        ...prev,
        error: error.message,
        loading: false
      }));
    }
  };

  const fetchGradesAndClasses = async () => {
    try {
      // Try to fetch from API first, fallback to mock data if it fails
      let grades, classes;
      try {
        grades = await studentService.getGrades();
        classes = await studentService.getClasses();
      } catch (apiError) {
        console.warn('API not available, using mock data for grades and classes');
        grades = mockStudentData.grades;
        classes = mockStudentData.classes;
      }

      setStudentsData(prev => ({
        ...prev,
        grades,
        classes
      }));
    } catch (error) {
      console.error('Error fetching grades and classes:', error);
    }
  };

  useEffect(() => {
    console.log('useStudents hook is running');
    fetchStudents(1);
    fetchGradesAndClasses();
  }, []);

  useEffect(() => {
    // Refetch students when filters change
    fetchStudents(1);
  }, [filters]);

  const refetch = (page = 1) => {
    console.log('Refetch called with page:', page);
    fetchStudents(page);
  };

  const updateFilters = (newFilters) => {
    console.log('Filters updated:', newFilters);
    setFilters(newFilters);
  };

  const createStudent = async (studentData) => {
    try {
      // Try to create via API first, fallback to mock if it fails
      try {
        const newStudent = await studentService.createStudent(studentData);
        // Refetch students to include the new one
        await fetchStudents(studentsData.currentPage);
        return newStudent;
      } catch (apiError) {
        console.warn('API not available, simulating student creation:', apiError);
        // Simulate creation with mock data
        const newStudent = {
          id: Date.now(), // Temporary ID
          ...studentData,
          studentId: studentData.studentId || `STU${Date.now()}`
        };
        
        // Update local state
        setStudentsData(prev => ({
          ...prev,
          students: [newStudent, ...prev.students],
          totalCount: prev.totalCount + 1
        }));
        
        return newStudent;
      }
    } catch (error) {
      console.error('Error creating student:', error);
      throw error;
    }
  };

  return {
    ...studentsData,
    filters,
    refetch,
    updateFilters,
    createStudent
  };
};