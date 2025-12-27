import React, { useState, useEffect } from 'react';
import { useMedicalHistory } from '../../hooks/useMedicalHistory';
import { useNotification } from '../common/NotificationProvider';

const StudentMedicalHistory = ({ studentId, studentName, onClose }) => {
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
  
  const [formData, setFormData] = useState({
    conditionName: '',
    diagnosisDate: new Date().toISOString().split('T')[0],
    severity: 'Mild',
    treatment: '',
    notes: '',
    isActive: true
  });

  // Initialize data
  useEffect(() => {
    if (studentId) {
      fetchMedicalHistory();
    }
  }, [studentId, fetchMedicalHistory]);

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

  if (loading && !medicalHistory.length) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Medical History</h2>
            <p className="text-sm text-gray-600 mt-1">
              Managing medical records for {studentName}
              {activeConditionsCount > 0 && (
                <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded-full">
                  {activeConditionsCount} active condition{activeConditionsCount !== 1 ? 's' : ''}
                </span>
              )}
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => {
                setShowAddForm(true);
                setEditingRecord(null);
                resetForm();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Condition
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg text-sm font-medium border border-gray-300"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingRecord ? 'Edit Medical Record' : 'Add New Medical Condition'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Condition Name *
                </label>
                <input
                  type="text"
                  name="conditionName"
                  value={formData.conditionName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="e.g., Asthma, Diabetes, Allergy"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Diagnosis Date
                </label>
                <input
                  type="date"
                  name="diagnosisDate"
                  value={formData.diagnosisDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Severity
                </label>
                <select
                  name="severity"
                  value={formData.severity}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Mild">Mild</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Severe">Severe</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <div className="flex items-center mt-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Active Condition</span>
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Treatment / Management
              </label>
              <textarea
                name="treatment"
                value={formData.treatment}
                onChange={handleInputChange}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Describe treatment, medication, or management plan"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Additional notes or observations"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingRecord(null);
                  resetForm();
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : (editingRecord ? 'Update Record' : 'Add Record')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Medical History List */}
      <div className="p-6">
        {medicalHistory.length === 0 ? (
          <div className="text-center py-8">
            <svg className="w-12 h-12 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No Medical Records</h3>
            <p className="mt-1 text-sm text-gray-500">No medical history has been recorded for this student.</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Add First Record
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Medical Records ({medicalHistory.length})
              </h3>
              <div className="text-sm text-gray-500">
                {activeConditionsCount} active condition{activeConditionsCount !== 1 ? 's' : ''}
              </div>
            </div>
            
            <div className="overflow-hidden border border-gray-200 rounded-lg">
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
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleEdit(record)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggleStatus(record)}
                            className={record.isActive ? "text-red-600 hover:text-red-900" : "text-green-600 hover:text-green-900"}
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
    </div>
  );
};

export default StudentMedicalHistory;