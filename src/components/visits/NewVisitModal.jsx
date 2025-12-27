import React, { useState, useEffect, useRef } from 'react';
import { useMedications } from '../../hooks/useMedications'; 
import { useNotification } from '../common/NotificationProvider';
import { medicationService } from '../../services/medicationService'; 
import { medicalHistoryService } from '../../services/medicalHistoryService'; 

const NewVisitModal = ({ isOpen, onClose, onSave, currentNurse, students = [] }) => {
  // Get current date and time in the correct format
  const getCurrentDateTime = () => {
    return new Date().toISOString().split('.')[0];
  };

  // Always call hooks unconditionally at the top level
  const { medications = [], loading: medicationsLoading, refetch } = useMedications();
  const [filteredMedications, setFilteredMedications] = useState([]);
  const [showMedicationDropdown, setShowMedicationDropdown] = useState(false);
  const medicationDropdownRef = useRef(null);

  const [studentMedicalHistory, setStudentMedicalHistory] = useState([]);
  const [showMedicalHistory, setShowMedicalHistory] = useState(false);
  const [loadingMedicalHistory, setLoadingMedicalHistory] = useState(false);

  const { success, error: showError } = useNotification();

  const [formData, setFormData] = useState({
    studentId: '', 
    student: null,
    reason: '',
    symptoms: '',
    observations: '',
    vitalSigns: '',
    disposition: '',
    finalAssessment: '',
    emergencyFlag: false,
    referredBy: '',
    nurseId: currentNurse?.id || '',
    nurseName: currentNurse?.name || '',
    visitDate: getCurrentDateTime(),
    dispositionTime: getCurrentDateTime(),
    medications: [],
    treatments: []
  });

  const [isVisible, setIsVisible] = useState(false);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [newMedication, setNewMedication] = useState({
    medicationId: '',
    medicationName: '',
    dosage: '',
    frequency: '',
    duration: '',
    notes: ''
  });
  
  const [newTreatment, setNewTreatment] = useState({
    treatmentName: '',
    description: '',
    duration: '',
    notes: ''
  });

  // Check if medication is expired
  const isMedicationExpired = (medication) => {
    if (!medication || !medication.expiryDate) return false;
    
    try {
      const expiryDate = new Date(medication.expiryDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to start of day for comparison
      
      return expiryDate < today;
    } catch (error) {
      console.error('Error parsing expiry date:', error);
      return false;
    }
  };

  // Format expiry date for display
  const formatExpiryDate = (expiryDate) => {
    if (!expiryDate) return 'No expiry';
    
    try {
      const date = new Date(expiryDate);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Get expiry status and color
  const getExpiryStatus = (medication) => {
    if (!medication || !medication.expiryDate) {
      return { status: 'No expiry', color: 'text-gray-500' };
    }
    
    const isExpired = isMedicationExpired(medication);
    if (isExpired) {
      return { status: 'Expired', color: 'text-red-600' };
    }
    
    try {
      const expiryDate = new Date(medication.expiryDate);
      const today = new Date();
      const diffTime = expiryDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 30) {
        return { status: `Expires in ${diffDays} days`, color: 'text-yellow-600' };
      } else {
        return { status: `Expires ${formatExpiryDate(medication.expiryDate)}`, color: 'text-green-600' };
      }
    } catch (error) {
      return { status: 'Invalid date', color: 'text-gray-500' };
    }
  };

    // Check if medication is selectable (in stock and not expired)
  const isMedicationSelectable = (medication) => {
    if (!medication) return false;
    if (medication.currentStock <= 0) return false;
    if (isMedicationExpired(medication)) return false;
    return true;
  };


  // Close medication dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (medicationDropdownRef.current && !medicationDropdownRef.current.contains(event.target)) {
        setShowMedicationDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // to fetch medical history when student is selected
  useEffect(() => {
    const fetchMedicalHistory = async () => {
      if (!formData.studentId) {
        setStudentMedicalHistory([]);
        return;
      }
      
      setLoadingMedicalHistory(true);
      try {
        // Using the medicalHistoryService instead of direct fetch
        const data = await medicalHistoryService.getByStudent(formData.studentId);
        setStudentMedicalHistory(data);
      } catch (error) {
        console.error('Error fetching medical history:', error);
        // Note: The service already provides fallback mock data in case of error,
        // so we don't need to handle empty data here
      } finally {
        setLoadingMedicalHistory(false);
      }
    };
    
    fetchMedicalHistory();
  }, [formData.studentId]);


  useEffect(() => {
    if (isOpen) {
      // Reset form data when modal opens
      setFormData(prev => ({
        ...prev,
        studentId: '',
        student: null,
        reason: '',
        symptoms: '',
        observations: '',
        vitalSigns: '',
        disposition: '',
        finalAssessment: '',
        emergencyFlag: false,
        referredBy: '',
        nurseId: currentNurse?.id || '',
        nurseName: currentNurse?.name || '',
        visitDate: getCurrentDateTime(),
        dispositionTime: getCurrentDateTime(),
        medications: [],
        treatments: []
      }));
      setSearchTerm('');
      setFilteredStudents(students || []);
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
    }
  }, [isOpen, currentNurse, students]);

  // Filter students based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = (students || []).filter(student => 
        student?.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${student?.firstName || ''} ${student?.lastName || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student?.gradeLevel?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents(students || []);
    }
  }, [searchTerm, students]);

  // Initialize filtered medications when medications load
  useEffect(() => {
    if (medications && medications.length > 0) {
      const inStockMedications = medications.filter(med => med && med.currentStock > 0).slice(0, 10);
      setFilteredMedications(inStockMedications);
    } else {
      setFilteredMedications([]);
    }
  }, [medications]);

  // Filter medications based on search input
  const filterMedications = (searchValue) => {
    if (!searchValue.trim()) {
      setFilteredMedications(medications.filter(med => med && med.currentStock > 0).slice(0, 10));
      return;
    }

    const lowerSearch = searchValue.toLowerCase();
    const filtered = medications
      .filter(med => {
        if (!med || med.currentStock <= 0) return false;
        
        // Search in multiple fields
        const nameMatch = med.medicationName?.toLowerCase().includes(lowerSearch) || 
                         med.name?.toLowerCase().includes(lowerSearch);
        const genericMatch = med.genericName?.toLowerCase().includes(lowerSearch);
        const categoryMatch = med.category?.toLowerCase().includes(lowerSearch);
        const strengthMatch = med.strength?.toLowerCase().includes(lowerSearch);
        
        return nameMatch || genericMatch || categoryMatch || strengthMatch;
      })
      .slice(0, 10); // Limit to 10 results for better UX

    setFilteredMedications(filtered);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields ONLY
    if (!formData.student || !formData.reason || !formData.symptoms || !formData.disposition) {
      alert('Please fill in all required fields: Student, Reason, Symptoms, and Outcome.');
      return;
    }

    // Validate nurse is selected
    if (!formData.nurseId || !currentNurse?.id) {
      alert('Nurse information is required. Please make sure you are logged in.');
      return;
    }

    // Check if there's a partially filled medication in the "Add Medication" form
    if (newMedication.medicationId || newMedication.dosage) {
      const shouldAdd = confirm('You have a medication partially filled out in the "Add Medication" form. Would you like to add it before submitting? Click OK to add it, or Cancel to clear it and submit.');
      
      if (shouldAdd) {
        handleAddMedication();
        setTimeout(() => {
          alert('Medication added. Please click Submit again.');
        }, 100);
        return;
      } else {
        setNewMedication({
          medicationId: '',
          medicationName: '',
          dosage: '',
          frequency: '',
          duration: '',
          notes: ''
        });
      }
    }

    // Get current timestamp in ISO format
    const now = getCurrentDateTime();

    // Prepare the medications array with proper structure
    const medicationsPayload = (formData.medications || []).map(med => {
      // Get the full medication object to get the name
      const selectedMedication = medications.find(m => m && m.id == med.medicationId);
      const medicationName = selectedMedication?.medicationName || selectedMedication?.name || med.medicationName || 'Unknown Medication';
      
      // Combine frequency and duration into notes if they exist
      let notes = med.notes || '';
      if (med.frequency || med.duration) {
        const extraInfo = [];
        if (med.frequency) extraInfo.push(`Frequency: ${med.frequency}`);
        if (med.duration) extraInfo.push(`Duration: ${med.duration}`);
        
        if (notes) {
          notes = `${extraInfo.join('. ')}. ${notes}`;
        } else {
          notes = extraInfo.join('. ');
        }
      }
      
      // Ensure we return a clean object with only required fields
      return {
        medication: { 
          id: med.medicationId 
        },
        medicationName: medicationName,
        dosage: med.dosage || '',
        notes: notes,
        administeredBy: currentNurse?.name || "Unknown Nurse"
      };
    });

    // Prepare the treatments array - ensure clean structure
    const treatmentsPayload = (formData.treatments || []).map(treatment => ({
      treatmentName: treatment.treatmentName || '',
      description: treatment.description || '',
      duration: treatment.duration || '',
      notes: treatment.notes || '',
      administeredBy: currentNurse?.name || "Unknown Nurse"
    }));

    // Prepare the data in the format backend expects - SIMPLIFIED
    const visitData = {
      student: { 
        id: formData.student.id 
      },
      nurse: { 
        id: formData.nurseId || currentNurse?.id
      },
      reason: formData.reason,
      symptoms: formData.symptoms,
      observations: formData.observations || '',
      vitalSigns: formData.vitalSigns || '',
      disposition: mapOutcomeToDisposition(formData.disposition),
      dispositionTime: now,
      finalAssessment: formData.finalAssessment || '',
      emergencyFlag: formData.disposition === 'Emergency Referral',
      referredBy: formData.referredBy || '',
      visitDate: now,
      medications: medicationsPayload,
      treatments: treatmentsPayload
    };

    // Log the data to check structure
    console.log('Submitting visit data:', visitData);
    console.log('JSON string:', JSON.stringify(visitData));

    try {
      // Call onSave with the data
      await onSave(visitData);
      onClose();
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      alert('Failed to save visit. Please check the console for details.');
    }
  };

  const handleMedicationSearchChange = (e) => {
    const value = e.target.value;
    setNewMedication(prev => ({
      ...prev,
      medicationName: value,
      medicationId: '' // Clear ID when user types
    }));
    
    if (value.trim()) {
      filterMedications(value);
      setShowMedicationDropdown(true);
    } else {
      setShowMedicationDropdown(false);
      // Only show selectable medications
      const selectableMedications = medications
        .filter(med => isMedicationSelectable(med))
        .slice(0, 10);
      setFilteredMedications(selectableMedications);
    }
  };

  const handleMedicationSelect = (medication) => {
    // Check if medication is selectable
    if (!isMedicationSelectable(medication)) {
      if (isMedicationExpired(medication)) {
        alert(`Cannot select ${medication.medicationName || medication.name}: This medication has expired on ${formatExpiryDate(medication.expiryDate)}.`);
      } else if (medication.currentStock <= 0) {
        alert(`Cannot select ${medication.medicationName || medication.name}: This medication is out of stock.`);
      }
      return;
    }

    setNewMedication(prev => ({
      ...prev,
      medicationId: medication.id,
      medicationName: medication.medicationName || medication.name,
      dosage: '', // Clear dosage when selecting new medication
      frequency: '', // Clear frequency
      duration: '', // Clear duration
      notes: '' // Clear notes
    }));
    
    setShowMedicationDropdown(false);
    
    // Auto-focus dosage field for better UX
    setTimeout(() => {
      const dosageInput = document.querySelector('input[placeholder*="e.g., 1 tablet"]');
      if (dosageInput) dosageInput.focus();
    }, 100);
  };

  const handleAddMedication = async () => {
    if (!newMedication.medicationId || !newMedication.dosage) {
      alert('Please select a valid medication from the list and enter dosage');
      return;
    }

    if (!medications || medications.length === 0) {
      alert('Medications list is not loaded yet. Please wait or try again.');
      return;
    }

    const selectedMedication = medications.find(m => m && m.id == newMedication.medicationId);
    
    if (!selectedMedication) {
      alert('Selected medication not found. Please select again.');
      return;
    }

    // Check stock availability
    if (!isMedicationSelectable(selectedMedication)) {
      if (isMedicationExpired(selectedMedication)) {
        alert(`Cannot add ${selectedMedication.medicationName || selectedMedication.name}: This medication has expired on ${formatExpiryDate(selectedMedication.expiryDate)}.`);
      } else if (selectedMedication.currentStock <= 0) {
        alert(`Cannot add ${selectedMedication.medicationName || selectedMedication.name}: This medication is out of stock.`);
      }
      return;
    }

    try {
      // Parse quantity from dosage string
      let quantity = 1;
      const dosageMatch = newMedication.dosage.toLowerCase().match(/(\d+)/);
      if (dosageMatch) {
        quantity = parseInt(dosageMatch[1]);
      }
      
      console.log(`Deducting ${quantity} units from medication ${selectedMedication.id}`);
      
      // Calculate new stock
      const updatedStock = selectedMedication.currentStock - quantity;
      
      if (updatedStock < 0) {
        throw new Error(`Cannot deduct ${quantity} units. Only ${selectedMedication.currentStock} units available.`);
      }
      
      // Get the full medication object including all required fields
      // First, let's get the complete medication data
      const completeMedicationData = {
        // All required fields from your backend
        medicationName: selectedMedication.medicationName || selectedMedication.name,
        genericName: selectedMedication.genericName || '',
        dosageForm: selectedMedication.dosageForm || selectedMedication.unit || 'Tablet',
        strength: selectedMedication.strength || '',
        currentStock: updatedStock, // This is what we're updating
        minimumStock: selectedMedication.minimumStock || selectedMedication.minStockLevel || 5,
        supplier: selectedMedication.supplier || '',
        expiryDate: selectedMedication.expiryDate || '',
        isActive: selectedMedication.isActive !== false, // Default to true
        category: selectedMedication.category || 'Other'
      };
      
      console.log('Sending update with data:', completeMedicationData);
      
      // Update the medication in backend
      await medicationService.updateMedication(selectedMedication.id, completeMedicationData);
      
      // Add to form medications with updated stock info
      const medicationToAdd = {
        ...newMedication,
        medicationName: selectedMedication?.medicationName || selectedMedication?.name || 'Unknown Medication',
        id: Date.now(), // Temporary ID for UI
        quantityDeducted: quantity, // Track how much was deducted
        stockInfo: {
          currentStock: updatedStock, // Use the new stock value
          originalStock: selectedMedication.currentStock, // Keep original for reference
          strength: selectedMedication.strength,
          category: selectedMedication.category
        }
      };

      setFormData(prev => ({
        ...prev,
        medications: [...(prev.medications || []), medicationToAdd]
      }));

      // Reset new medication form
      setNewMedication({
        medicationId: '',
        medicationName: '',
        dosage: '',
        frequency: '',
        duration: '',
        notes: ''
      });

      // Show success message with updated stock
      alert(`${medicationToAdd.medicationName} added successfully. ${quantity} unit(s) deducted. Remaining stock: ${updatedStock}`);
      
      // Refresh the medications list to show updated stock
      medicationService.clearCache();
      if (typeof refetch === 'function') {
        refetch();
      }
      
    } catch (error) {
      console.error('Error deducting medication stock:', error);
      alert(`Failed to deduct medication: ${error.message}`);
    }
  };

  const handleAddTreatment = () => {
    if (!newTreatment.treatmentName) {
      alert('Please enter treatment name');
      return;
    }

    const treatmentToAdd = {
      ...newTreatment,
      id: Date.now() // Temporary ID for UI
    };

    setFormData(prev => ({
      ...prev,
      treatments: [...(prev.treatments || []), treatmentToAdd]
    }));

    setNewTreatment({
      treatmentName: '',
      description: '',
      duration: '',
      notes: ''
    });
  };

  const handleRemoveMedication = (index) => {
    setFormData(prev => ({
      ...prev,
      medications: (prev.medications || []).filter((_, i) => i !== index)
    }));
  };

  const handleRemoveTreatment = (index) => {
    setFormData(prev => ({
      ...prev,
      treatments: (prev.treatments || []).filter((_, i) => i !== index)
    }));
  };

  const mapOutcomeToDisposition = (outcome) => {
    const mapping = {
      'Return to Class': 'RETURNED_TO_CLASS',
      'Sent Home': 'SENT_HOME',
      'Under Observation': 'UNDER_OBSERVATION',
      'Emergency Referral': 'REFERRED_TO_HOSPITAL'
    };
    return mapping[outcome] || outcome;
  };

  const handleStudentSelect = (student) => {
    setFormData(prev => ({
      ...prev,
      studentId: student?.id || '',
      student: student
    }));
    setSearchTerm(`${student?.studentId || ''} - ${student?.firstName || ''} ${student?.lastName || ''}`);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (!value && formData.student) {
      setFormData(prev => ({
        ...prev,
        studentId: '',
        student: null
      }));
    }
  };

  // Don't return early from the component - this breaks hook order
  // Move the conditional return to the end
  if (!isOpen) return null;

  


  return (
    <div className="fixed inset-0 z-50">
      {/* Modal positioned under the New Visit button */}
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
            <h2 className="text-2xl font-bold text-gray-900">Record New Visit</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition duration-200 p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {/* {currentNurse && (
            <div className="mt-2 text-sm text-gray-600">
              Logged in as: <span className="font-semibold">{currentNurse.name}</span>
            </div>
          )} */}
        </div>

        <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 220px)' }}>
          <form onSubmit={handleSubmit} className="p-6 space-y-6 bg-gray-50 scrollbar-hide">
            {/* Student Information - UPDATED */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Student Information</h3>
                <span className="text-xs text-red-500 font-medium">* Required</span>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Student <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Search by Student ID or Name..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white hover:bg-gray-50"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                
                {searchTerm && !formData.student && (
                  <div className="mt-2 max-h-60 overflow-y-auto border border-gray-200 rounded-xl bg-white shadow-sm">
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map(student => (
                        <div
                          key={student.id}
                          onClick={() => handleStudentSelect(student)}
                          className="p-4 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition duration-200"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium text-gray-900">
                                {student.firstName} {student.lastName}
                              </div>
                              <div className="text-sm text-gray-600">
                                ID: {student.studentId} • Grade: {student.gradeLevel || 'N/A'}
                              </div>
                            </div>
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        No students found matching "{searchTerm}"
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {formData.student && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-blue-900">
                        Selected Student
                      </div>
                      <div className="mt-1">
                        <div className="font-medium text-gray-900">
                          {formData.student.firstName} {formData.student.lastName}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">ID:</span> {formData.student.studentId} • 
                          <span className="font-medium ml-2">Grade:</span> {formData.student.gradeLevel || 'N/A'} • 
                          <span className="font-medium ml-2">Database ID:</span> {formData.student.id}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, student: null, studentId: '' }));
                        setSearchTerm('');
                      }}
                      className="text-red-600 hover:text-red-800 p-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {formData.student && (
                <div className="bg-white rounded-xl p-4 border border-blue-200 mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h4 className="text-sm font-semibold text-gray-900">Medical History</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowMedicalHistory(!showMedicalHistory)}
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                    >
                      {showMedicalHistory ? 'Hide' : 'Show'}
                      <svg className={`w-4 h-4 transition-transform ${showMedicalHistory ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                  
                  {loadingMedicalHistory ? (
                    <div className="text-center py-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto"></div>
                    </div>
                  ) : showMedicalHistory && (
                    <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                      {studentMedicalHistory.length === 0 ? (
                        <div className="text-center text-gray-500 text-sm py-2">
                          No medical conditions recorded
                        </div>
                      ) : (
                        studentMedicalHistory.map((record) => (
                          <div 
                            key={record.id} 
                            className={`flex items-start p-3 rounded ${
                              record.isActive 
                                ? 'bg-red-50 border border-red-100' 
                                : 'bg-gray-50 border border-gray-100'
                            }`}
                          >
                            <div className={`w-2 h-2 mt-2 mr-3 rounded-full flex-shrink-0 ${
                              record.severity === 'Severe' ? 'bg-red-500' :
                              record.severity === 'Moderate' ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`} />
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="font-medium text-sm text-gray-900">
                                    {record.conditionName}
                                    {!record.isActive && (
                                      <span className="ml-2 text-xs text-gray-500">(Inactive)</span>
                                    )}
                                  </div>
                                  {record.treatment && (
                                    <div className="text-xs text-gray-600 mt-1">
                                      Treatment: {record.treatment}
                                    </div>
                                  )}
                                  {record.notes && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      {record.notes}
                                    </div>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500 ml-2">
                                  {record.diagnosisDate ? new Date(record.diagnosisDate).toLocaleDateString() : 'N/A'}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 mt-2">
                                <span className={`text-xs px-2 py-1 rounded ${
                                  record.severity === 'Severe' ? 'bg-red-100 text-red-800' :
                                  record.severity === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {record.severity || 'Not specified'}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded ${
                                  record.isActive 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {record.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>



            {/* Reason for Visit */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Reason for Visit</h3>
                <span className="text-xs text-red-500 font-medium">* Required</span>
              </div>
              <div className="relative">
                <select
                  value={formData.reason}
                  onChange={(e) => handleChange('reason', e.target.value)} // This now works
                  className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 appearance-none bg-white hover:bg-gray-50 cursor-pointer"
                  required
                >
                  <option value="">Select reason for visit</option>
                  <option value="Headache">Headache</option>
                  <option value="Fever">Fever</option>
                  <option value="Stomach Pain">Stomach Pain</option>
                  <option value="Injury">Injury</option>
                  <option value="Allergy">Allergy</option>
                  <option value="Cold/Flu">Cold/Flu</option>
                  <option value="Skin Rash">Skin Rash</option>
                  <option value="Other">Other</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Symptoms */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Symptoms</h3>
                <span className="text-xs text-red-500 font-medium">* Required</span>
              </div>
              <textarea
                value={formData.symptoms}
                onChange={(e) => handleChange('symptoms', e.target.value)} // This now works
                placeholder="Describe symptoms (e.g., Mild fever, dizziness, headache)"
                rows="3"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white hover:bg-gray-50 resize-none"
                required
              />
            </div>

            {/* Observations */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Observations</h3>
              </div>
              <textarea
                value={formData.observations}
                onChange={(e) => handleChange('observations', e.target.value)} // This now works
                placeholder="Clinical observations (e.g., Blood pressure slightly elevated, temperature 37.8°C)"
                rows="3"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white hover:bg-gray-50 resize-none"
              />
            </div>

            {/* Vital Signs */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Vital Signs</h3>
              </div>
              <input
                type="text"
                value={formData.vitalSigns}
                onChange={(e) => handleChange('vitalSigns', e.target.value)} // This now works
                placeholder="BP: 130/85, Temp: 37.8°C, Pulse: 88"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white hover:bg-gray-50"
              />
            </div>

            {/* Final Assessment */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Final Assessment</h3>
              </div>
              <textarea
                value={formData.finalAssessment}
                onChange={(e) => handleChange('finalAssessment', e.target.value)} // This now works
                placeholder="Final assessment and recommendations..."
                rows="3"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white hover:bg-gray-50 resize-none"
              />
            </div>

            {/* Referred By */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Referred By</h3>
              </div>
              <input
                type="text"
                value={formData.referredBy}
                onChange={(e) => handleChange('referredBy', e.target.value)} // This now works
                placeholder="Teacher or staff member who referred student"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white hover:bg-gray-50"
              />
            </div>

            

            {/* Medications Section with Typeahead - UPDATED with expiry info */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Medications Administered</h3>
              </div>

              {/* Add Medication Form */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg" ref={medicationDropdownRef}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Medication *
                    </label>
                    
                    <input
                      type="text"
                      value={newMedication.medicationName}
                      onChange={handleMedicationSearchChange}
                      onFocus={() => {
                        if (newMedication.medicationName.trim() || medications.length > 0) {
                          setShowMedicationDropdown(true);
                        }
                      }}
                      placeholder="Type to search medications..."
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                      disabled={medicationsLoading}
                      autoComplete="off"
                    />
                    
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 top-7">
                      {medicationsLoading ? (
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </div>

                    {/* Medication Dropdown - UPDATED with expiry info */}
                    {showMedicationDropdown && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {medicationsLoading ? (
                          <div className="p-3 text-center text-gray-500">
                            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                            <p className="mt-2 text-sm">Loading medications...</p>
                          </div>
                        ) : filteredMedications.length === 0 ? (
                          <div className="p-3 text-center text-gray-500">
                            <p className="text-sm">No medications found</p>
                            <p className="text-xs mt-1">Try a different search term</p>
                          </div>
                        ) : (
                          filteredMedications.map((medication) => {
                            const isExpired = isMedicationExpired(medication);
                            const expiryStatus = getExpiryStatus(medication);
                            
                            return (
                              <div
                                key={medication.id}
                                onClick={() => handleMedicationSelect(medication)}
                                className={`p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition duration-200 ${
                                  medication.currentStock <= 0 || isExpired ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                                title={isExpired ? `Expired on ${formatExpiryDate(medication.expiryDate)}` : 
                                       medication.currentStock <= 0 ? 'Out of stock' : ''}
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="font-medium text-gray-900">
                                      {medication.medicationName || medication.name}
                                      {isExpired && (
                                        <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                                          EXPIRED
                                        </span>
                                      )}
                                    </div>
                                    {medication.genericName && (
                                      <div className="text-xs text-gray-500 mt-1">
                                        Generic: {medication.genericName}
                                      </div>
                                    )}
                                    <div className="text-xs text-gray-600 mt-1">
                                      Strength: {medication.strength} • Category: {medication.category}
                                    </div>
                                  </div>
                                  <div className="text-right ml-2">
                                    <div className={`text-sm font-medium ${
                                      medication.currentStock > 10 ? 'text-green-600' : 
                                      medication.currentStock > 0 ? 'text-yellow-600' : 
                                      'text-red-600'
                                    }`}>
                                      Stock: {medication.currentStock}
                                    </div>
                                    <div className={`text-xs mt-1 ${expiryStatus.color}`}>
                                      {expiryStatus.status}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                    
                    {/* Selected medication info - UPDATED with expiry */}
                    {newMedication.medicationId && (() => {
                      const selectedMed = medications.find(m => m && m.id == newMedication.medicationId);
                      const isExpired = selectedMed ? isMedicationExpired(selectedMed) : false;
                      const expiryStatus = selectedMed ? getExpiryStatus(selectedMed) : null;
                      
                      return (
                        <div className={`mt-2 p-2 border rounded ${
                          isExpired ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className={`text-sm font-medium ${
                                isExpired ? 'text-red-800' : 'text-green-800'
                              }`}>
                                Selected: {newMedication.medicationName}
                              </span>
                              <div className={`text-xs mt-1 ${isExpired ? 'text-red-600' : 'text-green-600'}`}>
                                {isExpired ? '⚠️ EXPIRED - DO NOT ADMINISTER' : '✓ Valid medication from database'}
                                {expiryStatus && !isExpired && (
                                  <div className="mt-1">{expiryStatus.status}</div>
                                )}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setNewMedication(prev => ({
                                  ...prev,
                                  medicationId: '',
                                  medicationName: ''
                                }));
                              }}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Clear
                            </button>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dosage *
                    </label>
                    <input
                      type="text"
                      value={newMedication.dosage}
                      onChange={(e) => setNewMedication(prev => ({ ...prev, dosage: e.target.value }))}
                      placeholder="e.g., 1 tablet, 5ml, 500mg"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter the exact dosage to be administered
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Frequency
                    </label>
                    <select
                      value={newMedication.frequency}
                      onChange={(e) => setNewMedication(prev => ({ ...prev, frequency: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select frequency</option>
                      <option value="Once daily">Once daily</option>
                      <option value="Twice daily">Twice daily</option>
                      <option value="Three times daily">Three times daily</option>
                      <option value="Every 4 hours">Every 4 hours</option>
                      <option value="Every 6 hours">Every 6 hours</option>
                      <option value="Every 8 hours">Every 8 hours</option>
                      <option value="As needed">As needed</option>
                      <option value="Single dose">Single dose</option>
                      <option value="Before meals">Before meals</option>
                      <option value="After meals">After meals</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration
                    </label>
                    <input
                      type="text"
                      value={newMedication.duration}
                      onChange={(e) => setNewMedication(prev => ({ ...prev, duration: e.target.value }))}
                      placeholder="e.g., 3 days, 1 week, 10 days"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      How long to take the medication
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <input
                      type="text"
                      value={newMedication.notes}
                      onChange={(e) => setNewMedication(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Additional instructions or notes"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Optional special instructions
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleAddMedication}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                    disabled={!newMedication.medicationId}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Medication
                  </button>
                  
                  {newMedication.medicationId && (() => {
                    const selectedMed = medications.find(m => m && m.id == newMedication.medicationId);
                    const isExpired = selectedMed ? isMedicationExpired(selectedMed) : false;
                    
                    return (
                      <div className={`text-sm ${isExpired ? 'text-red-600' : 'text-green-600'}`}>
                        {isExpired ? '⚠️ EXPIRED - Cannot add' : '✓ Ready to add medication'}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* List of Added Medications - UPDATED with expiry info */}
              {formData.medications && formData.medications.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-700">Added Medications:</h4>
                    <span className="text-xs text-gray-500">
                      {formData.medications.length} medication{formData.medications.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {formData.medications.map((med, index) => {
                      const isExpired = med.stockInfo?.isExpired;
                      
                      return (
                        <div key={index} className={`flex items-center justify-between p-3 rounded-lg border ${
                          isExpired ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
                        }`}>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className={`font-medium ${isExpired ? 'text-red-900' : 'text-gray-900'}`}>
                                  {med.medicationName}
                                  {isExpired && (
                                    <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                                      EXPIRED
                                    </span>
                                  )}
                                </div>
                                <div className={`text-sm mt-1 ${isExpired ? 'text-red-700' : 'text-gray-600'}`}>
                                  <span className="font-medium">Dosage:</span> {med.dosage} • 
                                  <span className="font-medium ml-2">Frequency:</span> {med.frequency} • 
                                  <span className="font-medium ml-2">Duration:</span> {med.duration}
                                </div>
                                {med.notes && (
                                  <div className="text-sm text-blue-600 mt-1">
                                    <span className="font-medium">Notes:</span> {med.notes}
                                  </div>
                                )}
                                {med.stockInfo && (
                                  <div className={`text-xs mt-1 ${isExpired ? 'text-red-600' : 'text-gray-500'}`}>
                                    Stock: {med.stockInfo.currentStock} • Strength: {med.stockInfo.strength}
                                    {med.stockInfo.expiryDate && (
                                      <span> • Expires: {formatExpiryDate(med.stockInfo.expiryDate)}</span>
                                    )}
                                  </div>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveMedication(index)}
                                className={`ml-4 p-1 ${isExpired ? 'text-red-700 hover:text-red-900' : 'text-red-600 hover:text-red-800'}`}
                                title="Remove medication"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Treatments Section - FIXED with null check */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Treatments/Procedures</h3>
              </div>

              {/* Add Treatment Form */}
              <div className="mb-6 p-4 bg-green-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Treatment Name *
                    </label>
                    <input
                      type="text"
                      value={newTreatment.treatmentName}
                      onChange={(e) => setNewTreatment(prev => ({ ...prev, treatmentName: e.target.value }))}
                      placeholder="e.g., Wound dressing, Ice pack"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={newTreatment.description}
                      onChange={(e) => setNewTreatment(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the treatment"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration
                    </label>
                    <input
                      type="text"
                      value={newTreatment.duration}
                      onChange={(e) => setNewTreatment(prev => ({ ...prev, duration: e.target.value }))}
                      placeholder="e.g., 15 minutes, 30 minutes"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <input
                      type="text"
                      value={newTreatment.notes}
                      onChange={(e) => setNewTreatment(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Additional notes"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={handleAddTreatment}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Add Treatment
                </button>
              </div>

              {/* List of Added Treatments - FIXED with null check */}
              {formData.treatments && formData.treatments.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Added Treatments:</h4>
                  <div className="space-y-2">
                    {formData.treatments.map((treatment, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                        <div>
                          <div className="font-medium">{treatment.treatmentName}</div>
                          <div className="text-sm text-gray-600">
                            {treatment.description} • {treatment.duration}
                            {treatment.notes && <span> • {treatment.notes}</span>}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveTreatment(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Outcome */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-teal-100 rounded-lg">
                  <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Outcome</h3>
                <span className="text-xs text-red-500 font-medium">* Required</span>
              </div>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer p-3 hover:bg-gray-50 rounded-lg">
                  <input
                    type="radio"
                    name="outcome"
                    value="Return to Class"
                    checked={formData.disposition === 'Return to Class'}
                    onChange={(e) => handleChange('disposition', e.target.value)} // This now works
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-medium text-gray-900">Return to Class</span>
                    <p className="text-sm text-gray-500 mt-1">Student can return to normal activities</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-3 hover:bg-gray-50 rounded-lg">
                  <input
                    type="radio"
                    name="outcome"
                    value="Sent Home"
                    checked={formData.disposition === 'Sent Home'}
                    onChange={(e) => handleChange('disposition', e.target.value)} // This now works
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-medium text-gray-900">Sent Home</span>
                    <p className="text-sm text-gray-500 mt-1">Student should go home and rest</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-3 hover:bg-gray-50 rounded-lg">
                  <input
                    type="radio"
                    name="outcome"
                    value="Under Observation"
                    checked={formData.disposition === 'Under Observation'}
                    onChange={(e) => handleChange('disposition', e.target.value)} // This now works
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-medium text-gray-900">Under Observation</span>
                    <p className="text-sm text-gray-500 mt-1">Keep in clinic for further monitoring</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-3 hover:bg-gray-50 rounded-lg">
                  <input
                    type="radio"
                    name="outcome"
                    value="Emergency Referral"
                    checked={formData.disposition === 'Emergency Referral'}
                    onChange={(e) => handleChange('disposition', e.target.value)} // This now works
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-medium text-gray-900">Emergency Referral</span>
                    <p className="text-sm text-gray-500 mt-1">Requires immediate hospital attention</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Emergency Flag Warning */}
            {formData.disposition === 'Emergency Referral' && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-red-800">Emergency Flag Will Be Set</h4>
                    <p className="text-sm text-red-700 mt-1">
                      This visit will be marked as an emergency. Ensure all emergency procedures are followed.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button - with rounded bottom corners */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 shadow-sm hover:shadow-md"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Submit Visit Record
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewVisitModal;