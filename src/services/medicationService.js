// services/medicationService.js
import config from '../config/config';
import keycloak from '../config/keycloak'; 

const API_BASE_URL = config.API_BASE_URL;

// Cache for medications
let medicationsCache = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper function to get the authorization header
const getAuthHeader = () => {
  if (keycloak && keycloak.token) {
    return { 
      'Authorization': `Bearer ${keycloak.token}`,
      'Content-Type': 'application/json'
    };
  }
  return { 'Content-Type': 'application/json' };
};

// Helper function to fetch with cache
const fetchWithCache = async (endpoint, forceRefresh = false) => {
  const now = Date.now();
  
  // Check cache first (unless force refresh)
  if (!forceRefresh && medicationsCache && (now - lastFetchTime) < CACHE_DURATION) {
    console.log('Using cached medications data');
    return medicationsCache;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: getAuthHeader()
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch medications: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Update cache
    medicationsCache = data;
    lastFetchTime = now;
    
    return data;
  } catch (error) {
    console.error(`Error fetching medications:`, error);
    
    // Return fallback/mock data
    return [
      { 
        id: 1, 
        medicationName: "Paracetamol 500mg", 
        genericName: "Acetaminophen",
        currentStock: 45,
        minimumStock: 5,
        dosageForm: "Tablets",
        strength: "500mg",
        expiryDate: "2024-06-15", 
        supplier: "Generic Pharma",
        isActive: true,
        category: "Analgesic (Pain Relief)"
      },
      { 
        id: 2, 
        medicationName: "Amoxicillin 250mg", 
        genericName: "Amoxicillin",
        currentStock: 8,
        minimumStock: 5,
        dosageForm: "Capsules",
        strength: "250mg",
        expiryDate: "2024-03-20", 
        supplier: "MedSupply",
        isActive: true,
        category: "Antibiotic"
      },
      { 
        id: 3, 
        medicationName: "Ibuprofen 400mg", 
        genericName: "Ibuprofen",
        currentStock: 23,
        minimumStock: 5,
        dosageForm: "Tablets",
        strength: "400mg",
        expiryDate: "2024-08-10", 
        supplier: "Generic Pharma",
        isActive: true,
        category: "Anti-inflammatory"
      },
      { 
        id: 4, 
        medicationName: "Ventolin Inhaler", 
        genericName: "Salbutamol",
        currentStock: 5,
        minimumStock: 5,
        dosageForm: "Inhaler",
        strength: "100mcg",
        expiryDate: "2024-02-28", 
        supplier: "GSK",
        isActive: true,
        category: "Bronchodilator (Asthma)"
      },
      { 
        id: 5, 
        medicationName: "Cetirizine 10mg", 
        genericName: "Cetirizine",
        currentStock: 34,
        minimumStock: 5,
        dosageForm: "Tablets",
        strength: "10mg",
        expiryDate: "2024-11-15", 
        supplier: "HealthCorp",
        isActive: true,
        category: "Antihistamine (Allergy)"
      }
    ];
  }
};

// Clear cache function
const clearCache = () => {
  medicationsCache = null;
  lastFetchTime = 0;
  console.log('Medications cache cleared');
};

// Calculate statistics from medication data
const calculateStatistics = (medications) => {
  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);
  
  let totalMedications = 0;
  let lowStockItems = 0;
  let expiringSoon = 0;
  let inStock = 0;
  
  medications.forEach(med => {
    totalMedications++;
    
    if (med.currentStock < med.minimumStock) {
      lowStockItems++;
    } else {
      inStock++;
    }
    
    const expiryDate = new Date(med.expiryDate);
    if (expiryDate <= thirtyDaysFromNow && expiryDate > today) {
      expiringSoon++;
    }
  });
  
  return {
    totalMedications,
    lowStockItems,
    expiringSoon,
    inStock
  };
};

