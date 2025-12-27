import { useState, useCallback } from 'react';
import { medicalHistoryService } from '../services/medicalHistoryService';

export const useMedicalHistory = (studentId) => {
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Fetch medical history for a student
  const fetchMedicalHistory = useCallback(async (id = studentId) => {
    if (!id) {
      setError('No student ID provided');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const data = await medicalHistoryService.getByStudent(id);
      setMedicalHistory(data);
      return data;
    } catch (err) {
      const errorMessage = err.message || 'Failed to load medical history';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  // Add new medical record
  const addMedicalRecord = useCallback(async (recordData) => {
    if (!studentId) {
      throw new Error('No student ID provided');
    }

    setLoading(true);
    setError(null);
    
    try {
      const newRecord = await medicalHistoryService.create(studentId, recordData);
      setMedicalHistory(prev => [...prev, newRecord]);
      setSuccessMessage('Medical record added successfully');
      return newRecord;
    } catch (err) {
      const errorMessage = err.message || 'Failed to add medical record';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  // Update existing medical record
  const updateMedicalRecord = useCallback(async (recordId, recordData) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedRecord = await medicalHistoryService.update(recordId, recordData);
      setMedicalHistory(prev => 
        prev.map(record => record.id === recordId ? updatedRecord : record)
      );
      setSuccessMessage('Medical record updated successfully');
      return updatedRecord;
    } catch (err) {
      const errorMessage = err.message || 'Failed to update medical record';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Deactivate medical record
  const deactivateMedicalRecord = useCallback(async (recordId) => {
    setLoading(true);
    setError(null);
    
    try {
      await medicalHistoryService.deactivate(recordId);
      setMedicalHistory(prev => 
        prev.map(record => 
          record.id === recordId ? { ...record, isActive: false } : record
        )
      );
      setSuccessMessage('Medical record deactivated successfully');
      return true;
    } catch (err) {
      const errorMessage = err.message || 'Failed to deactivate medical record';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Reactivate medical record (by updating isActive to true)
  const reactivateMedicalRecord = useCallback(async (recordId) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedRecord = await medicalHistoryService.update(recordId, { isActive: true });
      setMedicalHistory(prev => 
        prev.map(record => record.id === recordId ? updatedRecord : record)
      );
      setSuccessMessage('Medical record reactivated successfully');
      return updatedRecord;
    } catch (err) {
      const errorMessage = err.message || 'Failed to reactivate medical record';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Check if student has specific condition
  const checkCondition = useCallback(async (conditionName) => {
    if (!studentId) {
      throw new Error('No student ID provided');
    }
    
    try {
      return await medicalHistoryService.checkCondition(studentId, conditionName);
    } catch (err) {
      console.error('Error checking condition:', err);
      return false;
    }
  }, [studentId]);

  // Clear success message
  const clearSuccessMessage = useCallback(() => {
    setSuccessMessage(null);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Get active conditions count
  const getActiveConditionsCount = useCallback(() => {
    return medicalHistory.filter(record => record.isActive).length;
  }, [medicalHistory]);

  return {
    // State
    medicalHistory,
    loading,
    error,
    successMessage,
    
    // Computed values
    activeConditionsCount: getActiveConditionsCount(),
    hasMedicalHistory: medicalHistory.length > 0,
    hasActiveConditions: getActiveConditionsCount() > 0,
    
    // Actions
    fetchMedicalHistory,
    addMedicalRecord,
    updateMedicalRecord,
    deactivateMedicalRecord,
    reactivateMedicalRecord,
    checkCondition,
    clearSuccessMessage,
    clearError,
    
    // Helper functions
    getRecordById: (recordId) => 
      medicalHistory.find(record => record.id === recordId)
  };
};

// Create a standalone hook for checking conditions (useful in visits)
export const useConditionCheck = () => {
  const [checking, setChecking] = useState(false);
  const [checkError, setCheckError] = useState(null);

  const checkStudentCondition = useCallback(async (studentId, conditionName) => {
    if (!studentId || !conditionName) {
      return false;
    }

    setChecking(true);
    setCheckError(null);
    
    try {
      const hasCondition = await medicalHistoryService.checkCondition(studentId, conditionName);
      return hasCondition;
    } catch (err) {
      setCheckError(err.message);
      console.error('Error checking condition:', err);
      return false;
    } finally {
      setChecking(false);
    }
  }, []);

  return {
    checking,
    checkError,
    checkStudentCondition,
    clearCheckError: () => setCheckError(null)
  };
};