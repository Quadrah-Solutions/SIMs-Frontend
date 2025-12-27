import { useState, useEffect } from 'react';
import { medicationService, mockMedicationData } from '../services/medicationService';

export const useMedications = () => {
  const [medicationsData, setMedicationsData] = useState({
    medications: [],
    categories: [],
    loading: true,
    error: null,
    currentPage: 1,
    totalPages: 1,
    totalCount: 0
  });

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    category: '',
    expiryDateFrom: '',
    expiryDateTo: ''
  });

  const fetchMedications = async (page = 1) => {
    try {
      console.log(`🔄 Fetching medications - Page ${page}, Filters:`, filters);
      setMedicationsData(prev => ({ ...prev, loading: true, error: null }));
      
      const data = await medicationService.getMedications(page, 10, filters);
      
      console.log('✅ API data received:', {
        medicationsCount: data.medications?.length || 0,
        totalCount: data.totalCount,
        totalPages: data.totalPages,
        currentPage: data.currentPage
      });
      
      setMedicationsData(prev => ({
        ...prev,
        medications: data.medications || [],
        currentPage: data.currentPage || page,
        totalPages: data.totalPages || 1,
        totalCount: data.totalCount || 0,
        loading: false
      }));
      
    } catch (error) {
      console.error('❌ Error fetching medications:', error);
      setMedicationsData(prev => ({
        ...prev,
        error: error.message,
        loading: false,
        medications: []
      }));
    }
  };

  const fetchCategories = async () => {
    try {
      const categories = await medicationService.getCategories();
      
      setMedicationsData(prev => ({
        ...prev,
        categories: categories || []
      }));
      
    } catch (error) {
      console.error('Error fetching categories:', error);
      setMedicationsData(prev => ({
        ...prev,
        categories: mockMedicationData.categories
      }));
    }
  };

  useEffect(() => {
    console.log('useMedications hook is running');
    fetchMedications(1);
    fetchCategories();
  }, []);

  useEffect(() => {
    // Refetch medications when filters change
    fetchMedications(1);
  }, [filters]);

  const refetch = (page = 1) => {
    console.log('Refetch called with page:', page);
    fetchMedications(page);
  };

  const updateFilters = (newFilters) => {
    console.log('Filters updated:', newFilters);
    setFilters(newFilters);
  };

  const clearFilters = () => {
    console.log('Clearing filters');
    setFilters({
      search: '',
      status: '',
      category: '',
      expiryDateFrom: '',
      expiryDateTo: ''
    });
  };

  // Calculate statistics - make sure medicationService.calculateStatistics exists
  const statistics = medicationService.calculateStatistics ? 
    medicationService.calculateStatistics(medicationsData.medications) : 
    {
      totalMedications: 0,
      lowStockItems: 0,
      expiringSoon: 0,
      inStock: 0
    };

  return {
    ...medicationsData,
    statistics,
    filters,
    refetch,
    updateFilters,
    clearFilters,
    // Service functions to be used in components
    createMedication: medicationService.createMedication,
    updateMedication: medicationService.updateMedication,
    deleteMedication: medicationService.deleteMedication,
    restockMedication: medicationService.restockMedication,
    getMedicationById: medicationService.getMedicationById
  };
};