import config from '../config/config';
import keycloak from '../config/keycloak'; 
import { visitService } from './visitService';
import { medicationService } from './medicationService';
import { studentService } from './studentService';
import { medicalHistoryService } from './medicalHistoryService';

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

export const dashboardService = {
  async getDashboardStats(dateRange = "today") {
    try {
      console.log('📊 Fetching dashboard stats...');
      
      // Get today's date for filtering
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch multiple data sources concurrently
      const [visitsData, medicationsData, studentsData, conditionsData] = await Promise.all([
        this.getTodaysVisits(),
        medicationService.getMedications(1, 100),
        studentService.getStudents(1, 1000),
        this.getActiveConditionsCount()
      ]);
      
      // Calculate statistics
      const stats = {
        todaysVisits: visitsData.totalCount || 0,
        medicationGiven: this.calculateMedicationsGiven(visitsData.visits || []),
        lowStockAlerts: this.calculateLowStockItems(medicationsData.medications || []),
        studentsCleared: this.calculateClearedStudents(visitsData.visits || []),
        activeConditions: conditionsData.activeConditions || 0,
        totalStudents: studentsData.totalCount || 0,
        criticalCases: this.calculateCriticalCases(visitsData.visits || [])
      };
      
      console.log('📊 Dashboard stats calculated:', stats);
      return stats;
      
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      
      // Return fallback data
      return {
        todaysVisits: 0,
        medicationGiven: 0,
        lowStockAlerts: 0,
        studentsCleared: 0,
        activeConditions: 0,
        totalStudents: 0,
        criticalCases: 0
      };
    }
  },

  async getTodaysVisits() {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const visits = await visitService.getVisits(1, 10, {
        dateFrom: today,
        dateTo: today
      });
      
      return visits;
    } catch (error) {
      console.error('Error fetching today\'s visits:', error);
      return { visits: [], totalCount: 0 };
    }
  },

  async getLatestVisits(limit = 10) {
    try {
      console.log('📊 Fetching latest visits...');
      
      const visitsData = await visitService.getVisits(1, limit);
      
      // Transform the visits data for the dashboard
      const transformedVisits = visitsData.visits.map(visit => ({
        id: visit.id,
        date: visit.date,
        student: visit.student,
        studentId: visit.studentId,
        reason: visit.reason,
        outcome: visit.outcome,
        condition: visit.condition,
        nurse: visit.nurse,
        emergencyFlag: visit.emergencyFlag
      }));
      
      console.log('📊 Latest visits fetched:', transformedVisits.length);
      return transformedVisits;
      
    } catch (error) {
      console.error('Error fetching latest visits:', error);
      
      // Fallback to mock data
      return [
        { 
          id: 1, 
          date: new Date().toISOString(), 
          student: "Ama Mensah", 
          studentId: "STU001",
          reason: "Headache", 
          outcome: "Medicated",
          condition: "Stable",
          nurse: "Nurse Akua"
        },
        { 
          id: 2, 
          date: new Date().toISOString(), 
          student: "Janice Esi", 
          studentId: "STU002",
          reason: "Fever", 
          outcome: "Sent Home",
          condition: "Moderate",
          nurse: "Nurse Yaw"
        }
      ];
    }
  },

  async getAlerts() {
    try {
      console.log('⚠️ Fetching alerts...');
      
      // Get multiple alert sources
      const [lowStockAlerts, expiringMedications, criticalCases] = await Promise.all([
        this.getLowStockAlerts(),
        this.getExpiringMedications(),
        this.getCriticalCases()
      ]);
      
      // Combine all alerts
      const alerts = [
        ...lowStockAlerts,
        ...expiringMedications,
        ...criticalCases
      ];
      
      console.log('⚠️ Alerts fetched:', alerts.length);
      return alerts;
      
    } catch (error) {
      console.error('Error fetching alerts:', error);
      
      // Return fallback alerts
      return [
        { 
          id: 1, 
          type: "warning", 
          message: "Paracetamol running low (5 units remaining)",
          priority: "medium",
          timestamp: new Date().toISOString()
        },
        { 
          id: 2, 
          type: "info", 
          message: "Annual health check scheduled for next month",
          priority: "low",
          timestamp: new Date().toISOString()
        },
        { 
          id: 3, 
          type: "urgent", 
          message: "2 students with critical conditions require follow-up",
          priority: "high",
          timestamp: new Date().toISOString()
        }
      ];
    }
  },

  async getLowStockAlerts() {
    try {
      const medicationsData = await medicationService.getMedications(1, 100);
      const lowStockItems = (medicationsData.medications || []).filter(med => 
        med.currentStock < med.minimumStock && med.currentStock > 0
      );
      
      return lowStockItems.map(med => ({
        id: `low-stock-${med.id}`,
        type: "warning",
        message: `${med.name} running low (${med.currentStock} units remaining)`,
        priority: med.currentStock < 3 ? "high" : "medium",
        timestamp: new Date().toISOString(),
        medicationId: med.id
      }));
    } catch (error) {
      console.error('Error fetching low stock alerts:', error);
      return [];
    }
  },

  async getExpiringMedications() {
    try {
      const medicationsData = await medicationService.getMedications(1, 100);
      const today = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);
      
      const expiringSoon = (medicationsData.medications || []).filter(med => {
        if (!med.expiryDate) return false;
        const expiryDate = new Date(med.expiryDate);
        return expiryDate <= thirtyDaysFromNow && expiryDate > today;
      });
      
      return expiringSoon.map(med => ({
        id: `expiring-${med.id}`,
        type: "warning",
        message: `${med.name} expires on ${new Date(med.expiryDate).toLocaleDateString()}`,
        priority: "medium",
        timestamp: new Date().toISOString(),
        medicationId: med.id
      }));
    } catch (error) {
      console.error('Error fetching expiring medications:', error);
      return [];
    }
  },

  async getCriticalCases() {
    try {
      const visitsData = await visitService.getVisits(1, 50, {
        condition: 'Critical'
      });
      
      const criticalVisits = visitsData.visits.filter(visit => 
        visit.condition === 'Critical' || visit.emergencyFlag === true
      );
      
      return criticalVisits.map(visit => ({
        id: `critical-${visit.id}`,
        type: "urgent",
        message: `${visit.student} (${visit.studentId}) - ${visit.reason} requires follow-up`,
        priority: "high",
        timestamp: visit.date || new Date().toISOString(),
        visitId: visit.id,
        studentId: visit.studentId
      }));
    } catch (error) {
      console.error('Error fetching critical cases:', error);
      return [];
    }
  },

  async getActiveConditionsCount() {
    try {
      const summary = await medicalHistoryService.getMedicalConditionsSummary();
      return summary;
    } catch (error) {
      console.error('Error fetching active conditions:', error);
      return { totalConditions: 0, activeConditions: 0 };
    }
  },

  // Helper calculation methods
  calculateMedicationsGiven(visits) {
    return visits.reduce((total, visit) => {
      const medCount = visit.medications ? visit.medications.length : 0;
      return total + medCount;
    }, 0);
  },

  calculateLowStockItems(medications) {
    return medications.filter(med => 
      med.currentStock < med.minimumStock && med.currentStock > 0
    ).length;
  },

  calculateClearedStudents(visits) {
    return visits.filter(visit => 
      visit.outcome === 'Returned to Class' || 
      visit.disposition === 'RETURNED_TO_CLASS'
    ).length;
  },

  calculateCriticalCases(visits) {
    return visits.filter(visit => 
      visit.condition === 'Critical' || 
      visit.emergencyFlag === true
    ).length;
  },

  // New: Get dashboard analytics
  async getDashboardAnalytics(dateRange = "last_7_days") {
    try {
      const { startDate, endDate } = this.parseDateRange(dateRange);
      
      const queryParams = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
      
      const response = await fetch(`${API_BASE_URL}/dashboard/analytics?${queryParams}`, {
        headers: getAuthHeader()
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching analytics:', error);
      
      // Return mock analytics data
      return this.generateMockAnalytics();
    }
  },

  // New: Get visit trends
  async getVisitTrends(dateRange = "last_30_days") {
    try {
      const { startDate, endDate } = this.parseDateRange(dateRange);
      
      const queryParams = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
      
      const response = await fetch(`${API_BASE_URL}/visits/trends?${queryParams}`, {
        headers: getAuthHeader()
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch visit trends: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching visit trends:', error);
      
      // Return mock trend data
      return this.generateMockTrends();
    }
  },

  // Date range parsing helper
  parseDateRange(dateRange) {
    let endDate = new Date();
    let startDate = new Date();
    
    switch (dateRange) {
      case "today":
        startDate.setHours(0, 0, 0, 0);
        break;
      case "yesterday":
        endDate.setDate(endDate.getDate() - 1);
        endDate.setHours(23, 59, 59, 999);
        startDate.setDate(startDate.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case "last_7_days":
        startDate.setDate(endDate.getDate() - 7);
        break;
      case "last_30_days":
        startDate.setDate(endDate.getDate() - 30);
        break;
      case "this_month":
        startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
        break;
      case "last_month":
        startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 1, 1);
        endDate = new Date(endDate.getFullYear(), endDate.getMonth(), 0);
        break;
      default:
        startDate.setDate(endDate.getDate() - 7);
    }
    
    return { startDate, endDate };
  },

  // Mock data generators (fallbacks)
  generateMockAnalytics() {
    return {
      visitsByDay: [
        { day: 'Mon', visits: 12, emergencies: 1 },
        { day: 'Tue', visits: 15, emergencies: 2 },
        { day: 'Wed', visits: 10, emergencies: 0 },
        { day: 'Thu', visits: 18, emergencies: 3 },
        { day: 'Fri', visits: 14, emergencies: 1 },
        { day: 'Sat', visits: 5, emergencies: 0 },
        { day: 'Sun', visits: 2, emergencies: 0 }
      ],
      topConditions: [
        { condition: 'Headache', count: 8 },
        { condition: 'Fever', count: 5 },
        { condition: 'Allergy', count: 4 },
        { condition: 'Stomach Pain', count: 3 },
        { condition: 'Injury', count: 2 }
      ],
      medicationsAdministered: [
        { medication: 'Paracetamol', count: 12 },
        { medication: 'Ibuprofen', count: 8 },
        { medication: 'Cetirizine', count: 5 },
        { medication: 'Amoxicillin', count: 3 }
      ]
    };
  },

  generateMockTrends() {
    const trends = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      trends.push({
        date: date.toISOString().split('T')[0],
        visits: Math.floor(Math.random() * 20) + 5,
        emergencies: Math.floor(Math.random() * 4),
        medications: Math.floor(Math.random() * 15) + 3
      });
    }
    
    return trends;
  }
};