export const medicationService = {
  // GET medications with pagination and filters
    async getMedications(page = 1, pageSize = 10, filters = {}) {
    try {
        // Build query params for the new backend API
        const queryParams = new URLSearchParams({
        page: (page - 1).toString(), // Spring Boot uses 0-based indexing
        size: pageSize.toString(),
        });

        // Map frontend filter names to backend parameter names
        if (filters.search) queryParams.append('search', filters.search);
        if (filters.status) {
        // Map frontend status values to backend values
        const statusMap = {
            'in_stock': 'In Stock',
            'low_stock': 'Low Stock',
            'expiring_soon': 'Expiring Soon',
            'expired': 'Expired',
            'out_of_stock': 'Out of Stock',
            'inactive': 'Inactive'
        };
        queryParams.append('status', statusMap[filters.status] || filters.status);
        }
        if (filters.category) queryParams.append('category', filters.category);
        if (filters.expiryDateFrom) queryParams.append('expiryDateFrom', filters.expiryDateFrom);
        if (filters.expiryDateTo) queryParams.append('expiryDateTo', filters.expiryDateTo);
        if (filters.isActive !== undefined) queryParams.append('isActive', filters.isActive);

        const url = `${API_BASE_URL}/medications/inventory?${queryParams}`;
        console.log('Fetching medications from:', url);
        
        const response = await fetch(url, {
        headers: getAuthHeader()
        });
        
        if (!response.ok) {
        console.error('Response status:', response.status);
        throw new Error(`Failed to fetch medications: ${response.status}`);
        }
        
        const pageData = await response.json();
        console.log('API Response:', pageData);
        
        // Handle both old array format and new paginated format
        let medicationsArray;
        if (Array.isArray(pageData)) {
        // Old format: direct array
        medicationsArray = pageData;
        } else if (pageData.content && Array.isArray(pageData.content)) {
        // New format: paginated response
        medicationsArray = pageData.content;
        } else {
        console.warn('Unexpected API response format:', pageData);
        medicationsArray = [];
        }
        
        // Calculate status based on stock level and expiry date
        const transformedData = medicationsArray.map(medication => {
        const today = new Date();
        let daysUntilExpiry = null;
        
        if (medication.expiryDate) {
            const expiryDate = new Date(medication.expiryDate);
            daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
        }
        
        let status = "In Stock";
        if (!medication.isActive) {
            status = "Inactive";
        } else if (medication.currentStock === 0) {
            status = "Out of Stock";
        } else if (medication.currentStock < medication.minimumStock) {
            status = "Low Stock";
        } else if (daysUntilExpiry !== null && daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
            status = "Expiring Soon";
        } else if (daysUntilExpiry !== null && daysUntilExpiry <= 0) {
            status = "Expired";
        }
        
        return {
            id: medication.id,
            name: medication.medicationName,
            genericName: medication.genericName,
            brand: medication.supplier,
            quantity: medication.currentStock, // For compatibility with old code
            stockLevel: medication.currentStock, // For compatibility
            currentStock: medication.currentStock,
            minStockLevel: medication.minimumStock, // Fix: Map minimumStock to minStockLevel
            minimumStock: medication.minimumStock, // Keep original too
            expiryDate: medication.expiryDate,
            status: status,
            category: medication.category || 'Other',
            unit: medication.dosageForm, // Use dosageForm as unit
            dosageForm: medication.dosageForm,
            strength: medication.strength,
            supplier: medication.supplier,
            isActive: medication.isActive,
            daysUntilExpiry: daysUntilExpiry,
            original: medication
        };
        });
        
        // Return in the expected format
        return {
        medications: transformedData,
        totalPages: pageData.totalPages || Math.ceil(transformedData.length / pageSize) || 1,
        totalCount: pageData.totalElements || transformedData.length || 0,
        currentPage: pageData.number + 1 || page // Convert back to 1-based indexing
        };
        
    } catch (error) {
        console.error('Error fetching medications:', error);
        
        // Fallback to mock data with frontend filtering
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        
        // Filter mock data based on filters
        let filteredData = mockMedicationData.medications;
        
        if (filters.search && filters.search.trim() !== '') {
        const searchTerm = filters.search.toLowerCase();
        filteredData = filteredData.filter(med =>
            (med.medicationName && med.medicationName.toLowerCase().includes(searchTerm)) ||
            (med.genericName && med.genericName.toLowerCase().includes(searchTerm)) ||
            (med.supplier && med.supplier.toLowerCase().includes(searchTerm))
        );
        }
        
        if (filters.status && filters.status !== '') {
        const today = new Date();
        filteredData = filteredData.filter(med => {
            const expiryDate = new Date(med.expiryDate);
            const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
            
            let status = "In Stock";
            if (!med.isActive) {
            status = "Inactive";
            } else if (med.currentStock === 0) {
            status = "Out of Stock";
            } else if (med.currentStock < med.minimumStock) {
            status = "Low Stock";
            } else if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
            status = "Expiring Soon";
            } else if (daysUntilExpiry <= 0) {
            status = "Expired";
            }
            
            // Map frontend filter values
            const statusMap = {
            'in_stock': 'In Stock',
            'low_stock': 'Low Stock',
            'expiring_soon': 'Expiring Soon',
            'expired': 'Expired',
            'out_of_stock': 'Out of Stock',
            'inactive': 'Inactive'
            };
            
            return status === statusMap[filters.status];
        });
        }
        
        if (filters.category && filters.category !== '') {
        filteredData = filteredData.filter(med => med.category === filters.category);
        }
        
        if (filters.expiryDateFrom) {
        filteredData = filteredData.filter(med => 
            new Date(med.expiryDate) >= new Date(filters.expiryDateFrom)
        );
        }
        
        if (filters.expiryDateTo) {
        filteredData = filteredData.filter(med => 
            new Date(med.expiryDate) <= new Date(filters.expiryDateTo)
        );
        }
        
        if (filters.isActive !== undefined) {
        filteredData = filteredData.filter(med => med.isActive === filters.isActive);
        }
        
        const paginatedData = filteredData.slice(startIndex, endIndex);
        
        return {
        medications: paginatedData,
        totalPages: Math.ceil(filteredData.length / pageSize) || 1,
        totalCount: filteredData.length || 0,
        currentPage: page
        };
    }
    },

  // POST - Create a new medication
  async createMedication(medicationData) {
    try {
      console.log('Creating medication:', medicationData);
      
      const response = await fetch(`${API_BASE_URL}/medications/inventory`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(medicationData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to create medication:', response.status, errorText);
        throw new Error(`Failed to create medication: ${response.status} - ${errorText}`);
      }
      
      const createdMedication = await response.json();
      console.log('Medication created successfully:', createdMedication);
      
      // Clear medications cache since we have new data
      clearCache(); // Fixed: Use the function directly instead of this.clearCache()
      
      return createdMedication;
    } catch (error) {
      console.error('Error creating medication:', error);
      throw error;
    }
  },

  // GET a single medication by ID
  async getMedicationById(medicationId) {
    try {
      const response = await fetch(`${API_BASE_URL}/medications/inventory/${medicationId}`, {
        headers: getAuthHeader()
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch medication: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching medication ${medicationId}:`, error);
      throw error;
    }
  },

  // PUT - Update an existing medication
  async updateMedication(medicationId, medicationData) {
    try {
      console.log(`Updating medication ${medicationId}:`, medicationData);
      
      const response = await fetch(`${API_BASE_URL}/medications/inventory/${medicationId}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(medicationData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to update medication:', response.status, errorText);
        throw new Error(`Failed to update medication: ${response.status} - ${errorText}`);
      }
      
      const updatedMedication = await response.json();
      console.log('Medication updated successfully:', updatedMedication);
      
      // Clear medications cache since we have updated data
      clearCache(); // Fixed: Use the function directly
      
      return updatedMedication;
    } catch (error) {
      console.error(`Error updating medication ${medicationId}:`, error);
      throw error;
    }
  },

  // DELETE - Remove a medication
  async deleteMedication(medicationId) {
    try {
      console.log(`Deleting medication ${medicationId}`);
      
      const response = await fetch(`${API_BASE_URL}/medications/inventory/${medicationId}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to delete medication:', response.status, errorText);
        throw new Error(`Failed to delete medication: ${response.status} - ${errorText}`);
      }
      
      console.log(`Medication ${medicationId} deleted successfully`);
      
      // Clear medications cache since we have removed data
      clearCache(); // Fixed: Use the function directly
      
      return true;
    } catch (error) {
      console.error(`Error deleting medication ${medicationId}:`, error);
      throw error;
    }
  },

  // POST - Restock a medication
  async restockMedication(medicationId, restockData) {
    try {
      console.log(`Restocking medication ${medicationId}:`, restockData);
      
      const response = await fetch(`${API_BASE_URL}/medications/inventory/${medicationId}/restock`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(restockData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to restock medication:', response.status, errorText);
        throw new Error(`Failed to restock medication: ${response.status} - ${errorText}`);
      }
      
      const restockedMedication = await response.json();
      console.log('Medication restocked successfully:', restockedMedication);
      
      // Clear medications cache since we have updated data
      clearCache(); // Fixed: Use the function directly
      
      return restockedMedication;
    } catch (error) {
      console.error(`Error restocking medication ${medicationId}:`, error);
      throw error;
    }
  },

  // POST - Dispense medication (reduce stock)
  // In medicationService.js - already exists but ensure it's correct
async dispenseMedication(medicationId, quantity) {
    try {
        console.log(`Dispensing ${quantity} units of medication ${medicationId}`);
        
        // First get current medication
        const med = await this.getMedicationById(medicationId);
        
        // Check if enough stock
        if (med.currentStock < quantity) {
        throw new Error(`Insufficient stock. Available: ${med.currentStock}, Requested: ${quantity}`);
        }
        
        // Update stock
        const updatedStock = med.currentStock - quantity;
        
        const response = await fetch(`${API_BASE_URL}/medications/inventory/${medicationId}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify({
            ...med,
            currentStock: updatedStock
        })
        });
        
        if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to dispense medication:', response.status, errorText);
        throw new Error(`Failed to dispense medication: ${response.status} - ${errorText}`);
        }
        
        const updatedMedication = await response.json();
        console.log('Medication dispensed successfully:', updatedMedication);
        
        // Clear medications cache
        clearCache();
        
        return updatedMedication;
    } catch (error) {
        console.error(`Error dispensing medication ${medicationId}:`, error);
        throw error;
    }
    },

  // GET medication categories
  async getCategories() {
    try {
      const response = await fetch(`${API_BASE_URL}/medication-inventory/categories`, {
        headers: getAuthHeader()
      });
      
      if (response.ok) {
        return await response.json();
      }
      // If endpoint doesn't exist, return default categories
      return [
        "Analgesic (Pain Relief)",
        "Antibiotic",
        "Antihistamine (Allergy)",
        "Antipyretic (Fever)",
        "Anti-inflammatory",
        "Bronchodilator (Asthma)",
        "Antacid (Stomach)",
        "Antiseptic",
        "Vaccine",
        "Other"
      ];
      
    } catch (error) {
      console.warn('Categories endpoint not available, returning default');
      return [
        "Analgesic (Pain Relief)",
        "Antibiotic",
        "Antihistamine (Allergy)",
        "Antipyretic (Fever)",
        "Anti-inflammatory",
        "Bronchodilator (Asthma)",
        "Antacid (Stomach)",
        "Antiseptic",
        "Vaccine",
        "Other"
      ];
    }
  },

  // GET suppliers
  async getSuppliers() {
    try {
      const response = await fetch(`${API_BASE_URL}/medication-inventory/suppliers`, {
        headers: getAuthHeader()
      });
      
      if (response.ok) {
        return await response.json();
      }
      // If endpoint doesn't exist, return default suppliers
      return ["PharmaCo", "MedSupply", "HealthCorp", "Generic Suppliers", "GSK", "Pfizer"];
      
    } catch (error) {
      console.warn('Suppliers endpoint not available, returning default');
      return ["PharmaCo", "MedSupply", "HealthCorp", "Generic Suppliers", "GSK", "Pfizer"];
    }
  },

  // Utility methods exposed for components
  clearCache: clearCache, // Expose the function
  calculateStatistics: calculateStatistics, // Expose the function

  getCacheStatus() {
    return {
      medicationsCached: !!medicationsCache,
      cacheAge: lastFetchTime ? Date.now() - lastFetchTime : null
    };
  }
};

