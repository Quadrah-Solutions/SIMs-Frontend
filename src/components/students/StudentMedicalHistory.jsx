import React, { useState, useEffect } from 'react';
import { useMedicalHistory } from '../../hooks/useMedicalHistory';
import { useNotification } from '../common/NotificationProvider';

const StudentMedicalHistory = ({ isOpen, onClose, studentId, studentName }) => {
  const { 
    medicalHistory,
    loading,
    error,
    successMessage,
    activeConditionsCount,
    addMedicalRecord,
    updateMedicalRecord,
    deactivateMedicalRecord,
    reactivateMedicalRecord,
    fetchMedicalHistory,
    clearError
  } = useMedicalHistory(studentId);

  const { success: showSuccess, error: showError } = useNotification();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  
  const [formData, setFormData] = useState({
    conditionName: '',
    diagnosisDate: new Date().toISOString().split('T')[0],
    severity: 'Mild',
    treatment: '',
    notes: '',
    isActive: true
  });

  // Initialize data and visibility
  useEffect(() => {
    if (isOpen && studentId) {
      fetchMedicalHistory();
      // Small delay to trigger animation
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
      // Reset form when closing
      setShowAddForm(false);
      setEditingRecord(null);
      resetForm();
    }
  }, [isOpen, studentId, fetchMedicalHistory]);

  // Show notifications for success/error
  useEffect(() => {
    if (error) {
      showError(error);
      clearError();
    }
  }, [error, showError, clearError]);

  useEffect(() => {
    if (successMessage) {
      showSuccess(successMessage);
    }
  }, [successMessage, showSuccess]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingRecord) {
        await updateMedicalRecord(editingRecord.id, formData);
      } else {
        await addMedicalRecord(formData);
      }
      
      setShowAddForm(false);
      setEditingRecord(null);
      resetForm();
    } catch (err) {
      // Error is already handled by the hook and shown via notification
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormData({
      conditionName: record.conditionName,
      diagnosisDate: record.diagnosisDate || new Date().toISOString().split('T')[0],
      severity: record.severity || 'Mild',
      treatment: record.treatment || '',
      notes: record.notes || '',
      isActive: record.isActive
    });
    setShowAddForm(true);
  };

  const handleToggleStatus = async (record) => {
    if (record.isActive) {
      if (window.confirm('Are you sure you want to deactivate this medical record?')) {
        await deactivateMedicalRecord(record.id);
      }
    } else {
      if (window.confirm('Are you sure you want to reactivate this medical record?')) {
        await reactivateMedicalRecord(record.id);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      conditionName: '',
      diagnosisDate: new Date().toISOString().split('T')[0],
      severity: 'Mild',
      treatment: '',
      notes: '',
      isActive: true
    });
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'severe': return 'bg-red-100 text-red-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'mild': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-6">
      {/* Background overlay with blur */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal container */}
      <div 
        className={`relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-200 transition-all duration-300 transform ${
          isVisible 
            ? 'translate-y-0 opacity-100 scale-100' 
            : 'translate-y-4 opacity-0 scale-95'
        }`}
        style={{ 
          maxHeight: 'calc(100vh - 48px)', // Account for padding
          marginTop: '6rem' // Position below the button
        }}
      >
        {/* Header - with rounded top corners */}
        <div className="p-6 border-b border-gray-200 bg-white rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Medical History</h2>
              <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                Managing medical records for <span className="font-semibold text-gray-900">{studentName}</span>
                {activeConditionsCount > 0 && (
                  <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded-full">
                    {activeConditionsCount} active condition{activeConditionsCount !== 1 ? 's' : ''}
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition duration-200 p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form Content - Scrollable */}
        <div 
          className="overflow-y-auto"
          style={{ 
            maxHeight: 'calc(100vh - 240px)', // Adjusted for header and padding
          }}
        >
          <div className="p-6 space-y-6 bg-gray-50">
            {/* Action Header with New Record Button */}
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Medical Records ({medicalHistory?.length || 0})
              </h3>
              <button
                onClick={() => {
                  setShowAddForm(true);
                  setEditingRecord(null);
                  resetForm();
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add New Record
              </button>
            </div>

            {/* Loading State */}
            {loading && !medicalHistory?.length && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}

            {/* Add/Edit Form */}
            {showAddForm && (
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  {editingRecord ? 'Edit Medical Record' : 'Add New Medical Condition'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Condition Name *
                      </label>
                      <input
                        type="text"
                        name="conditionName"
                        value={formData.conditionName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white hover:bg-gray-50"
                        required
                        placeholder="e.g., Asthma, Diabetes, Allergy"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Diagnosis Date
                      </label>
                      <input
                        type="date"
                        name="diagnosisDate"
                        value={formData.diagnosisDate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white hover:bg-gray-50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Severity
                      </label>
                      <div className="relative">
                        <select
                          name="severity"
                          value={formData.severity}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 appearance-none bg-white hover:bg-gray-50 cursor-pointer"
                        >
                          <option value="Mild">Mild</option>
                          <option value="Moderate">Moderate</option>
                          <option value="Severe">Severe</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <div className="flex items-center mt-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            name="isActive"
                            checked={formData.isActive}
                            onChange={handleInputChange}
                            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded-xl"
                          />
                          <span className="ml-2 text-sm text-gray-700">Active Condition</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Treatment / Management
                    </label>
                    <textarea
                      name="treatment"
                      value={formData.treatment}
                      onChange={handleInputChange}
                      rows="2"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 resize-none bg-white hover:bg-gray-50"
                      placeholder="Describe treatment, medication, or management plan"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows="2"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 resize-none bg-white hover:bg-gray-50"
                      placeholder="Additional notes or observations"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingRecord(null);
                        resetForm();
                      }}
                      className="px-6 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                    >
                      {loading ? 'Saving...' : (editingRecord ? 'Update Record' : 'Add Record')}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Medical History List */}
            {!showAddForm && !loading && medicalHistory && (
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                {medicalHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="w-12 h-12 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No Medical Records</h3>
                    <p className="mt-1 text-sm text-gray-500">No medical history has been recorded for this student.</p>
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition duration-200"
                    >
                      Add First Record
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="overflow-hidden border border-gray-200 rounded-xl">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Condition
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Diagnosed
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Severity
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {medicalHistory.map((record) => (
                            <tr key={record.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                <div className="font-medium text-gray-900">{record.conditionName}</div>
                                {record.treatment && (
                                  <div className="text-sm text-gray-600 mt-1">{record.treatment}</div>
                                )}
                                {record.notes && (
                                  <div className="text-sm text-gray-500 mt-1">{record.notes}</div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {record.diagnosisDate ? new Date(record.diagnosisDate).toLocaleDateString() : 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(record.severity)}`}>
                                  {record.severity || 'Not specified'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  record.isActive 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {record.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-4">
                                  <button
                                    onClick={() => handleEdit(record)}
                                    className="text-blue-600 hover:text-blue-900 transition duration-200"
                                    title="Edit"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleToggleStatus(record)}
                                    className={record.isActive ? "text-red-600 hover:text-red-900 transition duration-200" : "text-green-600 hover:text-green-900 transition duration-200"}
                                    title={record.isActive ? "Deactivate" : "Reactivate"}
                                  >
                                    {record.isActive ? 'Deactivate' : 'Reactivate'}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentMedicalHistory;