import React, { useState, useEffect } from 'react';
import { studentService } from "../../services/studentService";

const NewStudentModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    studentId: '',
    firstName: '',
    lastName: '',
    gradeLevel: '',
    homeroom: '',
    dateOfBirth: '',
    gender: '',
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

  const [grades, setGrades] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  // Common severity options
  const severityOptions = ['Mild', 'Moderate', 'Severe', 'Life-threatening'];

  useEffect(() => {
    if (isOpen) {
      fetchGradesAndClasses();
      
      // Generate student ID when modal opens
      const generatedId = `STU-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      setFormData(prev => ({ ...prev, studentId: generatedId }));
      
      // Small delay to trigger animation
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
      // Reset form when closing
      setFormData({
        studentId: '',
        firstName: '',
        lastName: '',
        gradeLevel: '',
        homeroom: '',
        dateOfBirth: '',
        gender: '',
        specialNotes: '',
        allergies: [],
        emergencyContacts: []
      });
      setEmergencyContact({
        name: '',
        relationship: '',
        phoneNumber: '',
        email: ''
      });
      setAllergy({
        allergyType: '',
        severity: 'Mild',
        reaction: '',
        notes: ''
      });
      setError('');
    }
  }, [isOpen]);

  const fetchGradesAndClasses = async () => {
    setLoading(true);
    setError('');
    
    try {
      const { grades: fetchedGrades, classes: fetchedClasses } = await studentService.getGradesAndClasses();
      setGrades(fetchedGrades);
      setClasses(fetchedClasses);
    } catch (err) {
      setError('Failed to load grades and classes. Using default values.');
      console.error('Error in modal:', err);
      
      // Use fallback data
      setGrades(studentService.mockStudentData?.grades || []);
      setClasses(studentService.mockStudentData?.classes || []);
    } finally {
      setLoading(false);
    }
  };

  // Function to prepare data for backend
const prepareStudentData = () => {
  const data = { ...formData };
  
  // Convert date string to LocalDate format (YYYY-MM-DD)
  if (data.dateOfBirth) {
    data.dateOfBirth = data.dateOfBirth;
  }
  
  // Ensure allergies is always an array
  if (!data.allergies) {
    data.allergies = [];
  }
  
  // Ensure emergencyContacts is always an array
  if (!data.emergencyContacts) {
    data.emergencyContacts = [];
  }
  
  // Filter out any empty allergies
  const validAllergies = data.allergies.filter(allergy => 
    allergy && allergy.allergyType && allergy.severity && 
    allergy.allergyType.trim() !== "" && 
    allergy.allergyType.toLowerCase() !== "none"
  );
  
  // Filter out any empty emergency contacts
  data.emergencyContacts = data.emergencyContacts.filter(contact => 
    contact && (contact.contactName || contact.phoneNumber)
  );
  
  // If no valid allergies, add default "None"
  if (validAllergies.length === 0) {
    data.allergies = [{
      allergyType: "None",
      severity: "None",
      reaction: "No known allergies",
      notes: ""
    }];
  } else {
    data.allergies = validAllergies;
  }
  
  return data;
};

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Prepare data for backend
    const studentData = prepareStudentData();
    
    console.log('Creating student with data:', studentData);
    
    // Call parent's onSave with properly formatted data
    onSave(studentData);
    onClose();
  };

  const handleChange = (field, value) => {
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
    if (!emergencyContact.name.trim() && !emergencyContact.phoneNumber.trim()) {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      emergencyContacts: [...prev.emergencyContacts, { ...emergencyContact }]
    }));
    
    // Reset emergency contact form
    setEmergencyContact({
      name: '',
      relationship: '',
      phoneNumber: '',
      email: ''
    });
  };

  const removeEmergencyContact = (index) => {
    setFormData(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.filter((_, i) => i !== index)
    }));
  };

  const addAllergy = () => {
    if (!allergy.allergyType.trim()) {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      allergies: [...prev.allergies, { ...allergy }]
    }));
    
    // Reset allergy form
    setAllergy({
      allergyType: '',
      severity: 'Mild',
      reaction: '',
      notes: ''
    });
  };

  const removeAllergy = (index) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Modal positioned under the New Student button */}
      <div 
        className={`absolute top-30 right-6 bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-200 transition-all duration-300 transform ${
          isVisible 
            ? 'translate-y-0 opacity-100 scale-100' 
            : 'translate-y-4 opacity-0 scale-95'
        }`}
        style={{ maxHeight: 'calc(100vh - 140px)' }}
      >
        {/* Header - with rounded top corners */}
        <div className="p-6 border-b border-gray-200 bg-white rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Add New Student</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition duration-200 p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {error && (
            <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-700">{error}</p>
            </div>
          )}
        </div>

        {/* Form Content - Scrollable with hidden scrollbar */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 220px)' }}>
          <form onSubmit={handleSubmit} className="p-6 space-y-6 bg-gray-50 scrollbar-hide">
            {/* Student ID */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Student Information</h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Student ID</label>
                  <input
                    type="text"
                    value={formData.studentId}
                    onChange={(e) => handleChange('studentId', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-gray-50 cursor-not-allowed"
                    readOnly
                    placeholder="Auto-generated"
                  />
                  <p className="text-xs text-gray-500 mt-1">Student ID is automatically generated</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <div className="relative">
                    <select
                      value={formData.gender}
                      onChange={(e) => handleChange('gender', e.target.value)}
                      className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 appearance-none bg-white hover:bg-gray-50 cursor-pointer"
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
              </div>
            </div>

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
                    onChange={(e) => handleChange('firstName', e.target.value)}
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
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    placeholder="Enter last name"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white hover:bg-gray-50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white hover:bg-gray-50"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Special Notes</label>
                  <textarea
                    value={formData.specialNotes}
                    onChange={(e) => handleChange('specialNotes', e.target.value)}
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14v6l9-5m-9 5l-9-5" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Academic Information</h3>
                {loading && (
                  <span className="text-xs text-blue-600 ml-2 flex items-center gap-1">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                    Loading...
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Grade Level</label>
                  <div className="relative">
                    <select
                      value={formData.gradeLevel}
                      onChange={(e) => handleChange('gradeLevel', e.target.value)}
                      className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 appearance-none bg-white hover:bg-gray-50 cursor-pointer"
                      required
                      disabled={loading}
                    >
                      <option value="">Select grade level</option>
                      {grades.map((grade) => (
                        <option key={grade} value={grade}>
                          {grade}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      {loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                      ) : (
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Homeroom</label>
                  <div className="relative">
                    <select
                      value={formData.homeroom}
                      onChange={(e) => handleChange('homeroom', e.target.value)}
                      className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 appearance-none bg-white hover:bg-gray-50 cursor-pointer"
                      required
                      disabled={loading}
                    >
                      <option value="">Select homeroom</option>
                      {classes.map((className) => (
                        <option key={className} value={className}>
                          {className}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      {loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                      ) : (
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
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

              {/* Display existing allergies OR "None" in green */}
              {formData.allergies.length > 0 ? (
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
                        <button
                          type="button"
                          onClick={() => removeAllergy(index)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
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

              {/* Add new allergy form */}
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
                      className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 appearance-none bg-white hover:bg-gray-50 cursor-pointer"
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
                Add Allergy
              </button>
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
              {formData.emergencyContacts.length > 0 && (
                <div className="mb-4 space-y-2">
                  {formData.emergencyContacts.map((contact, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                      <div>
                        <p className="font-medium text-gray-900">{contact.name}</p>
                        <p className="text-sm text-gray-600">{contact.relationship} • {contact.phoneNumber}</p>
                        {contact.email && (
                          <p className="text-sm text-gray-600">{contact.email}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeEmergencyContact(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add new emergency contact form */}
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
                Add Emergency Contact
              </button>
            </div>

            {/* Submit Button - with rounded bottom corners */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Loading...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Student
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewStudentModal;