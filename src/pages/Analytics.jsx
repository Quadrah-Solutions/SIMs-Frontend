import React, { useState } from "react";

export default function Analytics() {
  const [filters, setFilters] = useState({
    dateRange: "last_30_days",
    grade: "",
    condition: ""
  });

  // Mock data for the tables and charts
  const visitSummaryData = [
    { type: "Routine checks", count: 156, change: "+12%" },
    { type: "Injuries", count: 23, change: "-5%" },
    { type: "Emergencies", count: 8, change: "+3%" },
    { type: "Medication Admin", count: 45, change: "+8%" }
  ];

  const complianceData = [
    { 
      issueType: "Missing Medical Form", 
      student: "Kwame Mensah", 
      grade: "Grade 7", 
      date: "2024-01-15", 
      status: "Pending" 
    },
    { 
      issueType: "Expired Medication", 
      student: "Esi Boateng", 
      grade: "Grade 8", 
      date: "2024-01-14", 
      status: "Resolved" 
    },
    { 
      issueType: "Overdue Checkup", 
      student: "Ama Ofori", 
      grade: "Grade 9", 
      date: "2024-01-12", 
      status: "Pending" 
    },
    { 
      issueType: "Incomplete Records", 
      student: "Yaw Appiah", 
      grade: "Grade 7", 
      date: "2024-01-10", 
      status: "In Progress" 
    }
  ];

  // Mock trend data for the line chart
  const trendData = [
    { month: 'Jan', visits: 65, incidents: 12 },
    { month: 'Feb', visits: 59, incidents: 8 },
    { month: 'Mar', visits: 80, incidents: 15 },
    { month: 'Apr', visits: 81, incidents: 9 },
    { month: 'May', visits: 56, incidents: 6 },
    { month: 'Jun', visits: 55, incidents: 10 }
  ];

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Count pending issues for the badge
  const pendingIssuesCount = complianceData.filter(item => item.status === "Pending").length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header and Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-600 mt-1">Comprehensive overview of clinic activities and compliance</p>
          </div>
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4 lg:mt-0">
            {/* Date Range Filter */}
            <div className="w-full sm:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <div className="relative">
                <select
                  value={filters.dateRange}
                  onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                  className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 appearance-none bg-white hover:bg-gray-50 cursor-pointer"
                >
                  <option value="last_7_days">Last 7 days</option>
                  <option value="last_30_days">Last 30 days</option>
                  <option value="last_90_days">Last 90 days</option>
                  <option value="this_year">This Year</option>
                  <option value="custom">Custom Range</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Grade Filter */}
            <div className="w-full sm:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grade
              </label>
              <div className="relative">
                <select
                  value={filters.grade}
                  onChange={(e) => handleFilterChange('grade', e.target.value)}
                  className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 appearance-none bg-white hover:bg-gray-50 cursor-pointer"
                >
                  <option value="">All Grades</option>
                  <option value="grade_7">Grade 7</option>
                  <option value="grade_8">Grade 8</option>
                  <option value="grade_9">Grade 9</option>
                  <option value="grade_10">Grade 10</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Condition Filter */}
            <div className="w-full sm:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Condition
              </label>
              <div className="relative">
                <select
                  value={filters.condition}
                  onChange={(e) => handleFilterChange('condition', e.target.value)}
                  className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 appearance-none bg-white hover:bg-gray-50 cursor-pointer"
                >
                  <option value="">All Conditions</option>
                  <option value="asthma">Asthma</option>
                  <option value="allergies">Allergies</option>
                  <option value="diabetes">Diabetes</option>
                  <option value="other">Other</option>
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

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Left Column - Visit Summary */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-800">Visit Summary</h2>
              <button className="text-gray-400 hover:text-gray-600 transition duration-200 p-1 rounded hover:bg-gray-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {visitSummaryData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{item.type}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.count}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.change.startsWith('+') 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.change}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column - Trend Analysis */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-800">Trend Analysis</h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Month</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            {/* Simple Line Chart (using CSS for demonstration) */}
            <div className="h-64 relative">
              <div className="absolute inset-0 flex items-end justify-between px-4">
                {/* Chart bars representing trend */}
                {trendData.map((data, index) => (
                  <div key={index} className="flex flex-col items-center space-y-2">
                    <div className="flex items-end space-x-1">
                      <div 
                        className="w-3 bg-blue-500 rounded-t transition-all duration-300"
                        style={{ height: `${(data.visits / 100) * 200}px` }}
                        title={`Visits: ${data.visits}`}
                      ></div>
                      <div 
                        className="w-3 bg-orange-500 rounded-t transition-all duration-300"
                        style={{ height: `${(data.incidents / 20) * 200}px` }}
                        title={`Incidents: ${data.incidents}`}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">{data.month}</span>
                  </div>
                ))}
              </div>
              
              {/* Chart Legend */}
              <div className="absolute top-0 left-0 flex gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span className="text-gray-600">Clinic Visits</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-orange-500 rounded"></div>
                  <span className="text-gray-600">Incidents</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Compliance Report */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800">Compliance Report</h2>
            <div className="flex items-center gap-2">
              <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {pendingIssuesCount} issues
              </span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {complianceData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.issueType}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.student}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{item.grade}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{item.date}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.status === 'Resolved' 
                          ? 'bg-green-100 text-green-800'
                          : item.status === 'In Progress'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Last Updated Timestamp */}
        <div className="flex justify-end">
          <p className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}