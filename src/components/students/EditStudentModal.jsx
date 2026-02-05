// src/components/students/EditStudentModal.js
import React, { useState, useEffect } from 'react';
import { studentService } from "../../services/studentService";

const EditStudentModal = ({ isOpen, onClose, onSave, student, grades = [], classes = [] }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    studentId: '',
    gradeLevel: '',
    homeroom: '',
    dateOfBirth: '',
    gender: '',
    boardingStatus: 'DAY',
    specialNotes: '',
    allergies: [],
    emergencyContacts: []
  });

  // For emergency contact form
  const [emergencyContact, setEmergencyContact] = useState({
    contactName: '',
    relationship: '',
    phoneNumber: '',
    alternatePhone: '',
    email: '',
    isPrimary: false
  });

  // For allergy form
  const [allergy, setAllergy] = useState({
    allergyType: '',
    severity: 'Mild',
    reaction: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [allergyToEdit, setAllergyToEdit] = useState(null);
  const [contactToEdit, setContactToEdit] = useState(null);

  // Common severity options
  const severityOptions = ['Mild', 'Moderate', 'Severe', 'Life-threatening'];

  // Helper function to parse allergies from string to array
  const parseAllergiesFromString = (allergiesString) => {
    if (!allergiesString || typeof allergiesString !== 'string') {
      return [];
    }
    
    const trimmed = allergiesString.trim();
    if (!trimmed || trimmed.toLowerCase() === 'none') {
      return [];
    }
    
    // Split by comma and clean up
    return trimmed
      .split(',')
      .map(item => item.trim())
      .filter(item => item && item.toLowerCase() !== 'none')
      .map(item => ({
        allergyType: item,
        severity: 'Mild', // Default severity
        reaction: '',
        notes: ''
      }));
  };

  useEffect(() => {
    if (isOpen && student) {
      // Parse allergies from string to array format
      const parsedAllergies = parseAllergiesFromString(student.allergies);
      
      // Initialize form with student data
      setFormData({
        firstName: student.firstName || '',
        lastName: student.lastName || '',
        studentId: student.studentId || '',
        gradeLevel: student.gradeLevel || '',
        homeroom: student.homeroom || '',
        dateOfBirth: student.dateOfBirth || '',
        gender: student.gender || '',
        boardingStatus: student.boardingStatus || 'DAY',
        specialNotes: student.specialNotes || '',
        allergies: parsedAllergies,
        emergencyContacts: student.emergencyContacts || []
      });
      
      // Small delay to trigger animation
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
      resetForm();
    }
  }, [isOpen, student]);

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      studentId: '',
      gradeLevel: '',
      homeroom: '',
      dateOfBirth: '',
      gender: '',
      boardingStatus: 'DAY',
      specialNotes: '',
      allergies: [],
      emergencyContacts: []
    });
    setEmergencyContact({
      contactName: '',
      relationship: '',
      phoneNumber: '',
      alternatePhone: '',
      email: '',
      isPrimary: false
    });
    setAllergy({
      allergyType: '',
      severity: 'Mild',
      reaction: '',
      notes: ''
    });
    setAllergyToEdit(null);
    setContactToEdit(null);
    setError('');
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEmergencyContactChange = (field, value) => {
    setEmergencyContact(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAllergyChange = (field, value) => {
    setAllergy(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addEmergencyContact = () => {
    if (!emergencyContact.contactName.trim() && !emergencyContact.phoneNumber.trim()) {
      return;
    }
    
    if (contactToEdit !== null) {
      // Update existing contact
      const updatedContacts = [...formData.emergencyContacts];
      updatedContacts[contactToEdit] = { ...emergencyContact };
      setFormData(prev => ({
        ...prev,
        emergencyContacts: updatedContacts
      }));
      setContactToEdit(null);
    } else {
      // Add new contact
      setFormData(prev => ({
        ...prev,
        emergencyContacts: [...prev.emergencyContacts, { ...emergencyContact }]
      }));
    }
    
    // Reset emergency contact form
    setEmergencyContact({
      contactName: '',
      relationship: '',
      phoneNumber: '',
      alternatePhone: '',
      email: '',
      isPrimary: false
    });
  };

  const editEmergencyContact = (index) => {
    const contact = formData.emergencyContacts[index];
    setEmergencyContact({ ...contact });
    setContactToEdit(index);
  };

  const removeEmergencyContact = (index) => {
    setFormData(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.filter((_, i) => i !== index)
    }));
    if (contactToEdit === index) {
      setContactToEdit(null);
      setEmergencyContact({
        contactName: '',
        relationship: '',
        phoneNumber: '',
        alternatePhone: '',
        email: '',
        isPrimary: false
      });
    }
  };

  const addAllergy = () => {
    if (!allergy.allergyType.trim()) {
      return;
    }
    
    if (allergyToEdit !== null) {
      // Update existing allergy
      const updatedAllergies = [...formData.allergies];
      updatedAllergies[allergyToEdit] = { ...allergy };
      setFormData(prev => ({
        ...prev,
        allergies: updatedAllergies
      }));
      setAllergyToEdit(null);
    } else {
      // Add new allergy
      setFormData(prev => ({
        ...prev,
        allergies: [...prev.allergies, { ...allergy }]
      }));
    }
    
    // Reset allergy form
    setAllergy({
      allergyType: '',
      severity: 'Mild',
      reaction: '',
      notes: ''
    });
  };

  const editAllergy = (index) => {
    const allergyItem = formData.allergies[index];
    setAllergy({ ...allergyItem });
    setAllergyToEdit(index);
  };

  const removeAllergy = (index) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index)
    }));
    if (allergyToEdit === index) {
      setAllergyToEdit(null);
      setAllergy({
        allergyType: '',
        severity: 'Mild',
        reaction: '',
        notes: ''
      });
    }
  };

  // Function to prepare data for backend
    // In EditStudentModal.js, update prepareStudentData function:
    const prepareStudentData = () => {
    const data = { ...formData };
    
    // Convert date string to LocalDate format (YYYY-MM-DD)
    if (data.dateOfBirth) {
        data.dateOfBirth = data.dateOfBirth;
    }
    
    // IMPORTANT: The backend expects List<Allergy>, not a string
    // Convert formData.allergies to the correct format
    if (data.allergies && Array.isArray(data.allergies)) {
        // Ensure each allergy has all required fields
        data.allergies = data.allergies
        .filter(allergy => allergy && allergy.allergyType && allergy.allergyType.trim() !== "")
        .map(allergy => ({
            allergyType: allergy.allergyType,
            severity: allergy.severity || 'Mild',
            reaction: allergy.reaction || '',
            notes: allergy.notes || ''
        }));
    } else {
        data.allergies = [];
    }
    
    // Ensure emergencyContacts is properly formatted
    if (data.emergencyContacts && Array.isArray(data.emergencyContacts)) {
        // Filter out any empty emergency contacts
        data.emergencyContacts = data.emergencyContacts.filter(contact => 
        contact && (contact.contactName || contact.phoneNumber)
        );
    } else {
        data.emergencyContacts = [];
    }
    
    // Remove any fields that shouldn't be sent
    delete data.id; // Don't send ID in update body
    
    console.log('Prepared student data for backend:', data);
    return data;
    };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
        // Prepare data for backend
        const studentData = prepareStudentData();
        
        console.log('Updating student with data:', studentData);
        console.log('Student ID:', student?.id);
        console.log('onSave function type:', typeof onSave);
        
        // Validate onSave is a function
        if (typeof onSave !== 'function') {
        throw new Error('onSave is not a function');
        }
        
        // Call parent's onSave with properly formatted data
        onSave(studentData);
    } catch (error) {
        console.error('Error in handleSubmit:', error);
        setError(error.message || 'Failed to submit form');
    }
    };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Background overlay with blur */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal container */}
      <div 
        className={`absolute top-20 right-6 bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-200 transition-all duration-300 transform ${
          isVisible 
            ? 'translate-y-0 opacity-100 scale-100' 
            : 'translate-y-4 opacity-0 scale-95'
        }`}
        style={{ 
          maxHeight: 'calc(100vh - 160px)'
        }}
      >
        {/* Header - with rounded top corners */}
        <div className="p-6 border-b border-gray-200 bg-white rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Edit Student</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition duration-200 p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Editing {student?.firstName} {student?.lastName}
          </p>
          {error && (
            <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-700">{error}</p>
            </div>
          )}
        </div>

        {/* Form Content - Scrollable */}
        <div 
          className="overflow-y-auto"
          style={{ 
            maxHeight: 'calc(100vh - 280px)'
          }}
        >
          <form onSubmit={handleSubmit} className="p-6 space-y-6 bg-gray-50">
            {/* Personal Details */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Personal Details</h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="Enter first name"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white hover:bg-gray-50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Enter last name"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white hover:bg-gray-50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Student ID</label>
                  <input
                    type="text"
                    value={formData.studentId}
                    onChange={(e) => handleInputChange('studentId', e.target.value)}
                    placeholder="Student ID"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white hover:bg-gray-50"
                    required
                    disabled // Student ID should not be editable
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white hover:bg-gray-50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <div className="relative">
                    <select
                      value={formData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 appearance-none bg-white hover:bg-gray-50 cursor-pointer"
                      required
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Boarding Status</label>
                  <div className="relative">
                    <select
                      value={formData.boardingStatus}
                      onChange={(e) => handleInputChange('boardingStatus', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 appearance-none bg-white hover:bg-gray-50 cursor-pointer"
                    >
                      <option value="DAY">Day Student</option>
                      <option value="BOARDING">Boarding Student</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Special Notes</label>
                  <textarea
                    value={formData.specialNotes}
                    onChange={(e) => handleInputChange('specialNotes', e.target.value)}
                    placeholder="Any special notes or medical information"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white hover:bg-gray-50"
                    rows="3"
                  />
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Academic Information</h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Grade Level</label>
                  <div className="relative">
                    <select
                      value={formData.gradeLevel}
                      onChange={(e) => handleInputChange('gradeLevel', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 appearance-none bg-white hover:bg-gray-50 cursor-pointer"
                      required
                    >
                      <option value="">Select grade level</option>
                      {grades.map((grade) => (
                        <option key={grade} value={grade}>
                          {grade}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Classroom</label>
                  <div className="relative">
                    <select
                      value={formData.homeroom}
                      onChange={(e) => handleInputChange('homeroom', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 appearance-none bg-white hover:bg-gray-50 cursor-pointer"
                      required
                    >
                      <option value="">Select classroom</option>
                      {classes.map((className) => (
                        <option key={className} value={className}>
                          {className}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Allergies Section */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Allergies & Medical Information</h3>
              </div>

              {/* Display existing allergies */}
              {formData.allergies && formData.allergies.length > 0 ? (
                <div className="mb-4 space-y-2">
                  {formData.allergies.map((allergyItem, index) => (
                    <div key={index} className="p-3 bg-red-50 rounded-lg border border-red-100">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            allergyItem.severity === 'Life-threatening' ? 'bg-red-500 text-white' :
                            allergyItem.severity === 'Severe' ? 'bg-orange-500 text-white' :
                            allergyItem.severity === 'Moderate' ? 'bg-yellow-500 text-white' :
                            'bg-green-500 text-white'
                          }`}>
                            {allergyItem.severity}
                          </span>
                          <span className="font-medium text-gray-900">{allergyItem.allergyType}</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => editAllergy(index)}
                            className="text-blue-500 hover:text-blue-700 p-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => removeAllergy(index)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      {allergyItem.reaction && (
                        <p className="text-sm text-gray-700 mb-1">
                          <span className="font-medium">Reaction: </span>
                          {allergyItem.reaction}
                        </p>
                      )}
                      {allergyItem.notes && (
                        <p className="text-sm text-gray-600">{allergyItem.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-green-700 font-medium">No allergies recorded</span>
                  </div>
                  <p className="text-green-600 text-sm text-center mt-1">Student has no known allergies</p>
                </div>
              )}

              {/* Add/Edit allergy form */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Allergy Type</label>
                  <input
                    type="text"
                    value={allergy.allergyType}
                    onChange={(e) => handleAllergyChange('allergyType', e.target.value)}
                    placeholder="e.g., Peanuts, Pollen, Penicillin"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white hover:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
                  <div className="relative">
                    <select
                      value={allergy.severity}
                      onChange={(e) => handleAllergyChange('severity', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 appearance-none bg-white hover:bg-gray-50 cursor-pointer"
                    >
                      {severityOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reaction (Optional)</label>
                  <input
                    type="text"
                    value={allergy.reaction}
                    onChange={(e) => handleAllergyChange('reaction', e.target.value)}
                    placeholder="e.g., Rash, Difficulty breathing, Swelling"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white hover:bg-gray-50"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                  <textarea
                    value={allergy.notes}
                    onChange={(e) => handleAllergyChange('notes', e.target.value)}
                    placeholder="Additional notes about the allergy"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white hover:bg-gray-50"
                    rows="2"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={addAllergy}
                className="mt-4 px-4 py-2 text-sm text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition duration-200 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {allergyToEdit !== null ? 'Update Allergy' : 'Add Allergy'}
              </button>
              {allergyToEdit !== null && (
                <button
                  type="button"
                  onClick={() => {
                    setAllergyToEdit(null);
                    setAllergy({
                      allergyType: '',
                      severity: 'Mild',
                      reaction: '',
                      notes: ''
                    });
                  }}
                  className="mt-2 ml-4 px-4 py-2 text-sm text-gray-600 border border-gray-600 rounded-lg hover:bg-gray-50 transition duration-200"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            {/* Emergency Contacts */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Emergency Contacts</h3>
              </div>

              {/* Display existing emergency contacts */}
              {formData.emergencyContacts && formData.emergencyContacts.length > 0 ? (
                <div className="mb-4 space-y-2">
                  {formData.emergencyContacts.map((contact, index) => (
                    <div key={index} className="p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium text-gray-900">{contact.contactName}</p>
                          <p className="text-sm text-gray-600">{contact.relationship} • {contact.phoneNumber}</p>
                          {contact.email && (
                            <p className="text-sm text-gray-600">{contact.email}</p>
                          )}
                          {contact.isPrimary && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                              Primary Contact
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => editEmergencyContact(index)}
                            className="text-blue-500 hover:text-blue-700 p-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => removeEmergencyContact(index)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    <span className="text-gray-600 font-medium">No emergency contacts added</span>
                  </div>
                </div>
              )}

              {/* Add/Edit emergency contact form */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Name *</label>
                  <input
                    type="text"
                    value={emergencyContact.contactName}
                    onChange={(e) => handleEmergencyContactChange('contactName', e.target.value)}
                    placeholder="Full name"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white hover:bg-gray-50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
                  <input
                    type="text"
                    value={emergencyContact.relationship}
                    onChange={(e) => handleEmergencyContactChange('relationship', e.target.value)}
                    placeholder="Parent, Guardian, etc."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white hover:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={emergencyContact.phoneNumber}
                    onChange={(e) => handleEmergencyContactChange('phoneNumber', e.target.value)}
                    placeholder="Primary phone number"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white hover:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Alternate Phone (Optional)</label>
                  <input
                    type="tel"
                    value={emergencyContact.alternatePhone}
                    onChange={(e) => handleEmergencyContactChange('alternatePhone', e.target.value)}
                    placeholder="Alternate phone number"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white hover:bg-gray-50"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email (Optional)</label>
                  <input
                    type="email"
                    value={emergencyContact.email}
                    onChange={(e) => handleEmergencyContactChange('email', e.target.value)}
                    placeholder="Email address"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white hover:bg-gray-50"
                  />
                </div>
                <div className="col-span-2">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={emergencyContact.isPrimary}
                      onChange={(e) => handleEmergencyContactChange('isPrimary', e.target.checked)}
                      className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Set as primary contact</span>
                  </label>
                </div>
              </div>

              <button
                type="button"
                onClick={addEmergencyContact}
                className="mt-4 px-4 py-2 text-sm text-yellow-600 border border-yellow-600 rounded-lg hover:bg-yellow-50 transition duration-200 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {contactToEdit !== null ? 'Update Contact' : 'Add Emergency Contact'}
              </button>
              {contactToEdit !== null && (
                <button
                  type="button"
                  onClick={() => {
                    setContactToEdit(null);
                    setEmergencyContact({
                      contactName: '',
                      relationship: '',
                      phoneNumber: '',
                      alternatePhone: '',
                      email: '',
                      isPrimary: false
                    });
                  }}
                  className="mt-2 ml-4 px-4 py-2 text-sm text-gray-600 border border-gray-600 rounded-lg hover:bg-gray-50 transition duration-200"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
              >
                {loading ? 'Saving...' : 'Update Student'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditStudentModal;