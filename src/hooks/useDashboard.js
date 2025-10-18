import { useState, useEffect } from 'react';

// Simple mock data inside the hook for now
const mockData = {
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

export const useDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    stats: {},
    latestVisits: [],
    alerts: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    // Simulate API call with timeout
    const loadData = async () => {
      try {
        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setDashboardData({
          stats: mockData.stats,
          latestVisits: mockData.latestVisits,
          alerts: mockData.alerts,
          loading: false,
          error: null
        });
      } catch (error) {
        setDashboardData({
          stats: {},
          latestVisits: [],
          alerts: [],
          loading: false,
          error: error.message
        });
      }
    };

    loadData();
  }, []);

  const refetch = () => {
    setDashboardData(prev => ({ ...prev, loading: true }));
    // Simulate refetch
    setTimeout(() => {
      setDashboardData({
        stats: mockData.stats,
        latestVisits: mockData.latestVisits,
        alerts: mockData.alerts,
        loading: false,
        error: null
      });
    }, 500);
  };

  return {
    ...dashboardData,
    refetch
  };
};