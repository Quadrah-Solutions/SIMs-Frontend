import React, { useState } from "react";
import MedicationsTable from "../components/medications/MedicationsTable";

export default function Medications() {
  const [filters, setFilters] = useState({
    dateRange: "last_30_days",
    status: ""
  });

  const [tableState, setTableState] = useState({
    loading: false,
    currentPage: 1,
    totalPages: 1,
    totalCount: 5
  });

  // Mock data for the medication cards
  const medicationStats = [
    { title: "Total Medications", count: 124, icon: "💊", color: "blue" },
    { title: "Low Stock Items", count: 8, icon: "⚠️", color: "orange" },
    { title: "Expiring Soon", count: 12, icon: "📅", color: "red" },
    { title: "In Stock", count: 104, icon: "✅", color: "green" }
  ];

  // Mock data for the medication inventory table
  const medicationData = [
    { 
      id: 1, 
      name: "Paracetamol 500mg", 
      stockLevel: 45, 
      expiryDate: "2024-06-15", 
      status: "In Stock" 
    },
    { 
      id: 2, 
      name: "Amoxicillin 250mg", 
      stockLevel: 8, 
      expiryDate: "2024-03-20", 
      status: "Low Stock" 
    },
    { 
      id: 3, 
      name: "Ibuprofen 400mg", 
      stockLevel: 23, 
      expiryDate: "2024-08-10", 
      status: "In Stock" 
    },
    { 
      id: 4, 
      name: "Ventolin Inhaler", 
      stockLevel: 5, 
      expiryDate: "2024-02-28", 
      status: "Expiring Soon" 
    },
    { 
      id: 5, 
      name: "Cetirizine 10mg", 
      stockLevel: 34, 
      expiryDate: "2024-11-15", 
      status: "In Stock" 
    }
  ];

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleUpdateStock = () => {
    console.log('Update stock clicked');
  };

  const handleAddMedication = () => {
    console.log('Add medication clicked');
  };

  const handlePageChange = (page) => {
    setTableState(prev => ({
      ...prev,
      currentPage: page
    }));
    console.log('Page changed to:', page);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header and Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Medications & Inventory</h1>
            <p className="text-gray-600 mt-1">Manage medication stock and inventory levels</p>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-3 mt-4 lg:mt-0">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Date Range Filter */}
              <div className="w-full sm:w-40">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Date Range
                </label>
                <div className="relative">
                  <select
                    value={filters.dateRange}
                    onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                    className="w-full pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 appearance-none bg-white hover:bg-gray-50 cursor-pointer"
                  >
                    <option value="last_7_days">Last 7 days</option>
                    <option value="last_30_days">Last 30 days</option>
                    <option value="last_90_days">Last 90 days</option>
                    <option value="this_year">This Year</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Status Filter */}
              <div className="w-full sm:w-40">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Status
                </label>
                <div className="relative">
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 appearance-none bg-white hover:bg-gray-50 cursor-pointer"
                  >
                    <option value="">All Status</option>
                    <option value="in_stock">In Stock</option>
                    <option value="low_stock">Low Stock</option>
                    <option value="expiring_soon">Expiring Soon</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="w-full sm:w-40">
                <label className="block text-xs font-medium text-gray-700 mb-1 invisible">
                  Actions
                </label>
                <button
                  onClick={handleUpdateStock}
                  className="w-full bg-gray-300 hover:bg-gray-400 text-white pl-3 pr-3 py-2 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 shadow-sm hover:shadow-md text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span className="font-semibold">Update Stock</span>
                </button>
              </div>

              <div className="w-full sm:w-40">
                <label className="block text-xs font-medium text-gray-700 mb-1 invisible">
                  Actions
                </label>
                <button
                  onClick={handleAddMedication}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white pl-3 pr-3 py-2 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm hover:shadow-md text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="font-semibold">Add Medication</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {medicationStats.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.count}</p>
                </div>
                <div className="text-3xl">
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Medication Inventory Table */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800">Medication Inventory</h2>
          </div>
          
          <MedicationsTable
            medications={medicationData}
            loading={tableState.loading}
            currentPage={tableState.currentPage}
            totalPages={tableState.totalPages}
            totalCount={tableState.totalCount}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}