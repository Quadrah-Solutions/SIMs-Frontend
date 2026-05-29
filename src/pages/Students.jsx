import React, { useState, useEffect, useCallback } from 'react';
import { useStudents } from '../hooks/useStudents';
import StudentFilters from '../components/students/StudentFilters';
import StudentsTable from '../components/students/StudentsTable';
import NewStudentModal from '../components/students/NewStudentModal';
import EditStudentModal from '../components/students/EditStudentModal';
import BulkUploadModal from '../components/students/BulkUploadModal';
import { useNotification } from '../components/common/NotificationProvider';
import StudentMedicalHistory from '../components/students/StudentMedicalHistory';
import { useSearchParams } from 'react-router-dom';
import { studentService } from '../services/studentService';

// IMPORT THE AlumniTab COMPONENT - MAKE SURE THIS FILE EXISTS
import AlumniTab from '../components/students/AlumniTab'; // Add this import

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
    createStudent,
    updateStudent,
    bulkUploadStudents  
  } = useStudents();

  const [isNewStudentModalOpen, setIsNewStudentModalOpen] = useState(false);
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [isMedicalHistoryModalOpen, setIsMedicalHistoryModalOpen] = useState(false);
  const [isEditStudentModalOpen, setIsEditStudentModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [bulkUploadLoading, setBulkUploadLoading] = useState(false); 
  const [studentToEdit, setStudentToEdit] = useState(null);
  const [activeTab, setActiveTab] = useState('current');

  const { success, error: showError } = useNotification();

  const [searchParams, setSearchParams] = useSearchParams();
  const actionParam = searchParams.get('action');

  const openMedicalHistoryModal = (student) => {
    setSelectedStudent(student);
    setIsMedicalHistoryModalOpen(true);
  };

  const openEditStudentModal = (student) => {
    setStudentToEdit(student);
    setIsEditStudentModalOpen(true);
  };

  console.log('Students component state:', { 
    students, 
    grades, 
    classes, 
    loading, 
    error,
    studentsCount: students ? students.length : 0
  });

  useEffect(() => {
    if (actionParam === 'new') {
      setIsNewStudentModalOpen(true);
      searchParams.delete('action');
      setSearchParams(searchParams);
    }
  }, [actionParam, searchParams, setSearchParams]);

  const handleAddIndividualStudent = () => {
    console.log('Add individual student clicked');
    setIsNewStudentModalOpen(true);
  };

  const handleBulkUpload = () => {
    console.log('Bulk upload clicked');
    setIsBulkUploadModalOpen(true);
  };

  useEffect(() => {
    console.log('EditStudentModal state:', {
      isOpen: isEditStudentModalOpen,
      studentId: studentToEdit?.id,
      student: studentToEdit
    });
  }, [isEditStudentModalOpen, studentToEdit]);

  const handleCloseNewStudentModal = () => {
    setIsNewStudentModalOpen(false);
    if (searchParams.get('action') === 'new') {
      searchParams.delete('action');
      setSearchParams(searchParams);
    }
  };

  const handleCloseBulkUploadModal = () => {
    setIsBulkUploadModalOpen(false);
  };

  const handleCloseMedicalHistoryModal = () => {
    setIsMedicalHistoryModalOpen(false);
    setSelectedStudent(null);
  };

  const handleCloseEditStudentModal = () => {
    setIsEditStudentModalOpen(false);
    setStudentToEdit(null);
  };

  const handleSaveStudent = async (studentData) => {
    try {
      console.log('Saving new student:', studentData);
      await createStudent(studentData);
      setIsNewStudentModalOpen(false);
      success('Student added successfully!');
    } catch (err) {
      console.error('Failed to save student:', err);
      showError(`Failed to save student: ${err.message}`);
    }
  };

  const handleUpdateStudent = useCallback(async (studentId, studentData) => {
    try {
      console.log('Updating student:', studentId, studentData);
      
      if (!studentId) {
        throw new Error('Student ID is required');
      }
      
      if (!studentData) {
        throw new Error('Student data is required');
      }
      
      if (typeof updateStudent !== 'function') {
        throw new Error('updateStudent is not available');
      }
      
      await updateStudent(studentId, studentData);
      
      setIsEditStudentModalOpen(false);
      setStudentToEdit(null);
      
      success('Student updated successfully!');
      refetch();
      
    } catch (err) {
      console.error('Failed to update student:', err);
      showError(`Failed to update student: ${err.message}`);
      throw err;
    }
  }, [updateStudent, success, showError, refetch]);

  const handleBulkUploadSubmit = async (file) => {
    try {
      console.log('Uploading bulk students file:', file.name);
      setBulkUploadLoading(true);
      
      const formData = new FormData();
      formData.append('file', file);
      
      await bulkUploadStudents(formData);
      
      setIsBulkUploadModalOpen(false);
      success('Students uploaded successfully! File is being processed.');
      refetch();
      
    } catch (err) {
      console.error('Failed to upload bulk students:', err);
      showError(`Failed to upload students: ${err.message}`);
      throw err;
    } finally {
      setBulkUploadLoading(false);
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
      {/* Apply blur to the main content when any modal is open */}
      <div className={`max-w-7xl mx-auto transition-all duration-300 ${
        isNewStudentModalOpen || isBulkUploadModalOpen || isMedicalHistoryModalOpen || isEditStudentModalOpen
          ? 'blur-sm opacity-70' 
          : 'blur-0 opacity-100'
      }`}>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-600 mt-2">Manage student records and information</p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('current')}
                className={`
                  py-3 px-1 border-b-2 font-medium text-sm
                  ${activeTab === 'current'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
              >
                Current Students
                <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                  {students.filter(s => !s.isAlumni).length}
                </span>
              </button>
              
              <button
                onClick={() => setActiveTab('alumni')}
                className={`
                  py-3 px-1 border-b-2 font-medium text-sm
                  ${activeTab === 'alumni'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
              >
                Alumni
                <span className="ml-2 bg-purple-100 text-purple-800 text-xs font-medium px-2 py-0.5 rounded-full">
                  {students.filter(s => s.isAlumni).length}
                </span>
              </button>
            </nav>
          </div>
        </div>
        
        {/* Tab Content - ONLY ONE SET OF CONTENT BASED ON ACTIVE TAB */}
        {activeTab === 'current' ? (
          <>
            <StudentFilters
              filters={filters}
              grades={grades}
              classes={classes}
              onFilterChange={updateFilters}
              onAddStudent={handleAddIndividualStudent}
              onBulkUpload={handleBulkUpload}
            />
            
            <StudentsTable
              students={students.filter(s => !s.isAlumni)}
              loading={loading}
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
              onPageChange={handlePageChange}
              onViewMedicalHistory={openMedicalHistoryModal}
              onEditStudent={openEditStudentModal}
              refetch={refetch} // Add this line
            />
          </>
        ) : (
          <AlumniTab />
        )}
        
        {/* REMOVED: The duplicate StudentFilters and StudentsTable components go here */}
      </div>

      {/* New Student Modal */}
      <NewStudentModal
        isOpen={isNewStudentModalOpen}
        onClose={handleCloseNewStudentModal}
        onSave={handleSaveStudent}
      />

      {/* Edit Student Modal */}
      {studentToEdit && (
        <EditStudentModal
          isOpen={isEditStudentModalOpen}
          onClose={handleCloseEditStudentModal}
          onSave={(studentData) => {
            console.log('EditStudentModal onSave called with:', studentData);
            return handleUpdateStudent(studentToEdit.id, studentData);
          }}
          student={studentToEdit}
          grades={grades}
          classes={classes}
        />
      )}

      {/* Bulk Upload Modal */}
      <BulkUploadModal
        isOpen={isBulkUploadModalOpen}
        onClose={handleCloseBulkUploadModal}
        onUpload={handleBulkUploadSubmit}
      />

      {/* Medical History Modal */}
      <StudentMedicalHistory
        isOpen={isMedicalHistoryModalOpen}
        onClose={handleCloseMedicalHistoryModal}
        studentId={selectedStudent?.id}
        studentName={selectedStudent ? 
          `${selectedStudent.firstName} ${selectedStudent.lastName}` : 
          ''}
      />
    </div>
  );
};

export default Students;