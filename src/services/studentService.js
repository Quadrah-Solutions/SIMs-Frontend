import config from '../config/config';
import keycloak from '../config/keycloak'; 

const API_BASE_URL = config.API_BASE_URL;

// Add this helper function to your studentService if it's missing
let gradesCache = null;
let classesCache = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Mock data for development (fallback when API is not available)
export const mockStudentData = {
  students: [
    { 
      id: 1, 
      name: "Ama Mensah", 
      studentId: "STU001", 
      grade: "Grade 7", 
      className: "7A", 
      allergies: "Peanuts, Dust",
      boardingStatus: "BOARDING"
    },
    { 
      id: 2, 
      name: "Janice Esi", 
      studentId: "STU002", 
      grade: "Grade 8", 
      className: "8B", 
      allergies: "None",
      boardingStatus: "DAY"
    },
    { 
      id: 3, 
      name: "Esi Boateng", 
      studentId: "STU003", 
      grade: "Grade 7", 
      className: "7C", 
      allergies: "Lactose",
      boardingStatus: "BOARDING"
    },
    { 
      id: 4, 
      name: "Yaw Appiah", 
      studentId: "STU004", 
      grade: "Grade 9", 
      className: "9A", 
      allergies: "Penicillin",
      boardingStatus: "DAY"
    },
    { 
      id: 5, 
      name: "Akua Ofori", 
      studentId: "STU005", 
      grade: "Grade 8", 
      className: "8A", 
      allergies: "Shellfish",
      boardingStatus: "BOARDING"
    }
  ],
  grades: ["Form 1", "Form 2", "Form 3"],
  classes: ["1GS2", "1HE1", "1GS5", "1GS4", "1GA1", "1BS2", "1GS9", "1GA3", "1GA4", "1HE5", "1GA9", "1GS3", "1GA8", "1G S8", "1HE4", "1GS1", "1GA7", "1GA2", "1GA6", "1GA5", "1AS1", "1PA1", "1HE2", "1HE3", "1GS8", "1GA10", "1GA11", "1BS1", "1BS3", "2GA1", "2HE3", "2HE2", "2GA9", "2GA10", "2GS1", "2GS2", "2GS10", "2BS1", "2GA7", "2GA5", "2GS7", "2GS3", "2GS9", "2GA4", "2PA1", "2HE5", "2AS2", "2GS6", "2GS5", "2BS3", "2HE1", "2GS4", "2GA6", "2BS2", "2GA8", "2HE4", "2PA2", "2GS8", "2GA3", "2GA2", "2GS11", "3S5", "3S13", "3S7", "3H3", "3S1", "3S2", "3S11", "3B1", "3S9", "3H2", "3H5", "3S4", "3H4", "3H1", "3S15", "3A1", "3A2", "3S14", "3H6", "3S8", "3A4", "3B2", "3V1", "3A6", "3S12", "3A3", "3S10", "3S6", "3A5", "3A8", "3A7", "3B3"]
};

// Helper function to get the authorization header - FIXED VERSION
const getAuthHeader = async () => {
  const headers = {
    'Content-Type': 'application/json'
  };
  
  try {
    // Ensure keycloak is initialized
    if (keycloak && keycloak.authenticated) {
      // Check if token needs refresh (30 seconds before expiry)
      const refreshed = await keycloak.updateToken(30);
      
      if (refreshed) {
        console.log('[KEYCLOAK] Token was refreshed');
      }
      
      if (keycloak.token) {
        headers['Authorization'] = `Bearer ${keycloak.token}`;
        console.log('[KEYCLOAK] Token attached to request');
      }
    } else {
      console.warn('[KEYCLOAK] Not authenticated or keycloak not initialized');
    }
  } catch (error) {
    console.error('[KEYCLOAK] Error updating token:', error);
    // Don't force login here, let the calling function handle it
  }
  
  return headers;
};

// Helper function for retry logic with token refresh
const fetchWithAuthRetry = async (url, options = {}, retryCount = 1) => {
  const maxRetries = 2;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Get fresh auth headers for each attempt
      const authHeaders = await getAuthHeader();
      const finalOptions = {
        ...options,
        headers: {
          ...authHeaders,
          ...options.headers
        }
      };

      // If body is FormData, remove Content-Type header
            if (options.body instanceof FormData) {
                delete finalOptions.headers['Content-Type'];
            }
      
      console.log(`[API] Attempt ${attempt + 1} fetching: ${url}`);
      const response = await fetch(url, finalOptions);
      
      if (response.status === 401 && attempt < maxRetries) {
        console.log('[API] 401 received, forcing token refresh...');
        
        // Force token refresh
        try {
          const refreshed = await keycloak.updateToken(-1); // Force immediate refresh
          if (refreshed) {
            console.log('[KEYCLOAK] Token refreshed, retrying...');
            continue; // Retry with new token
          } else {
            // Token refresh failed, need to login
            console.log('[KEYCLOAK] Token refresh failed, redirecting to login');
            keycloak.login();
            break;
          }
        } catch (refreshError) {
          console.error('[KEYCLOAK] Error refreshing token:', refreshError);
          keycloak.login();
          break;
        }
      }
      
      return response;
      
    } catch (error) {
      console.error(`[API] Attempt ${attempt + 1} failed:`, error);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
  
  throw new Error(`Failed after ${retryCount} retries`);
};