// Mock data for development
export const mockMedicationData = {
  medications: [
    { 
      id: 1, 
      medicationName: "Paracetamol 500mg", 
      genericName: "Acetaminophen",
      currentStock: 45,
      minimumStock: 5,
      dosageForm: "Tablets",
      strength: "500mg",
      expiryDate: "2024-06-15", 
      supplier: "Generic Pharma",
      isActive: true,
      category: "Analgesic (Pain Relief)"
    },
    { 
      id: 2, 
      medicationName: "Amoxicillin 250mg", 
      genericName: "Amoxicillin",
      currentStock: 8,
      minimumStock: 5,
      dosageForm: "Capsules",
      strength: "250mg",
      expiryDate: "2024-03-20", 
      supplier: "MedSupply",
      isActive: true,
      category: "Antibiotic"
    },
    { 
      id: 3, 
      medicationName: "Ibuprofen 400mg", 
      genericName: "Ibuprofen",
      currentStock: 23,
      minimumStock: 5,
      dosageForm: "Tablets",
      strength: "400mg",
      expiryDate: "2024-08-10", 
      supplier: "Generic Pharma",
      isActive: true,
      category: "Anti-inflammatory"
    },
    { 
      id: 4, 
      medicationName: "Ventolin Inhaler", 
      genericName: "Salbutamol",
      currentStock: 5,
      minimumStock: 5,
      dosageForm: "Inhaler",
      strength: "100mcg",
      expiryDate: "2024-02-28", 
      supplier: "GSK",
      isActive: true,
      category: "Bronchodilator (Asthma)"
    },
    { 
      id: 5, 
      medicationName: "Cetirizine 10mg", 
      genericName: "Cetirizine",
      currentStock: 34,
      minimumStock: 5,
      dosageForm: "Tablets",
      strength: "10mg",
      expiryDate: "2024-11-15", 
      supplier: "HealthCorp",
      isActive: true,
      category: "Antihistamine (Allergy)"
    }
  ],
  categories: [
    "Analgesic (Pain Relief)",
    "Antibiotic",
    "Antihistamine (Allergy)",
    "Antipyretic (Fever)",
    "Anti-inflammatory",
    "Bronchodilator (Asthma)",
    "Antacid (Stomach)",
    "Antiseptic",
    "Vaccine",
    "Other"
  ],
  suppliers: ["PharmaCo", "MedSupply", "HealthCorp", "Generic Suppliers", "GSK", "Pfizer"]
};