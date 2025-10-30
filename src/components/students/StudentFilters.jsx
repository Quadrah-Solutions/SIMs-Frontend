import React from 'react';

const StudentFilters = ({ filters, grades, classes, onFilterChange, onAddStudent }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
      <div className="flex flex-col lg:flex-row gap-4 items-end lg:items-center">
        {/* Search and Filters Group */}
        <div className="flex flex-col lg:flex-row gap-4 items-end lg:items-center flex-1">
          {/* Search Bar */}
          <div className="w-full lg:w-80">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Students
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by name or ID..."
                value={filters.search}
                onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
                className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-gray-50 hover:bg-white"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            {/* Grade Filter */}
            <div className="w-full sm:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grade
              </label>
              <div className="relative">
                <select
                  value={filters.grade}
                  onChange={(e) => onFilterChange({ ...filters, grade: e.target.value })}
                  className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 appearance-none bg-gray-50 hover:bg-white cursor-pointer"
                >
                  <option value="">All Grades</option>
                  {grades.map((grade) => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Class Filter */}
            <div className="w-full sm:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class
              </label>
              <div className="relative">
                <select
                  value={filters.class}
                  onChange={(e) => onFilterChange({ ...filters, class: e.target.value })}
                  className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 appearance-none bg-gray-50 hover:bg-white cursor-pointer"
                >
                  <option value="">All Classes</option>
                  {classes.map((className) => (
                    <option key={className} value={className}>{className}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Student Button - Far right with spacing */}
        <div className="w-full lg:w-auto lg:ml-8 relative">
          <button
            onClick={onAddStudent}
            className="w-full lg:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm hover:shadow-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="font-semibold">Add Student</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentFilters;