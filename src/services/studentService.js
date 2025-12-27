import config from '../config/config';
import keycloak from '../config/keycloak'; 

const API_BASE_URL = config.API_BASE_URL;

// Cache for grades and classes
let gradesCache = null;
let classesCache = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper function to get the authorization header
const getAuthHeader = () => {
  if (keycloak && keycloak.token) {
    return { 'Authorization': `Bearer ${keycloak.token}` };
  }
  return {};
};

// Helper function to fetch with cache
const fetchWithCache = async (endpoint, forceRefresh = false) => {
  const now = Date.now();
  const cacheKey = endpoint.includes('grades') ? 'grades' : 'classes';
  
  // Check cache first (unless force refresh)
  if (!forceRefresh && cacheKey === 'grades' && gradesCache && (now - lastFetchTime) < CACHE_DURATION) {
    return gradesCache;
  }
  if (!forceRefresh && cacheKey === 'classes' && classesCache && (now - lastFetchTime) < CACHE_DURATION) {
    return classesCache;
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
    if (cacheKey === 'grades') {
      gradesCache = data;
    } else {
      classesCache = data;
    }
    lastFetchTime = now;
    
    return data;
  } catch (error) {
    console.error(`Error fetching ${cacheKey}:`, error);
    // Return fallback data
    if (cacheKey === 'grades') {
      return ["Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"];
    } else {
      return ["7A", "7B", "7C", "8A", "8B", "8C", "9A", "9B", "9C", "10A", "10B", "11A", "11B", "12A", "12B"];
    }
  }
};

export const studentService = {
  async getStudents(page = 1, pageSize = 10, filters = {}) {
    try {
      // Build query params for the new backend API
      const queryParams = new URLSearchParams({
        page: (page - 1).toString(), // Spring Boot uses 0-based indexing
        size: pageSize.toString(),
      });

      // Add filters if they exist
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.grade) queryParams.append('grade', filters.grade);
      if (filters.class) queryParams.append('className', filters.class);

      const url = `${API_BASE_URL}/students?${queryParams}`;
      console.log('Fetching students from:', url);
      
      const response = await fetch(url, {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.error('Response status:', response.status);
        throw new Error(`Failed to fetch students: ${response.status}`);
      }
      
      const pageData = await response.json();
      console.log('API Response:', pageData);
      
      // Transform the data to match UI expectations
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
        gender: student.gender
      })) || [];
      
      // Return in the expected format
      return {
        students: transformedData,
        totalPages: pageData.totalPages || 1,
        totalCount: pageData.totalElements || 0,
        currentPage: pageData.number + 1 || page // Convert back to 1-based indexing
      };
      
    } catch (error) {
      console.error('Error fetching students:', error);
      
      // Fallback to mock data with frontend filtering
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      
      // Filter mock data based on filters
      let filteredData = mockStudentData.students;
      
      if (filters.search && filters.search.trim() !== '') {
        const searchTerm = filters.search.toLowerCase();
        filteredData = filteredData.filter(student =>
          (student.name && student.name.toLowerCase().includes(searchTerm)) ||
          (student.studentId && student.studentId.toLowerCase().includes(searchTerm))
        );
      }
      
      if (filters.grade && filters.grade !== '') {
        filteredData = filteredData.filter(student => student.grade === filters.grade);
      }
      
      if (filters.class && filters.class !== '') {
        filteredData = filteredData.filter(student => student.className === filters.class);
      }
      
      const paginatedData = filteredData.slice(startIndex, endIndex);
      
      return {
        students: paginatedData,
        totalPages: Math.ceil(filteredData.length / pageSize) || 1,
        totalCount: filteredData.length || 0,
        currentPage: page
      };
    }
  },

  async getGrades(forceRefresh = false) {
    return fetchWithCache('/grades', forceRefresh);
  },

  async getClasses(forceRefresh = false) {
    return fetchWithCache('/classes', forceRefresh);
  },

  async getGradesAndClasses(forceRefresh = false) {
    try {
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
      allergies: "Peanuts, Dust" 
    },
    { 
      id: 2, 
      name: "Janice Esi", 
      studentId: "STU002", 
      grade: "Grade 8", 
      className: "8B", 
      allergies: "None" 
    },
    { 
      id: 3, 
      name: "Esi Boateng", 
      studentId: "STU003", 
      grade: "Grade 7", 
      className: "7C", 
      allergies: "Lactose" 
    },
    { 
      id: 4, 
      name: "Yaw Appiah", 
      studentId: "STU004", 
      grade: "Grade 9", 
      className: "9A", 
      allergies: "Penicillin" 
    },
    { 
      id: 5, 
      name: "Akua Ofori", 
      studentId: "STU005", 
      grade: "Grade 8", 
      className: "8A", 
      allergies: "Shellfish" 
    }
  ],
  grades: ["Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"],
  classes: ["7A", "7B", "7C", "8A", "8B", "8C", "9A", "9B", "9C", "10A", "10B", "11A", "11B", "12A", "12B"]
};