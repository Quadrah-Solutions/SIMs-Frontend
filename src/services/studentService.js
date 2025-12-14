import config from '../config/config';
import keycloak from '../config/keycloak'; 

const API_BASE_URL = config.API_BASE_URL;

// Helper function to get the authorization header
const getAuthHeader = () => {
  if (keycloak && keycloak.token) {
    return { 'Authorization': `Bearer ${keycloak.token}` };
  }
  return {};
};

export const studentService = {
  async getStudents(page = 1, pageSize = 10, filters = {}) {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...filters
      });
      
      console.log('Fetching students from:', `${API_BASE_URL}/students`);
      
      const response = await fetch(`${API_BASE_URL}/students`, {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.error('Response status:', response.status);
        throw new Error('Failed to fetch students');
      }
      
      const data = await response.json();
      
      // Transform the data to match UI expectations
      const transformedData = data.map(student => ({
        id: student.id,
        name: `${student.firstName} ${student.lastName}`,
        studentId: student.studentId,
        grade: student.gradeLevel,      // Map gradeLevel to grade
        className: student.homeroom,    // Map homeroom to className
        allergies: student.specialNotes || 'None'  // Map specialNotes to allergies
      }));
      
      // Return in the expected format
      return {
        students: transformedData,
        totalPages: Math.ceil(transformedData.length / pageSize),
        totalCount: transformedData.length,
        currentPage: page
      };
      
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  },

  async getGrades() {
    try {
      const response = await fetch(`${API_BASE_URL}/grades`, {
        headers: getAuthHeader()
      });
      if (!response.ok) throw new Error('Failed to fetch grades');
      return await response.json();
    } catch (error) {
      console.error('Error fetching grades:', error);
      throw error;
    }
  },

  async getClasses() {
    try {
      const response = await fetch(`${API_BASE_URL}/classes`, {
        headers: getAuthHeader()
      });
      if (!response.ok) throw new Error('Failed to fetch classes');
      return await response.json();
    } catch (error) {
      console.error('Error fetching classes:', error);
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
      if (!response.ok) throw new Error('Failed to create student');
      return await response.json();
    } catch (error) {
      console.error('Error creating student:', error);
      throw error;
    }
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