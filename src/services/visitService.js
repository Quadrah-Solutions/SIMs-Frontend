import config from '../config/config';
import keycloak from '../config/keycloak'; 

const API_BASE_URL = config.API_BASE_URL;

// Cache for visits, grades, and classes
let visitsCache = null;
let gradesCache = null;
let classesCache = null;
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
  
  // Determine cache key based on endpoint
  let cacheKey, cacheVar;
  if (endpoint.includes('visits')) {
    cacheKey = 'visits';
    cacheVar = visitsCache;
  } else if (endpoint.includes('grades')) {
    cacheKey = 'grades';
    cacheVar = gradesCache;
  } else if (endpoint.includes('classes')) {
    cacheKey = 'classes';
    cacheVar = classesCache;
  } else {
    cacheKey = 'other';
  }

  // Check cache first (unless force refresh)
  if (!forceRefresh && cacheVar && (now - lastFetchTime) < CACHE_DURATION) {
    console.log(`Using cached ${cacheKey} data`);
    return cacheVar;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: getAuthHeader()
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ${cacheKey}: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Update cache
    if (cacheKey === 'visits') {
      visitsCache = data;
    } else if (cacheKey === 'grades') {
      gradesCache = data;
    } else if (cacheKey === 'classes') {
      classesCache = data;
    }
    lastFetchTime = now;
    
    return data;
  } catch (error) {
    console.error(`Error fetching ${cacheKey}:`, error);
    
    // Return fallback data
    if (cacheKey === 'grades') {
      return ["Form 1", "Form 2", "Form 3"];
    } else if (cacheKey === 'classes') {
      return ["1GS2", "1HE1", "1GS5", "1GS4", "1GA1", "1BS2", "1GS9", "1GA3", "1GA4", "1HE5", "1GA9", "1GS3", "1GA8", "1G S8", "1HE4", "1GS1", "1GA7", "1GA2", "1GA6", "1GA5", "1AS1", "1PA1", "1HE2", "1HE3", "1GS8", "1GA10", "1GA11", "1BS1", "1BS3", "2GA1", "2HE3", "2HE2", "2GA9", "2GA10", "2GS1", "2GS2", "2GS10", "2BS1", "2GA7", "2GA5", "2GS7", "2GS3", "2GS9", "2GA4", "2PA1", "2HE5", "2AS2", "2GS6", "2GS5", "2BS3", "2HE1", "2GS4", "2GA6", "2BS2", "2GA8", "2HE4", "2PA2", "2GS8", "2GA3", "2GA2", "2GS11", "3S5", "3S13", "3S7", "3H3", "3S1", "3S2", "3S11", "3B1", "3S9", "3H2", "3H5", "3S4", "3H4", "3H1", "3S15", "3A1", "3A2", "3S14", "3H6", "3S8", "3A4", "3B2", "3V1", "3A6", "3S12", "3A3", "3S10", "3S6", "3A5", "3A8", "3A7", "3B3"];
    }
    throw error; // Re-throw for visits
  }
};


