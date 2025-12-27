import { useState, useEffect } from 'react';
import { analyticsService } from '../services/analyticsService';

export const useAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    dashboardStats: {},
    visitStats: {},
    visitSummary: [], 
    frequentVisitors: [],
    medicationUsage: [],
    trends: [],
    grades: [],
    conditions: [],
    loading: true,
    error: null
  });

  const [filters, setFilters] = useState({
    dateRange: "last_30_days",
    grade: "",
    condition: ""
  });

  // Fetch all analytics data
  const fetchAnalytics = async () => {
    try {
      setAnalyticsData(prev => ({ ...prev, loading: true, error: null }));
      
      // Fetch all data concurrently
      const [
        dashboardStats,
        visitStats,
        visitSummary, // Add this
        frequentVisitors,
        medicationUsage,
        trends
      ] = await Promise.all([
        analyticsService.getDashboardStatistics(filters),
        analyticsService.getVisitStatisticsByDisposition(filters),
        analyticsService.getVisitSummary(filters),
        analyticsService.getFrequentVisitors(filters),
        analyticsService.getMedicationUsage(filters),
        analyticsService.getTrendData(filters)
      ]);
      
      setAnalyticsData(prev => ({
        ...prev,
        dashboardStats,
        visitStats,
        visitSummary, // Add this
        frequentVisitors,
        medicationUsage,
        trends,
        loading: false
      }));
      
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setAnalyticsData(prev => ({
        ...prev,
        error: error.message,
        loading: false
      }));
    }
  };

  // Fetch grades and conditions
  const fetchGradesAndConditions = async () => {
    try {
      const [grades, conditions] = await Promise.all([
        analyticsService.getGrades(),
        analyticsService.getConditions()
      ]);
      
      setAnalyticsData(prev => ({
        ...prev,
        grades: grades || [],
        conditions: conditions || []
      }));
      
    } catch (error) {
      console.error('Error fetching grades and conditions:', error);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      await fetchAnalytics();
      await fetchGradesAndConditions();
    };

    initializeData();
  }, []);

  // Refetch when filters change
  useEffect(() => {
    fetchAnalytics();
  }, [filters]);

  const refetch = () => {
    fetchAnalytics();
  };

  const updateFilters = (newFilters) => {
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({
      dateRange: "last_30_days",
      grade: "",
      condition: ""
    });
  };

  return {
    ...analyticsData,
    filters,
    refetch,
    updateFilters,
    clearFilters
  };
};