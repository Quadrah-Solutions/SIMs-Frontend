import React from 'react';

const VisitFilters = ({ filters, grades, classes, conditions, onFilterChange, onClearFilters, onApplyFilters }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
      </div>
      
      {/* Filters Row */}
      <div className="flex flex-col lg:flex-row gap-4 items-end lg:items-center mb-4">
        {/* Search and Filters Group */}
        <div className="flex flex-col lg:flex-row gap-4 items-end lg:items-center flex-1">
          {/* Date Range - Compact */}
          <div className="w-full lg:w-64">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => onFilterChange({ ...filters, dateFrom: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-gray-50 hover:bg-white text-sm"
                />
              </div>
              <div className="relative flex-1">
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => onFilterChange({ ...filters, dateTo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-gray-50 hover:bg-white text-sm"
                />
              </div>
            </div>
          </div>

          {/* Grade Filter - Compact */}
          <div className="w-full lg:w-40">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grade
            </label>
            <div className="relative">
              <select
                value={filters.grade}
                onChange={(e) => onFilterChange({ ...filters, grade: e.target.value })}
                className="w-full pl-3 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 appearance-none bg-gray-50 hover:bg-white cursor-pointer text-sm"
              >
                <option value="">All Grades</option>
                {grades.map((grade) => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Class Filter - Compact */}
          <div className="w-full lg:w-40">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Class
            </label>
            <div className="relative">
              <select
                value={filters.class}
                onChange={(e) => onFilterChange({ ...filters, class: e.target.value })}
                className="w-full pl-3 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 appearance-none bg-gray-50 hover:bg-white cursor-pointer text-sm"
              >
                <option value="">All Classes</option>
                {classes.map((className) => (
                  <option key={className} value={className}>{className}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Condition Filter - Compact */}
          <div className="w-full lg:w-44">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Condition
            </label>
            <div className="relative">
              <select
                value={filters.condition}
                onChange={(e) => onFilterChange({ ...filters, condition: e.target.value })}
                className="w-full pl-3 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 appearance-none bg-gray-50 hover:bg-white cursor-pointer text-sm"
              >
                <option value="">All Conditions</option>
                {conditions.map((condition) => (
                  <option key={condition} value={condition}>{condition}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Search Bar - Compact */}
          <div className="w-full lg:w-56">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search visits..."
                value={filters.search}
                onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
                className="block w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-gray-50 hover:bg-white text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons - Below and to the far right */}
      <div className="flex justify-end">
        <div className="flex gap-2">
          <button
            onClick={onClearFilters}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-sm font-medium"
          >
            Clear
          </button>
          <button
            onClick={onApplyFilters}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg flex items-center gap-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm font-medium"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default VisitFilters;