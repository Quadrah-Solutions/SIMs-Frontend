// API endpoints configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

export const studentService = {
  async getStudents(page = 1, pageSize = 10, filters = {}) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      ...filters
    });
    
    const response = await fetch(`${API_BASE_URL}/students?${queryParams}`);
    if (!response.ok) throw new Error('Failed to fetch students');
    return await response.json();
  },

  async getGrades() {
    const response = await fetch(`${API_BASE_URL}/grades`);
    if (!response.ok) throw new Error('Failed to fetch grades');
    return await response.json();
  },

  async getClasses() {
    const response = await fetch(`${API_BASE_URL}/classes`);
    if (!response.ok) throw new Error('Failed to fetch classes');
    return await response.json();
  }
};

// Mock data for development (remove in production)
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