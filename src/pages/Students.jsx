import React, { useState } from 'react';
import { useStudents } from '../hooks/useStudents';
import StudentFilters from '../components/students/StudentFilters';
import StudentsTable from '../components/students/StudentsTable';
import NewStudentModal from '../components/students/NewStudentModal';

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
    updateFilters,
    createStudent 
  } = useStudents();

  const [isNewStudentModalOpen, setIsNewStudentModalOpen] = useState(false);


  console.log('Students component state:', { 
    students, 
    grades, 
    classes, 
    loading, 
    error,
    studentsCount: students ? students.length : 0  // ← Fixed this line
  });

  const handleAddStudent = () => {
    console.log('Add student clicked');
    setIsNewStudentModalOpen(true);
  };

  const handleCloseNewStudentModal = () => {
    setIsNewStudentModalOpen(false);
  };

  const handleSaveStudent = async (studentData) => {
    try {
      console.log('Saving new student:', studentData);
      await createStudent(studentData);
      setIsNewStudentModalOpen(false);
      // No need to manually refetch as createStudent already updates the state
    } catch (error) {
      console.error('Failed to save student:', error);
      // You could show an error message to the user here
    }
  };

  const handlePageChange = (page) => {
    refetch(page);
  };

   if (loading && (!students || students.length === 0)) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading students...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
      {/* Apply blur to the main content when modal is open */}
      <div className={`max-w-7xl mx-auto transition-all duration-300 ${
        isNewStudentModalOpen ? 'blur-sm opacity-70' : 'blur-0 opacity-100'
      }`}>
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
          students={students || []}  // ← Ensure it's always an array
          loading={loading}
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          onPageChange={handlePageChange}
        />
      </div>

      {/* New Student Modal */}
      <NewStudentModal
        isOpen={isNewStudentModalOpen}
        onClose={handleCloseNewStudentModal}
        onSave={handleSaveStudent}
      />
    </div>
  );
};

export default Students;