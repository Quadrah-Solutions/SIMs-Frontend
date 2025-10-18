// API endpoints configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

export const dashboardService = {
  async getDashboardStats() {
    const response = await fetch(`${API_BASE_URL}/dashboard/stats`);
    if (!response.ok) throw new Error('Failed to fetch dashboard stats');
    return await response.json();
  },

  async getLatestVisits() {
    const response = await fetch(`${API_BASE_URL}/visits/latest`);
    if (!response.ok) throw new Error('Failed to fetch latest visits');
    return await response.json();
  },

  async getAlerts() {
    const response = await fetch(`${API_BASE_URL}/alerts`);
    if (!response.ok) throw new Error('Failed to fetch alerts');
    return await response.json();
  }
};

// Mock data for development (remove in production)
export const mockData = {
  stats: {
    todaysVisits: 24,
    medicationGiven: 8,
    lowStockAlerts: 3,
    studentsCleared: 15
  },
  latestVisits: [
    { id: 1, date: "2024-01-15", student: "John Doe", reason: "Headache", outcome: "Medicated" },
    { id: 2, date: "2024-01-15", student: "Jane Smith", reason: "Fever", outcome: "Sent Home" },
    { id: 3, date: "2024-01-15", student: "Mike Johnson", reason: "Injury", outcome: "Treated" },
    { id: 4, date: "2024-01-14", student: "Sarah Wilson", reason: "Allergy", outcome: "Medicated" },
    { id: 5, date: "2024-01-14", student: "Tom Brown", reason: "Checkup", outcome: "Cleared" }
  ],
  alerts: [
    { id: 1, type: "warning", message: "Paracetamol running low" },
    { id: 2, type: "info", message: "Annual health check scheduled" },
    { id: 3, type: "urgent", message: "Immunization records due" }
  ]
};