export const visitService = {
  // GET visits with pagination and filters
  async getVisits(page = 1, pageSize = 10, filters = {}) {
  try {
    console.log('📞 Fetching visits from API with filters...');
    console.log('Filters being sent:', filters);
    
    // Build query params for the new backend API
    const queryParams = new URLSearchParams({
      page: (page - 1).toString(), // FIX: Spring Boot uses 0-based indexing
      size: pageSize.toString(),    // Note: parameter name is 'size' not 'pageSize'
    });

    // Add filters if they exist
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.grade) queryParams.append('grade', filters.grade);
    if (filters.className) queryParams.append('className', filters.className);
    if (filters.condition) queryParams.append('condition', filters.condition);
    if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);
    
    // Map frontend condition to backend emergencyFlag if needed
    if (filters.condition === 'Critical') {
      queryParams.append('emergencyFlag', 'true');
    }

    const url = `${API_BASE_URL}/visits?${queryParams}`;
    console.log('Full URL:', url);
    
    const response = await fetch(url, {
      headers: getAuthHeader()
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    const pageData = await response.json();
    console.log('📊 API Response:', pageData);
    
    // Check if content exists
    if (!pageData.content || pageData.content.length === 0) {
      console.log('⚠️ No content in response, but totalElements:', pageData.totalElements);
    }
    
    // Transform the data
    const transformedVisits = pageData.content?.map(visit => ({
      id: visit.id,
      date: visit.visitDate || visit.date,
      student: visit.studentName || visit.student || "Unknown Student",
      studentId: visit.studentId,
      grade: visit.grade || "N/A", 
      className: visit.className || "N/A", 
      reason: visit.reason || "No reason provided",
      outcome: this.formatDisposition(visit.disposition) || "Unknown",
      nurse: visit.nurseName || visit.nurse || "Unknown Nurse",
      condition: this.determineCondition(visit),
      disposition: visit.disposition,
      emergencyFlag: visit.emergencyFlag || false,
      // Preserve medications and treatments as-is from the response
      medications: visit.medications ? [...visit.medications] : [],
      treatments: visit.treatments ? [...visit.treatments] : [],
      original: visit
    })) || [];
    
    console.log('✨ Transformed visits:', transformedVisits.length, 'items');
    
    return {
      visits: transformedVisits,
      totalPages: pageData.totalPages || 1,
      totalCount: pageData.totalElements || 0,
      currentPage: pageData.number + 1 || page // Convert back to 1-based indexing
    };
    
  } catch (apiError) {
    console.warn('⚠️ API call failed:', apiError.message);
    // Return empty data structure
    return {
      visits: [],
      totalPages: 1,
      totalCount: 0,
      currentPage: page
    };
  }
},

  // POST - Create a new visit
  async createVisit(visitData) {
    try {
      console.log('Creating visit with medications:', visitData);
      
      // First, update medication inventory for each medication used
      if (visitData.medications && visitData.medications.length > 0) {
        for (const med of visitData.medications) {
          try {
            // Deduct 1 unit from inventory for each medication administered
            await medicationService.dispenseMedication(med.medication.id, 1);
            console.log(`Deducted 1 unit from medication ${med.medication.id}`);
          } catch (dispenseError) {
            console.warn(`Could not update inventory for medication ${med.medication.id}:`, dispenseError);
            // Continue with visit creation even if inventory update fails
          }
        }
      }
      
      // Then create the visit
      const response = await fetch(`${API_BASE_URL}/visits`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(visitData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to create visit:', response.status, errorText);
        throw new Error(`Failed to create visit: ${response.status} - ${errorText}`);
      }
      
      const createdVisit = await response.json();
      console.log('Visit created successfully:', createdVisit);
      
      // Clear visits cache since we have new data
      this.clearCache();
      
      return createdVisit;
    } catch (error) {
      console.error('Error creating visit:', error);
      throw error;
    }
  },

  // GET a single visit by ID
  async getVisitById(visitId) {
    try {
      const response = await fetch(`${API_BASE_URL}/visits/${visitId}`, {
        headers: getAuthHeader()
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch visit: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching visit ${visitId}:`, error);
      throw error;
    }
  },

  // PUT - Update an existing visit
  async updateVisit(visitId, visitData) {
    try {
      console.log(`Updating visit ${visitId}:`, visitData);
      
      const response = await fetch(`${API_BASE_URL}/visits/${visitId}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(visitData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to update visit:', response.status, errorText);
        throw new Error(`Failed to update visit: ${response.status} - ${errorText}`);
      }
      
      const updatedVisit = await response.json();
      console.log('Visit updated successfully:', updatedVisit);
      
      // Clear visits cache since we have updated data
      this.clearCache();
      
      return updatedVisit;
    } catch (error) {
      console.error(`Error updating visit ${visitId}:`, error);
      throw error;
    }
  },

  // DELETE - Remove a visit
  async deleteVisit(visitId) {
    try {
      console.log(`Deleting visit ${visitId}`);
      
      const response = await fetch(`${API_BASE_URL}/visits/${visitId}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to delete visit:', response.status, errorText);
        throw new Error(`Failed to delete visit: ${response.status} - ${errorText}`);
      }
      
      console.log(`Visit ${visitId} deleted successfully`);
      
      // Clear visits cache since we have removed data
      this.clearCache();
      
      return true;
    } catch (error) {
      console.error(`Error deleting visit ${visitId}:`, error);
      throw error;
    }
  },

  // GET grades
  async getGrades(forceRefresh = false) {
    return fetchWithCache('/grades', forceRefresh);
  },

  // GET classes
  async getClasses(forceRefresh = false) {
    return fetchWithCache('/classes', forceRefresh);
  },

  // GET grades and classes together
  async getGradesAndClasses(forceRefresh = false) {
    try {
      // Fetch both concurrently
      const [grades, classes] = await Promise.all([
        this.getGrades(forceRefresh),
        this.getClasses(forceRefresh)
      ]);
      
      return { grades, classes };
    } catch (error) {
      console.error('Error fetching grades and classes:', error);
      throw error;
    }
  },

  // GET student details
  async getStudentDetails(studentId) {
    try {
      const response = await fetch(`${API_BASE_URL}/students/${studentId}`, {
        headers: getAuthHeader()
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch student details: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching student details:', error);
      throw error;
    }
  },

  // GET conditions
  async getConditions() {
    try {
      const response = await fetch(`${API_BASE_URL}/conditions`, {
        headers: getAuthHeader()
      });
      
      if (response.ok) {
        return await response.json();
      }
      // If endpoint doesn't exist, return default conditions
      return ["All", "Mild", "Moderate", "Serious", "Stable", "Critical"];
      
    } catch (error) {
      console.warn('Conditions endpoint not available, returning default');
      return ["All", "Mild", "Moderate", "Serious", "Stable", "Critical"];
    }
  },

  // Helper methods
  formatDisposition(disposition) {
    const mapping = {
      'RETURNED_TO_CLASS': 'Returned to Class',
      'SENT_HOME': 'Sent Home',
      'UNDER_OBSERVATION': 'Under Observation',
      'REFERRED_TO_HOSPITAL': 'Referred to Hospital'
    };
    return mapping[disposition] || disposition;
  },

  determineCondition(visit) {
    if (visit.emergencyFlag) return 'Critical';
    if (visit.disposition === 'REFERRED_TO_HOSPITAL') return 'Serious';
    if (visit.disposition === 'SENT_HOME') return 'Moderate';
    if (visit.disposition === 'UNDER_OBSERVATION') return 'Stable';
    return 'Stable';
  },

  // Utility methods
  clearCache() {
    visitsCache = null;
    gradesCache = null;
    classesCache = null;
    lastFetchTime = 0;
    console.log('Visit cache cleared');
  },

  getCacheStatus() {
    return {
      visitsCached: !!visitsCache,
      gradesCached: !!gradesCache,
      classesCached: !!classesCache,
      cacheAge: lastFetchTime ? Date.now() - lastFetchTime : null
    };
  },

  // Helper to map UI outcome to backend disposition
  mapOutcomeToDisposition(outcome) {
    const mapping = {
      'Return to Class': 'RETURNED_TO_CLASS',
      'Sent Home': 'SENT_HOME',
      'Under Observation': 'UNDER_OBSERVATION',
      'Emergency Referral': 'REFERRED_TO_HOSPITAL'
    };
    return mapping[outcome] || outcome;
  },

  async getStudents() {
    try {
      const response = await fetch(`${API_BASE_URL}/students`, {
        headers: getAuthHeader()
      });
      
      console.log('Students response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch students: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Students API Response:', data);
      
      // Check if data is an array
      let studentsArray;
      if (Array.isArray(data)) {
        studentsArray = data;
      } else if (data.content && Array.isArray(data.content)) {
        // If it's a paginated response
        studentsArray = data.content;
      } else {
        console.warn('Unexpected students response format:', data);
        studentsArray = [];
      }
      
      // Transform the data to ensure consistent structure
      return studentsArray.map(student => ({
        id: student.id,
        studentId: student.studentId,
        firstName: student.firstName || '',
        lastName: student.lastName || '',
        fullName: `${student.firstName || ''} ${student.lastName || ''}`.trim(),
        gradeLevel: student.gradeLevel || student.grade?.name || 'N/A',
        homeroom: student.homeroom || 'N/A',
        dateOfBirth: student.dateOfBirth,
        gender: student.gender
      }));
      
    } catch (error) {
      console.error('Error fetching students:', error);
      // Return mock data for development
      return [
        { id: 1, studentId: "STU-2025-FWV0", firstName: "Bryan", lastName: "Danquah", fullName: "Bryan Danquah", gradeLevel: "Grade 9" },
        { id: 2, studentId: "STU-2025-ABC1", firstName: "John", lastName: "Doe", fullName: "John Doe", gradeLevel: "Grade 10" },
        { id: 3, studentId: "STU-2025-XYZ2", firstName: "Jane", lastName: "Smith", fullName: "Jane Smith", gradeLevel: "Grade 8" }
      ];
    }
  },
};

// Mock data for development (fallback when API is not available)
export const mockVisitData = {
  visits: [
    { 
      id: 1, 
      date: "2024-01-15T10:30:00", 
      student: "Ama Mensah", 
      studentId: "STU001",
      grade: "Grade 7",
      className: "7A",
      reason: "Headache", 
      outcome: "Medicated",
      nurse: "Nurse Akua",
      condition: "Stable"
    },
    { 
      id: 2, 
      date: "2024-01-15T11:15:00", 
      student: "Janice Esi", 
      studentId: "STU002",
      grade: "Grade 8",
      className: "8B",
      reason: "Fever", 
      outcome: "Sent Home",
      nurse: "Nurse Yaw",
      condition: "Moderate"
    },
    { 
      id: 3, 
      date: "2024-01-14T14:20:00", 
      student: "Esi Boateng", 
      studentId: "STU003",
      grade: "Grade 7",
      className: "7C",
      reason: "Allergy Reaction", 
      outcome: "Treated",
      nurse: "Nurse Akua",
      condition: "Stable"
    },
    { 
      id: 4, 
      date: "2024-01-14T09:45:00", 
      student: "Yaw Appiah", 
      studentId: "STU004",
      grade: "Grade 9",
      className: "9A",
      reason: "Sports Injury", 
      outcome: "Referred to Hospital",
      nurse: "Nurse Yaw",
      condition: "Serious"
    },
    { 
      id: 5, 
      date: "2024-01-13T16:10:00", 
      student: "Akua Ofori", 
      studentId: "STU005",
      grade: "Grade 8",
      className: "8A",
      reason: "Stomach Pain", 
      outcome: "Rest & Observation",
      nurse: "Nurse Akua",
      condition: "Mild"
    }
  ],
  grades: ["Form 1", "Form 2", "Form 3"],
  classes: ["1GS2", "1HE1", "1GS5", "1GS4", "1GA1", "1BS2", "1GS9", "1GA3", "1GA4", "1HE5", "1GA9", "1GS3", "1GA8", "1G S8", "1HE4", "1GS1", "1GA7", "1GA2", "1GA6", "1GA5", "1AS1", "1PA1", "1HE2", "1HE3", "1GS8", "1GA10", "1GA11", "1BS1", "1BS3", "2GA1", "2HE3", "2HE2", "2GA9", "2GA10", "2GS1", "2GS2", "2GS10", "2BS1", "2GA7", "2GA5", "2GS7", "2GS3", "2GS9", "2GA4", "2PA1", "2HE5", "2AS2", "2GS6", "2GS5", "2BS3", "2HE1", "2GS4", "2GA6", "2BS2", "2GA8", "2HE4", "2PA2", "2GS8", "2GA3", "2GA2", "2GS11", "3S5", "3S13", "3S7", "3H3", "3S1", "3S2", "3S11", "3B1", "3S9", "3H2", "3H5", "3S4", "3H4", "3H1", "3S15", "3A1", "3A2", "3S14", "3H6", "3S8", "3A4", "3B2", "3V1", "3A6", "3S12", "3A3", "3S10", "3S6", "3A5", "3A8", "3A7", "3B3"],
  conditions: ["All", "Mild", "Moderate", "Serious", "Stable", "Critical"]
};