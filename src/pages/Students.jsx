import React from 'react';
import { useStudents } from '../hooks/useStudents';
import StudentFilters from '../components/students/StudentFilters';
import StudentsTable from '../components/students/StudentsTable';

const Students = () => {
  const { 
    students, 
    grades, 
    classes, 
    loading, 
    error, 
    filters, 
    currentPage, 
    totalPages, 
    totalCount, 
    refetch, 
    updateFilters 
  } = useStudents();

  console.log('Students component state:', { 
    students, 
    grades, 
    classes, 
    loading, 
    error,
    studentsCount: students.length
  });

  const handleAddStudent = () => {
    console.log('Add student clicked');
    // navigate('/students/new');
  };

  const handlePageChange = (page) => {
    refetch(page);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-red-800 font-medium">Error loading students</h3>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
              <button
                onClick={() => refetch()}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-600 mt-2">Manage student records and information</p>
        </div>

        <StudentFilters
          filters={filters}
          grades={grades}
          classes={classes}
          onFilterChange={updateFilters}
          onAddStudent={handleAddStudent}
        />

        <StudentsTable
          students={students}
          loading={loading}
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default Students;