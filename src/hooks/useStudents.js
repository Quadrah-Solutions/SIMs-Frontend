import { useState, useEffect } from 'react';

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

  useEffect(() => {
    console.log('useStudents hook is running');
    
    // Simple mock data inside the hook
    const mockStudentData = {
      students: [
        { 
          id: 1, 
          name: "Ama Mensah", 
          studentId: "STU001", 
          grade: "Grade 7", 
          className: "7A", 
          allergies: "Peanuts, Dust" 
        },
        { 
          id: 2, 
          name: "Janice Hagan", 
          studentId: "STU002", 
          grade: "Grade 8", 
          className: "8B", 
          allergies: "None" 
        }
      ],
      grades: ["Grade 7", "Grade 8", "Grade 9"],
      classes: ["7A", "7B", "8A", "8B"]
    };

    // Simulate API call
    setTimeout(() => {
      console.log('Setting student data');
      setStudentsData({
        students: mockStudentData.students,
        grades: mockStudentData.grades,
        classes: mockStudentData.classes,
        loading: false,
        error: null,
        currentPage: 1,
        totalPages: 3,
        totalCount: 15
      });
    }, 1000);

  }, []);

  const refetch = (page = 1) => {
    console.log('Refetch called with page:', page);
  };

  const updateFilters = (newFilters) => {
    console.log('Filters updated:', newFilters);
  };

  return {
    ...studentsData,
    filters: { search: '', grade: '', class: '' },
    refetch,
    updateFilters
  };
};