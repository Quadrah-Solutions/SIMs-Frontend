import React, { useState, useRef, useEffect } from 'react';

const StudentFilters = ({ filters, grades, classes, onFilterChange, onAddStudent, onBulkUpload }) => {
  const [showOptions, setShowOptions] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleAddIndividual = () => {
    setShowOptions(false);
    onAddStudent();
  };

  const handleBulkUpload = () => {
    setShowOptions(false);
    onBulkUpload();
  };

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

        {/* Add Student Button with Dropdown */}
        <div className="w-full lg:w-auto lg:ml-8 relative" ref={dropdownRef}>
          <div className="relative">
            <button
              onClick={() => setShowOptions(!showOptions)}
              onMouseEnter={() => setShowOptions(true)}
              className="w-full lg:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm hover:shadow-md group"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="font-semibold">Add Student</span>
              <svg className={`w-4 h-4 transition-transform duration-200 ${showOptions ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showOptions && (
              <div 
                className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-10 animate-fadeIn"
                onMouseLeave={() => setShowOptions(false)}
              >
                <div className="py-1">
                  {/* Individual Add Option */}
                  <button
                    onClick={handleAddIndividual}
                    className="w-full px-4 py-3 text-left hover:bg-blue-50 transition duration-150 flex items-center gap-3 group"
                  >
                    <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition duration-150">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Add Individual</div>
                      <div className="text-sm text-gray-500">Add one student at a time</div>
                    </div>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  {/* Divider */}
                  <div className="border-t border-gray-100 my-1"></div>

                  {/* Bulk Upload Option */}
                  <button
                    onClick={handleBulkUpload}
                    className="w-full px-4 py-3 text-left hover:bg-green-50 transition duration-150 flex items-center gap-3 group"
                  >
                    <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition duration-150">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Bulk Upload</div>
                      <div className="text-sm text-gray-500">Upload Excel/CSV file</div>
                    </div>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Arrow pointing to button */}
                <div className="absolute -top-2 right-4 w-4 h-4 bg-white transform rotate-45 border-t border-l border-gray-200"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentFilters;