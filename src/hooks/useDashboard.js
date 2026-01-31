import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '../services/dashboardService';

export const useDashboard = () => {
  const [stats, setStats] = useState({
    todaysVisits: 0,
    medicationGiven: 0,
    lowStockAlerts: 0,
    studentsCleared: 0,
    activeConditions: 0,
    totalStudents: 0,
    criticalCases: 0
  });
  const [latestVisits, setLatestVisits] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching dashboard data...');
      
      // Fetch all dashboard data concurrently
      const [statsData, visitsData, alertsData] = await Promise.all([
        dashboardService.getDashboardStats(),
        dashboardService.getLatestVisits(),
        dashboardService.getAlerts()
      ]);
      
      setStats(statsData);
      setLatestVisits(visitsData);
      setAlerts(alertsData);
      
      console.log('✅ Dashboard data loaded successfully');
      
    } catch (err) {
      console.error('❌ Error fetching dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
      
      // Set fallback data
      setStats({
        todaysVisits: 24,
        medicationGiven: 8,
        lowStockAlerts: 3,
        studentsCleared: 15,
        activeConditions: 28,
        totalStudents: 500,
        criticalCases: 2
      });
      
      setLatestVisits([
        { 
          id: 1, 
          date: new Date().toISOString(), 
          student: "John Doe", 
          studentId: "STU001",
          reason: "Headache", 
          outcome: "Medicated",
          condition: "Stable",
          nurse: "Nurse Smith"
        },
        { 
          id: 2, 
          date: new Date().toISOString(), 
          student: "Jane Smith", 
          studentId: "STU002",
          reason: "Fever", 
          outcome: "Sent Home",
          condition: "Moderate",
          nurse: "Nurse Johnson"
        }
      ]);
      
      setAlerts([
        { id: 1, type: "warning", message: "Paracetamol running low", priority: "medium" },
        { id: 2, type: "info", message: "Annual health check scheduled", priority: "low" },
        { id: 3, type: "urgent", message: "Critical case requires follow-up", priority: "high" }
      ]);
      
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    
    // Set up auto-refresh every 5 minutes
    const intervalId = setInterval(() => {
      console.log('🔄 Auto-refreshing dashboard data...');
      fetchDashboardData();
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(intervalId);
  }, [fetchDashboardData]);

  return {
    stats,
    latestVisits,
    alerts,
    loading,
    error,
    refetch: fetchDashboardData
  };
};