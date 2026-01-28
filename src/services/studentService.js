import config from '../config/config';
import keycloak from '../config/keycloak'; 

const API_BASE_URL = config.API_BASE_URL;


// Add this helper function to your studentService if it's missing
let gradesCache = null;
let classesCache = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const fetchWithCache = async (endpoint, forceRefresh = false) => {
  const cacheKey = endpoint.includes('grades') ? 'grades' : 'classes';
  const cache = cacheKey === 'grades' ? gradesCache : classesCache;
  
  // Return cached data if not forcing refresh and cache is valid
  if (!forceRefresh && cache && (Date.now() - lastFetchTime < CACHE_DURATION)) {
    return cache;
  }
  
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`Fetching from: ${url}`);
    
    const response = await fetch(url, {
      headers: getAuthHeader()
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
    
    return data;
  } catch (error) {
    console.error(`Error fetching ${cacheKey}:`, error);
    
    // Return cached data as fallback if available
    if (cache) {
      console.log(`Using cached ${cacheKey} data due to API error`);
      return cache;
    }
    
    // Return mock data if no cache
    console.log(`Using mock ${cacheKey} data`);
    return cacheKey === 'grades' 
      ? mockStudentData.grades 
      : mockStudentData.classes;
  }
};

// Helper function to get the authorization header
const getAuthHeader = async () => {
  try {
    // Ensure keycloak is initialized and token is fresh
    if (keycloak) {
      // Check if token needs refresh
      const isTokenValid = await keycloak.updateToken(30); // 30 seconds before expiry
      
      if (isTokenValid) {
        console.log('Token is valid');
      } else {
        console.log('Token was refreshed');
      }
      
      if (keycloak.token) {
        return { 
          'Authorization': `Bearer ${keycloak.token}`,
          'Content-Type': 'application/json'
        };
      }
    }
  } catch (error) {
    console.error('Error updating token:', error);
    keycloak.login(); // Force re-login if token refresh fails
  }
  
  return { 'Content-Type': 'application/json' };
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
      console.log('Fetching students from:', url);
      
      // Get fresh headers
      const headers = await getAuthHeader();
      
      const response = await fetch(url, {
        headers: headers
      });
      
      console.log('Response status:', response.status);
      
      if (response.status === 401) {
        // Token might be expired, try to refresh
        console.log('401 received, attempting token refresh...');
        const refreshed = await keycloak.updateToken(-1); // Force refresh
        
        if (refreshed) {
          // Retry with new token
          const newHeaders = await getAuthHeader();
          const retryResponse = await fetch(url, {
            headers: newHeaders
          });
          
          if (!retryResponse.ok) {
            throw new Error(`Retry failed: ${retryResponse.status}`);
          }
          
          return await this.processStudentResponse(retryResponse);
        } else {
          keycloak.login(); // Force re-authentication
          return { students: [], totalPages: 0, totalCount: 0, currentPage: 1 };
        }
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch students: ${response.status} - ${errorText}`);
      }
      
      return await this.processStudentResponse(response);
      
    } catch (error) {
      console.error('Error fetching students:', error);
      return this.getMockStudents(page, pageSize, filters);
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
      currentPage: pageData.number + 1 || 1
    };
  },

  // Update your getGrades and getClasses methods to handle API failures better:
  async getClasses(forceRefresh = false) {
    try {
      const classRooms = await fetchWithCache('/classes/all', forceRefresh);
      // Extract just the class names from the objects
      return classRooms.map(classRoom => classRoom.className);
    } catch (error) {
      console.error('Error fetching classes, using mock data:', error);
      return mockStudentData.classes;
    }
  },

  async getGrades(forceRefresh = false) {
    try {
      const grades = await fetchWithCache('/grades/all', forceRefresh);
      // Extract just the grade names from the objects
      return grades.map(grade => grade.gradeName || grade.name || grade.grade);
    } catch (error) {
      console.error('Error fetching grades, using mock data:', error);
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
      console.error('Error fetching grades and classes:', error);
      // Return mock data instead of throwing
      return {
        grades: mockStudentData.grades,
        classes: mockStudentData.classes
      };
    }
  },

  async bulkUploadStudents(formData) {
    try {
      const token = keycloak?.token;
      
      const response = await fetch(`${API_BASE_URL}/students/bulk-upload`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          // Don't set Content-Type for FormData
        },
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Bulk upload failed: ${response.status} - ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error in bulk upload:', error);
      throw error;
    }
  },

  async createStudent(studentData) {
    try {
      const response = await fetch(`${API_BASE_URL}/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(studentData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create student: ${response.status} - ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating student:', error);
      throw error;
    }
  },

  // Utility methods
  clearCache() {
    gradesCache = null;
    classesCache = null;
    lastFetchTime = 0;
  },

  getCacheStatus() {
    return {
      gradesCached: !!gradesCache,
      classesCached: !!classesCache,
      cacheAge: lastFetchTime ? Date.now() - lastFetchTime : null
    };
  }
};

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
      boardingStatus: "BOARDING" // Add this
    },
    { 
      id: 2, 
      name: "Janice Esi", 
      studentId: "STU002", 
      grade: "Grade 8", 
      className: "8B", 
      allergies: "None",
      boardingStatus: "DAY" // Add this
    },
    { 
      id: 3, 
      name: "Esi Boateng", 
      studentId: "STU003", 
      grade: "Grade 7", 
      className: "7C", 
      allergies: "Lactose",
      boardingStatus: "BOARDING" // Add this
    },
    { 
      id: 4, 
      name: "Yaw Appiah", 
      studentId: "STU004", 
      grade: "Grade 9", 
      className: "9A", 
      allergies: "Penicillin",
      boardingStatus: "DAY" // Add this
    },
    { 
      id: 5, 
      name: "Akua Ofori", 
      studentId: "STU005", 
      grade: "Grade 8", 
      className: "8A", 
      allergies: "Shellfish",
      boardingStatus: "BOARDING" // Add this
    }
  ],
  grades: ["Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"],
  classes: ["7A", "7B", "7C", "8A", "8B", "8C", "9A", "9B", "9C", "10A", "10B", "11A", "11B", "12A", "12B"]
};