// Cache function with auth support
const fetchWithCache = async (endpoint, forceRefresh = false) => {
  const cacheKey = endpoint.includes('grades') ? 'grades' : 'classes';
  const cache = cacheKey === 'grades' ? gradesCache : classesCache;
  
  // Return cached data if not forcing refresh and cache is valid
  if (!forceRefresh && cache && (Date.now() - lastFetchTime < CACHE_DURATION)) {
    console.log(`[CACHE] Using cached ${cacheKey} data`);
    return cache;
  }
  
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`[API] Fetching ${cacheKey} from: ${url}`);
    
    const response = await fetchWithAuthRetry(url, {
      method: 'GET'
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch ${cacheKey}: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    
    // Update cache
    if (cacheKey === 'grades') {
      gradesCache = data;
    } else {
      classesCache = data;
    }
    lastFetchTime = Date.now();
    
    console.log(`[CACHE] ${cacheKey} data cached`);
    return data;
    
  } catch (error) {
    console.error(`[API] Error fetching ${cacheKey}:`, error);
    
    // Return cached data as fallback if available
    if (cache) {
      console.log(`[CACHE] Using cached ${cacheKey} data due to API error`);
      return cache;
    }
    
    // Return mock data if no cache
    console.log(`[MOCK] Using mock ${cacheKey} data`);
    return cacheKey === 'grades' 
      ? mockStudentData.grades 
      : mockStudentData.classes;
  }
};

// Mock students function - FIXED: Added to studentService object
const getMockStudents = (page = 1, pageSize = 10, filters = {}) => {
  console.log('[MOCK] Using mock student data');
  
  let filteredStudents = [...mockStudentData.students];
  
  // Apply filters to mock data
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filteredStudents = filteredStudents.filter(student =>
      student.name.toLowerCase().includes(searchLower) ||
      student.studentId.toLowerCase().includes(searchLower)
    );
  }
  
  if (filters.grade) {
    filteredStudents = filteredStudents.filter(student => 
      student.grade === filters.grade
    );
  }
  
  if (filters.class) {
    filteredStudents = filteredStudents.filter(student => 
      student.className === filters.class
    );
  }
  
  // Calculate pagination
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedStudents = filteredStudents.slice(startIndex, endIndex);
  
  return {
    students: paginatedStudents,
    totalPages: Math.ceil(filteredStudents.length / pageSize),
    totalCount: filteredStudents.length,
    currentPage: page
  };
};

