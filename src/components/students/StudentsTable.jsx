import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ViewDetailsButton, EditButton, IconButton } from '../common/ButtonComponents';
import { useNotification } from '../common/NotificationProvider';
import { studentService } from '../../services/studentService';

const StudentsTable = ({ 
  students, 
  loading, 
  currentPage, 
  totalPages, 
  totalCount, 
  onPageChange,
  onViewMedicalHistory,
  onEditStudent,
  refetch // Add this prop
}) => {
  const navigate = useNavigate();
  const { success, error: showError } = useNotification();
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!students || !Array.isArray(students)) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center text-gray-500">
          No student data available
        </div>
      </div>
    );
  }

  // Handle individual student delete
  const handleDeleteStudent = async (studentId, studentName) => {
    if (!window.confirm(`Are you sure you want to delete ${studentName}? This action cannot be undone.`)) {
      return;
    }

    try {
      setIsDeleting(true);
      await studentService.deleteStudent(studentId);
      success(`Student ${studentName} deleted successfully!`);
      refetch(); // Refresh the list
    } catch (err) {
      console.error('Failed to delete student:', err);
      showError(`Failed to delete student: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle multiple delete
  const handleDeleteMultiple = async () => {
    if (selectedStudents.length === 0) {
      showError('Please select at least one student to delete');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedStudents.length} selected student(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      setIsDeleting(true);
      const deletePromises = selectedStudents.map(studentId => 
        studentService.deleteStudent(studentId)
      );
      
      await Promise.all(deletePromises);
      success(`${selectedStudents.length} student(s) deleted successfully!`);
      setSelectedStudents([]); // Clear selection
      refetch(); // Refresh the list
    } catch (err) {
      console.error('Failed to delete students:', err);
      showError(`Failed to delete students: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle select all checkbox
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedStudents(students.map(student => student.id));
    } else {
      setSelectedStudents([]);
    }
  };

  // Handle individual checkbox selection
  const handleSelectStudent = (studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  // Check if all students on current page are selected
  const isAllSelected = students.length > 0 && selectedStudents.length === students.length;

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const getMedicalHistoryStatus = (student) => {
    return {
      hasHistory: student.hasMedicalHistory || false,
      activeConditions: student.activeConditions || 0
    };
  };

  // Helper function to get boarding status display
  const getBoardingStatusDisplay = (student) => {
    const status = student.boardingStatus || student.status || 'BOARDING';
    const isBoarding = status === 'BOARDING';
    
    return {
      text: isBoarding ? 'Boarding' : 'Day Student',
      badgeClass: isBoarding 
        ? 'bg-purple-100 text-purple-800 border border-purple-200' 
        : 'bg-green-100 text-green-800 border border-green-200',
      icon: isBoarding ? (
        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
      ) : (
        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      )
    };
  };

  // Helper function to get classroom name
  const getClassroom = (student) => {
    return student.homeroom || student.classroom || student.class || student.className || 'N/A';
  };

  // Helper function to get grade
  const getGrade = (student) => {
    return student.gradeLevel || student.grade || 'N/A';
  };

  // Helper function to get house display
  const getHouseDisplay = (student) => {
    if (!student.house) {
      return {
        display: 'None',
        className: 'bg-gray-100 text-gray-600',
        tooltip: 'No house assigned'
      };
    }
    
    // Map house codes to full names
    const houseMap = {
      'AD': 'ADDO',
      'AS': 'ASIEDU', 
      'BT': 'BUTLER',
      'CH': 'CHINERY',
      'CR': 'CROFFIE',
      'EN': 'ENGMANN',
      'SC': 'SCOTTON',
      'YB': 'YEBOAH'
    };
    
    const houseCode = student.house.toUpperCase();
    const houseName = houseMap[houseCode] || houseCode;
    
    // Different colors for different houses
    const houseColors = {
      'AD': 'bg-red-100 text-red-800',
      'AS': 'bg-blue-100 text-blue-800',
      'BT': 'bg-green-100 text-green-800', 
      'CH': 'bg-yellow-100 text-yellow-800',
      'CR': 'bg-purple-100 text-purple-800',
      'EN': 'bg-pink-100 text-pink-800',
      'SC': 'bg-indigo-100 text-indigo-800',
      'YB': 'bg-orange-100 text-orange-800'
    };
    
    return {
      display: houseCode,
      fullName: houseName,
      className: houseColors[houseCode] || 'bg-gray-100 text-gray-800',
      tooltip: houseName
    };
  };

  // Helper function to display allergies
  const getAllergiesDisplay = (student) => {
    if (!student.allergies) {
      return {
        display: 'None',
        className: 'bg-green-100 text-green-800'
      };
    }
    
    // If it's an array
    if (Array.isArray(student.allergies)) {
      if (student.allergies.length === 0) {
        return {
          display: 'None',
          className: 'bg-green-100 text-green-800'
        };
      }
      
      // Show first allergy type or count
      const firstAllergy = student.allergies[0];
      const allergyType = typeof firstAllergy === 'object' 
        ? (firstAllergy.allergyType || firstAllergy.type || 'Unknown') 
        : String(firstAllergy);
      
      if (student.allergies.length === 1) {
        return {
          display: allergyType,
          className: 'bg-yellow-100 text-yellow-800'
        };
      } else {
        return {
          display: `${allergyType} +${student.allergies.length - 1}`,
          className: 'bg-yellow-100 text-yellow-800'
        };
      }
    }
    
    // If it's a string
    if (typeof student.allergies === 'string') {
      const trimmed = student.allergies.trim();
      if (!trimmed || trimmed.toLowerCase() === 'none') {
        return {
          display: 'None',
          className: 'bg-green-100 text-green-800'
        };
      }
      return {
        display: trimmed,
        className: 'bg-yellow-100 text-yellow-800'
      };
    }
    
    // Fallback
    return {
      display: 'Check',
      className: 'bg-gray-100 text-gray-800'
    };
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {['', 'Name', 'Student ID', 'Grade', 'Class', 'House', 'Allergies', 'Medical History', 'Actions'].map((header) => (
                  <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((j) => (
                    <td key={j} className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Multiple Delete Button */}
      {selectedStudents.length > 0 && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-red-800 font-medium">
              {selectedStudents.length} student(s) selected
            </span>
          </div>
          <button
            onClick={handleDeleteMultiple}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Deleting...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Selected
              </>
            )}
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Class
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  House
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Allergies
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Medical History
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student) => {
                const medicalStatus = getMedicalHistoryStatus(student);
                const boardingStatus = getBoardingStatusDisplay(student);
                const allergies = getAllergiesDisplay(student);
                const house = getHouseDisplay(student);
                
                return (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => handleSelectStudent(student.id)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {student.name || `${student.firstName} ${student.lastName}`}
                      </div>
                      <div className="mt-1 flex items-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${boardingStatus.badgeClass}`}>
                          {boardingStatus.icon}
                          {boardingStatus.text}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.studentId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getGrade(student)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getClassroom(student)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div 
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${house.className}`}
                        title={house.tooltip}
                      >
                        {house.display}
                        {house.fullName && house.fullName !== house.display && (
                          <span className="ml-1 hidden lg:inline">
                            ({house.fullName})
                          </span>
                        )}
                      </div>
                      {/* Show boarding status indicator for house column */}
                      {boardingStatus.text === 'Boarding' && !student.house && (
                        <div className="mt-1">
                          <span className="text-xs text-amber-600">
                            House needed
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${allergies.className}`}>
                        {allergies.display}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <button
                          onClick={() => onViewMedicalHistory && onViewMedicalHistory(student)}
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition duration-200"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          View History
                        </button>
                        {medicalStatus.activeConditions > 0 && (
                          <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded-full">
                            {medicalStatus.activeConditions} active
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {/* View Details Button */}
                        <ViewDetailsButton id={student.id} />
                        
                        {/* Edit Button */}
                        <EditButton 
                          onClick={() => onEditStudent && onEditStudent(student)} 
                        />
                        
                        {/* Delete Button - Replacing the eye icon */}
                        <button
                          onClick={() => handleDeleteStudent(student.id, student.name || `${student.firstName} ${student.lastName}`)}
                          disabled={isDeleting}
                          className="text-red-600 hover:text-red-900 hover:bg-red-50 p-2 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete Student"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">
                Showing <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> to{' '}
                <span className="font-medium">{Math.min(currentPage * 10, totalCount)}</span> of{' '}
                <span className="font-medium">{totalCount}</span> students
              </div>
              
              <div className="flex items-center space-x-1">
                {/* Previous Button */}
                <button
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                  title="Previous Page"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Page Numbers */}
                {getPageNumbers().map((page) => (
                  <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`min-w-[40px] px-3 py-2 text-sm font-medium rounded-md transition duration-200 ${
                      currentPage === page
                        ? 'bg-blue-600 text-white border border-blue-600'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                </button>
                ))}

                {/* Next Button */}
                <button
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                  title="Next Page"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default StudentsTable;