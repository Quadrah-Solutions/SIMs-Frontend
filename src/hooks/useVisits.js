import { useState, useEffect } from 'react';

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

  useEffect(() => {
    console.log('useVisits hook is running');
    
    // Simple mock data inside the hook
    const mockVisitData = {
      visits: [
        { 
          id: 1, 
          date: "2024-01-15T10:30:00", 
          student: "Ama Mensah", 
          studentId: "STU001",
          grade: "Grade 7",
          className: "7A",
          reason: "Headache", 
          outcome: "Medicated",
          nurse: "Nurse Akua",
          condition: "Stable"
        },
        { 
          id: 2, 
          date: "2024-01-15T11:15:00", 
          student: "Kofi Asante", 
          studentId: "STU002",
          grade: "Grade 8",
          className: "8B",
          reason: "Fever", 
          outcome: "Sent Home",
          nurse: "Nurse Yaw",
          condition: "Moderate"
        },
        { 
          id: 3, 
          date: "2024-01-14T14:20:00", 
          student: "Esi Boateng", 
          studentId: "STU003",
          grade: "Grade 7",
          className: "7C",
          reason: "Allergy Reaction", 
          outcome: "Treated",
          nurse: "Nurse Akua",
          condition: "Stable"
        }
      ],
      grades: ["Grade 7", "Grade 8", "Grade 9"],
      classes: ["7A", "7B", "8A", "8B"],
      conditions: ["All", "Mild", "Moderate", "Serious", "Stable"]
    };

    // Simulate API call
    setTimeout(() => {
      console.log('Setting visit data');
      setVisitsData({
        visits: mockVisitData.visits,
        grades: mockVisitData.grades,
        classes: mockVisitData.classes,
        conditions: mockVisitData.conditions,
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

  const clearFilters = () => {
    console.log('Clearing filters');
  };

  return {
    ...visitsData,
    filters: { 
      search: '', 
      grade: '', 
      class: '', 
      condition: '',
      dateFrom: '',
      dateTo: ''
    },
    refetch,
    updateFilters,
    clearFilters
  };
};