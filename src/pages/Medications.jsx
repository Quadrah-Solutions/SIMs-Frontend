// components/medications/Medications.jsx
import React, { useState } from "react";
import MedicationsTable from "../components/medications/MedicationsTable";
import { useMedications } from '../hooks/useMedications';
import { useNotification } from '../components/common/NotificationProvider';
import { useAuth } from '../hooks/useAuth';
import NewMedicationModal from '../components/medications/NewMedicationModal';

export default function Medications() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateStockModalOpen, setIsUpdateStockModalOpen] = useState(false);
  
  const { success, error: showError } = useNotification();
  const { user } = useAuth();

  const [selectedMedication, setSelectedMedication] = useState(null);

  const {
    medications,
    categories,
    statistics,
    loading,
    error,
    filters,
    currentPage,
    totalPages,
    totalCount,
    refetch,
    updateFilters,
    clearFilters,
    createMedication,
    updateMedication,
    deleteMedication,
    restockMedication
  } = useMedications();

  const handleFilterChange = (filterType, value) => {
    updateFilters({
      ...filters,
      [filterType]: value
    });
  };

  const handleUpdateStock = () => {
    setIsUpdateStockModalOpen(true);
  };

  const handleAddMedication = () => {
    setIsAddModalOpen(true);
  };

  const handlePageChange = (page) => {
    refetch(page);
  };

 const handleSaveMedication = async (medicationData) => {
  try {
    if (selectedMedication) {
      // Update existing medication
      await updateMedication(selectedMedication.id, medicationData);
      success('Medication updated successfully!');
    } else {
      // Create new medication
      await createMedication(medicationData);
      success('Medication added successfully!');
    }
    refetch();
    setIsAddModalOpen(false);
    setSelectedMedication(null);
  } catch (err) {
    showError(`Failed to ${selectedMedication ? 'update' : 'add'} medication: ${err.message}`);
  }
};

  const handleDeleteMedication = async (medicationId) => {
    if (window.confirm('Are you sure you want to delete this medication?')) {
      try {
        await deleteMedication(medicationId);
        success('Medication deleted successfully!');
        refetch();
      } catch (err) {
        showError(`Failed to delete medication: ${err.message}`);
      }
    }
  };

  const handleRestockMedication = async (medicationId, quantity) => {
    try {
      await restockMedication(medicationId, { quantity });
      success('Medication restocked successfully!');
      refetch();
      setIsUpdateStockModalOpen(false);
    } catch (err) {
      showError(`Failed to restock medication: ${err.message}`);
    }
  };

  const handleEditMedication = (medicationId) => {
    const medication = medications.find(m => m.id === medicationId);
    setSelectedMedication(medication);
    setIsAddModalOpen(true);
  };

  // Statistics cards data
  const medicationStats = [
    { 
      title: "Total Medications", 
      count: statistics.totalMedications, 
      icon: "💊", 
      color: "blue",
      description: "Total medications in inventory"
    },
    { 
      title: "Low Stock Items", 
      count: statistics.lowStockItems, 
      icon: "⚠️", 
      color: "orange",
      description: "Items below minimum stock level"
    },
    { 
      title: "Expiring Soon", 
      count: statistics.expiringSoon, 
      icon: "📅", 
      color: "red",
      description: "Items expiring within 30 days"
    },
    { 
      title: "In Stock", 
      count: statistics.inStock, 
      icon: "✅", 
      color: "green",
      description: "Items with adequate stock"
    }
  ];

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-red-800 font-medium">Error loading medications</h3>
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
        isAddModalOpen || isUpdateStockModalOpen ? 'blur-sm opacity-70' : 'blur-0 opacity-100'
      }`}>
        {/* Header and Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Medications & Inventory</h1>
            <p className="text-gray-600 mt-1">Manage medication stock and inventory levels</p>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-3 mt-4 lg:mt-0">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
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
                    <option value="expired">Expired</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Category Filter */}
              <div className="w-full sm:w-40">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Category
                </label>
                <div className="relative">
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 appearance-none bg-white hover:bg-gray-50 cursor-pointer"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Search Filter */}
              <div className="w-full sm:w-40">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Search
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="Search medications..."
                    className="w-full pl-3 pr-10 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white hover:bg-gray-50"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.count}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
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
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Medication Inventory</h2>
            <button
              onClick={clearFilters}
              className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200"
            >
              Clear Filters
            </button>
          </div>
          
          <MedicationsTable
            medications={medications}
            loading={loading}
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            onPageChange={handlePageChange}
            onView={(id) => console.log('View medication:', id)}
            onEdit={(id) => console.log('Edit medication:', id)}
            onRestock={(id) => {
              // Open restock modal with selected medication
              setIsUpdateStockModalOpen(true);
              // You might want to store the selected medication ID
            }}
            onDelete={handleDeleteMedication}
          />
        </div>
      </div>

      {/* Add Medication Modal */}
      <NewMedicationModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedMedication(null);
        }}
        onSave={handleSaveMedication}
        medicationToEdit={selectedMedication}
        suppliers={["PharmaCo", "MedSupply", "HealthCorp", "Generic Suppliers"]}
      />

      {/* Update Stock Modal */}
      {/* {isUpdateStockModalOpen && (
        <UpdateStockModal
          isOpen={isUpdateStockModalOpen}
          onClose={() => setIsUpdateStockModalOpen(false)}
          onRestock={handleRestockMedication}
          medications={medications}
        />
      )} */}
    </div>
  );
}