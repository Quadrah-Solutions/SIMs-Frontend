import React, { useState } from 'react';
import { useVisits } from '../hooks/useVisits';
import VisitFilters from '../components/visits/VisitFilters';
import VisitsTable from '../components/visits/VisitsTable';
import NewVisitModal from '../components/visits/NewVisitModal';

const Visits = () => {
  const [isNewVisitModalOpen, setIsNewVisitModalOpen] = useState(false);
  const { 
    visits, 
    grades, 
    classes, 
    conditions, 
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
    grades, 
    classes, 
    conditions,
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

  const handleSaveVisit = (visitData) => {
    console.log('Saving visit:', visitData);
    // Add your save logic here
    refetch(); // Refresh the visits list
  };

  const handleApplyFilters = () => {
    refetch(1);
  };

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
        {/* Header with New Visit Button */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Visits</h1>
            <p className="text-gray-600 mt-2">Manage student health center visits</p>
          </div>
          <button
            onClick={handleNewVisit}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm hover:shadow-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="font-semibold">New Visit</span>
          </button>
        </div>

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
      />
    </div>
  );
};

export default Visits;