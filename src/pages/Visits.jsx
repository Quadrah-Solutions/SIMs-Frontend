import React, { useState } from 'react';
import { useVisits } from '../hooks/useVisits';
import { visitService } from '../services/visitService'; 
import { useNotification } from '../components/common/NotificationProvider'; 
import { useAuth } from '../hooks/useAuth';
import VisitFilters from '../components/visits/VisitFilters';
import VisitsTable from '../components/visits/VisitsTable';
import NewVisitModal from '../components/visits/NewVisitModal';

const Visits = () => {
  const [isNewVisitModalOpen, setIsNewVisitModalOpen] = useState(false);
  const { success, error: showError } = useNotification();
  
  // Use the auth hook to get current user
  const { user, authenticated, loading: authLoading } = useAuth();
  
  const { 
    visits, 
    grades, 
    classes, 
    conditions, 
    students,
    loading, 
    error, 
    filters, 
    currentPage, 
    totalPages, 
    totalCount, 
    refetch, 
    updateFilters,
    clearFilters 
  } = useVisits();

  console.log('Visits component state:', { 
    visits, 
    user,
    authenticated,
    loading, 
    error,
    visitsCount: visits.length
  });

  const handleNewVisit = () => {
    console.log('New Visit clicked');
    setIsNewVisitModalOpen(true);
  };

  const handlePageChange = (page) => {
    refetch(page);
  };

  const handleSaveVisit = async (visitData) => {
    try {
      // Get nurse name from Keycloak user
      const nurseName = user?.fullName || 
                       user?.name || 
                       `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
      
      // Add nurse name to visit data
      const visitDataWithNurse = {
        ...visitData,
        nurseName: nurseName || "Unknown Nurse" // Fallback
      };
      
      console.log('Saving visit with nurse:', visitDataWithNurse);
      await visitService.createVisit(visitDataWithNurse);
      
      success('Visit created successfully!');
      refetch();
      
    } catch (err) {
      console.error('Error saving visit:', err);
      showError(`Failed to save visit: ${err.message}`);
    }
  };

  const handleApplyFilters = () => {
    refetch(1);
  };

  // Get current user from auth
  const currentUser = user ? {
    id: user.id || 9,
    name: user.fullName || user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim()
  } : {
    id: null,
    name: "Nurse" 
  };

  // Show loading state if auth is still loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading authentication...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <h3 className="text-yellow-800 font-medium text-lg mb-2">Authentication Required</h3>
            <p className="text-yellow-600 mb-4">Please log in to access the visits page.</p>
            <button
              onClick={() => useAuth().login()} // Or however you trigger login
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
            >
              Log In
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check if user has nurse role (optional)
  const hasNurseRole = user?.roles?.includes('nurse') || user?.roles?.includes('NURSE');

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-red-800 font-medium">Error loading visits</h3>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
              <button
                onClick={() => refetch()}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className={`max-w-7xl mx-auto transition-all duration-300 ${
        isNewVisitModalOpen ? 'blur-sm opacity-70' : 'blur-0 opacity-100'
      }`}>
        {/* Header with user info and New Visit Button */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Visits</h1>
            <div className="flex items-center gap-4 mt-2">
              <p className="text-gray-600">Manage student health center visits</p>
              {user && (
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-blue-700">
                    Logged in as: {currentUser.name}
                    {hasNurseRole && (
                      <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                        Nurse
                      </span>
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={handleNewVisit}
            disabled={!hasNurseRole} // Optional: disable if not a nurse
            className={`bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm hover:shadow-md ${
              !hasNurseRole ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="font-semibold">New Visit</span>
          </button>
        </div>

        {/* Optional: Show warning if user doesn't have nurse role */}
        {authenticated && !hasNurseRole && (
          <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-yellow-700">
                You don't have nurse permissions. Some features may be limited.
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <VisitFilters
          filters={filters}
          grades={grades}
          classes={classes}
          conditions={conditions}
          onFilterChange={updateFilters}
          onClearFilters={clearFilters}
          onApplyFilters={handleApplyFilters}
        />

        {/* Visits Table */}
        <VisitsTable
          visits={visits}
          loading={loading}
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          onPageChange={handlePageChange}
        />
      </div>

      {/* New Visit Modal */}
      <NewVisitModal 
        isOpen={isNewVisitModalOpen}
        onClose={() => setIsNewVisitModalOpen(false)}
        onSave={handleSaveVisit}
        currentNurse={currentUser}
        students={students}
      />
    </div>
  );
};

export default Visits;