export const studentService = {
  async getStudents(page = 1, pageSize = 10, filters = {}) {
    try {
      const queryParams = new URLSearchParams({
        page: (page - 1).toString(),
        size: pageSize.toString(),
      });

      if (filters.search) queryParams.append('search', filters.search);
      if (filters.grade) queryParams.append('grade', filters.grade);
      if (filters.class) queryParams.append('className', filters.class);

      const url = `${API_BASE_URL}/students?${queryParams}`;
      console.log('[API] Fetching students from:', url);
      
      const response = await fetchWithAuthRetry(url, {
        method: 'GET'
      });
      
      console.log('[API] Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch students: ${response.status} - ${errorText}`);
      }
      
      return await this.processStudentResponse(response);
      
    } catch (error) {
      console.error('[API] Error fetching students, falling back to mock data:', error);
      return getMockStudents(page, pageSize, filters);
    }
  },

  async processStudentResponse(response) {
    const pageData = await response.json();
    
    const transformedData = pageData.content?.map(student => ({
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      name: student.fullName || `${student.firstName} ${student.lastName}`,
      studentId: student.studentId,
      grade: student.gradeLevel || 'N/A',
      className: student.homeroom || 'N/A',
      allergies: student.allergies || 'None',
      dateOfBirth: student.dateOfBirth,
      gender: student.gender,
      boardingStatus: student.boardingStatus || 'DAY'
    })) || [];
    
    return {
      students: transformedData,
      totalPages: pageData.totalPages || 1,
      totalCount: pageData.totalElements || 0,
      currentPage: (pageData.number || 0) + 1
    };
  },

  async getClasses(forceRefresh = false) {
    try {
      const classRooms = await fetchWithCache('/classes/all', forceRefresh);
      
      // Handle different response formats
      if (!Array.isArray(classRooms)) {
        console.warn('[API] Classes response is not an array:', classRooms);
        return mockStudentData.classes;
      }
      
      // Extract just the class names from the objects
      return classRooms.map(classRoom => {
        if (typeof classRoom === 'string') return classRoom;
        if (classRoom && typeof classRoom === 'object') {
          return classRoom.className || classRoom.name || classRoom.class || 'Unknown';
        }
        return 'Unknown';
      }).filter(Boolean); // Remove any null/undefined values
      
    } catch (error) {
      console.error('[API] Error fetching classes, using mock data:', error);
      return mockStudentData.classes;
    }
  },

  async getGrades(forceRefresh = false) {
    try {
      const grades = await fetchWithCache('/grades/all', forceRefresh);
      
      // Handle different response formats
      if (!Array.isArray(grades)) {
        console.warn('[API] Grades response is not an array:', grades);
        return mockStudentData.grades;
      }
      
      // Extract just the grade names from the objects
      return grades.map(grade => {
        if (typeof grade === 'string') return grade;
        if (grade && typeof grade === 'object') {
          return grade.gradeName || grade.name || grade.grade || 'Unknown';
        }
        return 'Unknown';
      }).filter(Boolean); // Remove any null/undefined values
      
    } catch (error) {
      console.error('[API] Error fetching grades, using mock data:', error);
      return mockStudentData.grades;
    }
  },

  async getGradesAndClasses(forceRefresh = false) {
    try {
      const [grades, classes] = await Promise.all([
        this.getGrades(forceRefresh),
        this.getClasses(forceRefresh)
      ]);
      
      return { 
        grades: grades || mockStudentData.grades,
        classes: classes || mockStudentData.classes 
      };
    } catch (error) {
      console.error('[API] Error fetching grades and classes:', error);
      // Return mock data instead of throwing
      return {
        grades: mockStudentData.grades,
        classes: mockStudentData.classes
      };
    }
  },

  async bulkUploadStudents(formData) {
    try {
        const url = `${API_BASE_URL}/students/bulk-upload`;
        console.log('[API] Bulk upload to:', url);
        
        // Get fresh auth headers
        const authHeaders = await getAuthHeader();
        
        // IMPORTANT: Remove Content-Type header entirely
        // The browser will set it automatically with the boundary
        delete authHeaders['Content-Type'];
        
        const response = await fetchWithAuthRetry(url, {
            method: 'POST',
            headers: authHeaders, // Don't add any other headers
            body: formData, // FormData should be sent as-is
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Bulk upload failed: ${response.status} - ${errorText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('[API] Error in bulk upload:', error);
        throw error;
    }
},

  async createStudent(studentData) {
    try {
      const url = `${API_BASE_URL}/students`;
      console.log('[API] Creating student:', url);
      
      const response = await fetchWithAuthRetry(url, {
        method: 'POST',
        headers: await getAuthHeader(),
        body: JSON.stringify(studentData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create student: ${response.status} - ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('[API] Error creating student:', error);
      throw error;
    }
  },

  // Add other CRUD methods as needed
  async updateStudent(id, studentData) {
    try {
      const url = `${API_BASE_URL}/students/${id}`;
      console.log('[API] Updating student:', url);
      
      const response = await fetchWithAuthRetry(url, {
        method: 'PUT',
        headers: await getAuthHeader(),
        body: JSON.stringify(studentData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update student: ${response.status} - ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('[API] Error updating student:', error);
      throw error;
    }
  },

  async deleteStudent(id) {
    try {
      const url = `${API_BASE_URL}/students/${id}`;
      console.log('[API] Deleting student:', url);
      
      const response = await fetchWithAuthRetry(url, {
        method: 'DELETE',
        headers: await getAuthHeader()
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete student: ${response.status} - ${errorText}`);
      }
      
      return true;
    } catch (error) {
      console.error('[API] Error deleting student:', error);
      throw error;
    }
  },

  // Mock function made available
  getMockStudents,

  // Utility methods
  clearCache() {
    gradesCache = null;
    classesCache = null;
    lastFetchTime = 0;
    console.log('[CACHE] Cache cleared');
  },

  getCacheStatus() {
    return {
      gradesCached: !!gradesCache,
      classesCached: !!classesCache,
      cacheAge: lastFetchTime ? Date.now() - lastFetchTime : null
    };
  }
};

// For backward compatibility
export default studentService;