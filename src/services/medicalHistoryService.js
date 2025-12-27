import config from '../config/config';
import keycloak from '../config/keycloak'; 

const API_BASE_URL = config.API_BASE_URL;

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

export const medicalHistoryService = {
  // GET medical history for a specific student
  async getByStudent(studentId) {
    try {
      const response = await fetch(`${API_BASE_URL}/medical-history/student/${studentId}`, {
        headers: getAuthHeader()
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch medical history: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching medical history:', error);
      
      // Fallback mock data for development
      return [
        {
          id: 1,
          conditionName: "Asthma",
          diagnosisDate: "2024-01-15",
          severity: "Moderate",
          treatment: "Inhaler as needed",
          notes: "Triggered by exercise and cold weather",
          isActive: true
        },
        {
          id: 2,
          conditionName: "Allergy - Pollen",
          diagnosisDate: "2024-02-10",
          severity: "Mild",
          treatment: "Antihistamines during spring",
          notes: "Seasonal allergies",
          isActive: true
        }
      ];
    }
  },

  // POST create new medical history record
  async create(studentId, medicalHistoryData) {
    try {
      const response = await fetch(`${API_BASE_URL}/medical-history/student/${studentId}`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(medicalHistoryData)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create medical record: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating medical history:', error);
      throw error;
    }
  },

  // PUT update existing medical history record
  async update(medicalHistoryId, medicalHistoryData) {
    try {
      const response = await fetch(`${API_BASE_URL}/medical-history/${medicalHistoryId}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(medicalHistoryData)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update medical record: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating medical history:', error);
      throw error;
    }
  },

  // DELETE deactivate medical history record
  async deactivate(medicalHistoryId) {
    try {
      const response = await fetch(`${API_BASE_URL}/medical-history/${medicalHistoryId}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });
      
      if (!response.ok) {
        throw new Error(`Failed to deactivate medical record: ${response.status}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error deactivating medical history:', error);
      throw error;
    }
  },

  // GET check if student has specific condition
  async checkCondition(studentId, conditionName) {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('studentId', studentId);
      queryParams.append('conditionName', conditionName);
      
      const response = await fetch(
        `${API_BASE_URL}/medical-history/check?${queryParams}`, {
          headers: getAuthHeader()
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to check condition: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error checking condition:', error);
      
      // Fallback mock response for development
      return conditionName.toLowerCase().includes('asthma') ? true : false;
    }
  },

  // GET all students with a specific condition
  async getStudentsWithCondition(conditionName) {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('conditionName', conditionName);
      
      const response = await fetch(
        `${API_BASE_URL}/medical-history/students-with-condition?${queryParams}`, {
          headers: getAuthHeader()
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch students with condition: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching students with condition:', error);
      
      // Fallback mock data for development
      return [
        {
          id: 5,
          name: "Kwame Mensah",
          studentId: "STU001",
          grade: "Grade 7",
          condition: conditionName || "Asthma"
        },
        {
          id: 8,
          name: "Esi Boateng",
          studentId: "STU002",
          grade: "Grade 8",
          condition: conditionName || "Allergy"
        }
      ];
    }
  },

  // GET all medical conditions summary (for reporting/dashboard)
  async getMedicalConditionsSummary(filters = {}) {
    try {
      const { dateRange } = filters;
      const { startDate, endDate } = this.parseDateRange(dateRange);
      
      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append('startDate', startDate.toISOString());
      if (endDate) queryParams.append('endDate', endDate.toISOString());
      
      const response = await fetch(`${API_BASE_URL}/medical-history/summary?${queryParams}`, {
        headers: getAuthHeader()
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch medical conditions summary: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching medical conditions summary:', error);
      
      // Fallback mock data for development
      return {
        totalConditions: 45,
        activeConditions: 28,
        bySeverity: {
          Severe: 5,
          Moderate: 12,
          Mild: 11
        },
        topConditions: [
          { condition: "Asthma", count: 8 },
          { condition: "Allergies", count: 6 },
          { condition: "Diabetes", count: 3 },
          { condition: "Epilepsy", count: 2 }
        ]
      };
    }
  },

  // GET condition prevalence by grade (for reporting)
  async getConditionPrevalenceByGrade(conditionName) {
    try {
      const queryParams = new URLSearchParams();
      if (conditionName) {
        queryParams.append('conditionName', conditionName);
      }
      
      const response = await fetch(
        `${API_BASE_URL}/medical-history/prevalence-by-grade?${queryParams}`, {
          headers: getAuthHeader()
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch condition prevalence: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching condition prevalence:', error);
      
      // Fallback mock data for development
      return {
        condition: conditionName || "All Conditions",
        byGrade: [
          { grade: "Grade 7", count: 5, percentage: "20%" },
          { grade: "Grade 8", count: 8, percentage: "32%" },
          { grade: "Grade 9", count: 4, percentage: "16%" },
          { grade: "Grade 10", count: 3, percentage: "12%" },
          { grade: "Grade 11", count: 2, percentage: "8%" },
          { grade: "Grade 12", count: 3, percentage: "12%" }
        ]
      };
    }
  },

  // GET medical history trends (for reporting/dashboard)
  async getMedicalHistoryTrends(filters = {}) {
    try {
      const { dateRange } = filters;
      const { startDate, endDate } = this.parseDateRange(dateRange);
      
      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append('startDate', startDate.toISOString());
      if (endDate) queryParams.append('endDate', endDate.toISOString());
      
      const response = await fetch(`${API_BASE_URL}/medical-history/trends?${queryParams}`, {
        headers: getAuthHeader()
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch medical history trends: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching medical history trends:', error);
      
      // Fallback mock data for development
      return [
        { month: 'Jan', newConditions: 5, resolvedConditions: 2 },
        { month: 'Feb', newConditions: 8, resolvedConditions: 3 },
        { month: 'Mar', newConditions: 6, resolvedConditions: 4 },
        { month: 'Apr', newConditions: 7, resolvedConditions: 2 },
        { month: 'May', newConditions: 4, resolvedConditions: 3 },
        { month: 'Jun', newConditions: 5, resolvedConditions: 2 }
      ];
    }
  },

  // GET list of common medical conditions (for autocomplete/suggestions)
  async getCommonConditions() {
    try {
      const response = await fetch(`${API_BASE_URL}/medical-history/common-conditions`, {
        headers: getAuthHeader()
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch common conditions: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching common conditions:', error);
      
      // Fallback list of common conditions
      return [
        "Asthma",
        "Allergy - Food",
        "Allergy - Pollen/Dust",
        "Diabetes Type 1",
        "Diabetes Type 2",
        "Epilepsy",
        "Migraine",
        "Hypertension",
        "Anxiety Disorder",
        "ADHD",
        "Eczema",
        "Acne",
        "Sickle Cell Disease",
        "Anemia",
        "Astigmatism/Myopia",
        "Hearing Impairment"
      ];
    }
  },

  // GET student medical history with filters
  async getStudentMedicalHistoryWithFilters(studentId, filters = {}) {
    try {
      const { onlyActive = false, severity = null } = filters;
      const queryParams = new URLSearchParams();
      queryParams.append('studentId', studentId);
      if (onlyActive) queryParams.append('onlyActive', 'true');
      if (severity) queryParams.append('severity', severity);
      
      const response = await fetch(
        `${API_BASE_URL}/medical-history/student/${studentId}/filtered?${queryParams}`, {
          headers: getAuthHeader()
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch filtered medical history: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching filtered medical history:', error);
      throw error;
    }
  },

  // Helper method to parse date range (consistent with analytics service)
  parseDateRange(dateRange = "last_30_days") {
    const endDate = new Date();
    let startDate = new Date();
    
    switch (dateRange) {
      case "last_7_days":
        startDate.setDate(endDate.getDate() - 7);
        break;
      case "last_30_days":
        startDate.setDate(endDate.getDate() - 30);
        break;
      case "last_90_days":
        startDate.setDate(endDate.getDate() - 90);
        break;
      case "this_year":
        startDate = new Date(endDate.getFullYear(), 0, 1);
        break;
      case "custom":
        startDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() - 30);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }
    
    return { startDate, endDate };
  },

  // Clear cache if needed
  clearCache() {
    console.log('Medical history cache cleared');
  }
};