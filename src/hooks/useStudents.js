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
      console.log(`🔄 Fetching students - Page ${page}, Filters:`, filters);
      setStudentsData(prev => ({ ...prev, loading: true, error: null }));
      
      const data = await studentService.getStudents(page, 10, filters);
      
      console.log('✅ API data received:', {
        studentsCount: data.students?.length || 0,
        totalCount: data.totalCount,
        totalPages: data.totalPages,
        currentPage: data.currentPage
      });
      
      setStudentsData(prev => ({
        ...prev,
        students: data.students || [],
        currentPage: data.currentPage || page,
        totalPages: data.totalPages || 1,
        totalCount: data.totalCount || 0,
        loading: false
      }));
      
    } catch (error) {
      console.error('❌ Error fetching students:', error);
      setStudentsData(prev => ({
        ...prev,
        error: error.message,
        loading: false,
        students: []
      }));
    }
  };

  const fetchGradesAndClasses = async () => {
    try {
      const { grades, classes } = await studentService.getGradesAndClasses();
      
      setStudentsData(prev => ({
        ...prev,
        grades: grades || [],
        classes: classes || []
      }));
    } catch (error) {
      console.error('Error fetching grades and classes:', error);
      // Use mock data as fallback
      setStudentsData(prev => ({
        ...prev,
        grades: mockStudentData.grades,
        classes: mockStudentData.classes
      }));
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
      const newStudent = await studentService.createStudent(studentData);
      // Refetch students to include the new one
      await refetch(studentsData.currentPage);
      return newStudent;
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