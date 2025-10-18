// API endpoints configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

export const visitService = {
  async getVisits(page = 1, pageSize = 10, filters = {}) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      ...filters
    });
    
    const response = await fetch(`${API_BASE_URL}/visits?${queryParams}`);
    if (!response.ok) throw new Error('Failed to fetch visits');
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
  },

  async getConditions() {
    const response = await fetch(`${API_BASE_URL}/conditions`);
    if (!response.ok) throw new Error('Failed to fetch conditions');
    return await response.json();
  }
};

// Mock data for development (remove in production)
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
      student: "Kofi Asante", 
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
  grades: ["Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"],
  classes: ["7A", "7B", "7C", "8A", "8B", "8C", "9A", "9B", "9C", "10A", "10B", "11A", "11B", "12A", "12B"],
  conditions: ["All", "Mild", "Moderate", "Serious", "Stable", "Critical"]
};