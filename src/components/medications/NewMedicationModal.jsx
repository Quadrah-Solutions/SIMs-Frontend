// components/medications/NewMedicationModal.jsx
import React, { useState, useEffect } from 'react';

const NewMedicationModal = ({ isOpen, onClose, onSave, medicationToEdit = null, suppliers = [] }) => {
  // Common dosage forms
  const dosageForms = [
    "Tablets", 
    "Capsules", 
    "Liquid (Syrup)", 
    "Injectable", 
    "Cream/Ointment", 
    "Inhaler", 
    "Drops", 
    "Suppositories",
    "Powder"
  ];

  // Common medication categories/types
  const categories = [
    "Analgesic (Pain Relief)",
    "Antibiotic",
    "Antihistamine (Allergy)",
    "Antipyretic (Fever)",
    "Anti-inflammatory",
    "Bronchodilator (Asthma)",
    "Antacid (Stomach)",
    "Antiseptic",
    "Vaccine",
    "Other"
  ];

  const [formData, setFormData] = useState({
    medicationName: '',
    genericName: '',
    currentStock: 0,
    minimumStock: 5,
    dosageForm: 'Tablets',
    strength: '',
    expiryDate: '',
    supplier: '',
    isActive: true,
    category: 'Analgesic (Pain Relief)'
  });

  const [isVisible, setIsVisible] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      // If editing, populate with existing medication data
      if (medicationToEdit) {
        setFormData({
          medicationName: medicationToEdit.medicationName || '',
          genericName: medicationToEdit.genericName || '',
          currentStock: medicationToEdit.currentStock || 0,
          minimumStock: medicationToEdit.minimumStock || 5,
          dosageForm: medicationToEdit.dosageForm || 'Tablets',
          strength: medicationToEdit.strength || '',
          expiryDate: medicationToEdit.expiryDate ? medicationToEdit.expiryDate.split('T')[0] : '',
          supplier: medicationToEdit.supplier || '',
          isActive: medicationToEdit.isActive !== false, // default to true
          category: medicationToEdit.category || 'Analgesic (Pain Relief)'
        });
      } else {
        // Reset form for new medication
        setFormData({
          medicationName: '',
          genericName: '',
          currentStock: 0,
          minimumStock: 5,
          dosageForm: 'Tablets',
          strength: '',
          expiryDate: '',
          supplier: '',
          isActive: true,
          category: 'Analgesic (Pain Relief)'
        });
      }
      setErrors({});
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
    }
  }, [isOpen, medicationToEdit]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // In validateForm function - FIX THE LOGIC:

const validateForm = () => {
  const newErrors = {};
  
    if (!formData.medicationName.trim()) {
        newErrors.medicationName = 'Medication name is required';
    }
    
    const currentStock = parseInt(formData.currentStock) || 0;
    const minimumStock = parseInt(formData.minimumStock) || 5;
    
    if (isNaN(currentStock) || currentStock < 0) {
        newErrors.currentStock = 'Stock must be a valid non-negative number';
    }
    
    if (isNaN(minimumStock) || minimumStock < 0) {
        newErrors.minimumStock = 'Minimum stock must be a valid non-negative number';
    }
    
    // FIX: Only show error if current stock is LESS THAN minimum (not greater)
    if (minimumStock > 0 && currentStock < minimumStock) {
        newErrors.currentStock = `Current stock (${currentStock}) is below minimum (${minimumStock}). Please increase stock.`;
    }
    
    if (!formData.expiryDate) {
        newErrors.expiryDate = 'Expiry date is required';
    } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time for accurate comparison
        const expiry = new Date(formData.expiryDate);
        if (expiry <= today) {
        newErrors.expiryDate = 'Expiry date must be in the future';
        }
    }
    
    if (!formData.strength.trim()) {
        newErrors.strength = 'Strength/dosage is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Prepare the data in the format backend expects
    const medicationData = {
      medicationName: formData.medicationName,
      genericName: formData.genericName || null,
      currentStock: parseInt(formData.currentStock) || 0,
      minimumStock: parseInt(formData.minimumStock) || 5,
      dosageForm: formData.dosageForm,
      strength: formData.strength,
      expiryDate: formData.expiryDate,
      supplier: formData.supplier || null,
      isActive: formData.isActive,
      category: formData.category
    };
    
    // If editing, include the ID
    if (medicationToEdit && medicationToEdit.id) {
      medicationData.id = medicationToEdit.id;
    }
    
    console.log('Submitting medication data:', medicationData);
    onSave(medicationData);
    onClose();
  };

  // Calculate stock status color
  const getStockStatusColor = () => {
    if (formData.currentStock === 0) {
      return 'bg-red-100 text-red-800';
    } else if (formData.currentStock < formData.minimumStock) {
      return 'bg-yellow-100 text-yellow-800';
    } else {
      return 'bg-green-100 text-green-800';
    }
  };

  const getStockStatusText = () => {
    if (formData.currentStock === 0) {
      return 'Out of Stock';
    } else if (formData.currentStock < formData.minimumStock) {
      return 'Low Stock';
    } else {
      return 'Adequate Stock';
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Modal positioned under the button */}
      <div 
        className={`absolute top-30 right-6 bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-200 transition-all duration-300 transform ${
          isVisible 
            ? 'translate-y-0 opacity-100 scale-100' 
            : 'translate-y-4 opacity-0 scale-95'
        }`}
        style={{ maxHeight: 'calc(100vh - 140px)' }}
      >
        {/* Header - with rounded top corners */}
        <div className="p-6 border-b border-gray-200 bg-white rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {medicationToEdit ? 'Edit Medication' : 'Add New Medication'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition duration-200 p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-gray-600 mt-2 text-sm">
            {medicationToEdit ? 'Update medication details' : 'Add new medication to inventory'}
          </p>
        </div>

        <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 220px)' }}>
          <form onSubmit={handleSubmit} className="p-6 space-y-6 bg-gray-50 scrollbar-hide">
            {/* Medication Information */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Medication Information</h3>
                <span className="text-xs text-red-500 font-medium">* Required</span>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Medication Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medication Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.medicationName}
                    onChange={(e) => handleChange('medicationName', e.target.value)}
                    placeholder="e.g., Paracetamol, Amoxicillin"
                    className={`w-full px-4 py-3 border ${
                      errors.medicationName ? 'border-red-300' : 'border-gray-200'
                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white hover:bg-gray-50`}
                  />
                  {errors.medicationName && (
                    <p className="text-red-500 text-xs mt-1">{errors.medicationName}</p>
                  )}
                </div>

                {/* Generic Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Generic Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.genericName}
                    onChange={(e) => handleChange('genericName', e.target.value)}
                    placeholder="Scientific/generic name"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white hover:bg-gray-50"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={formData.category}
                      onChange={(e) => handleChange('category', e.target.value)}
                      className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 appearance-none bg-white hover:bg-gray-50 cursor-pointer"
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Dosage Form */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dosage Form <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={formData.dosageForm}
                      onChange={(e) => handleChange('dosageForm', e.target.value)}
                      className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 appearance-none bg-white hover:bg-gray-50 cursor-pointer"
                    >
                      {dosageForms.map((form) => (
                        <option key={form} value={form}>
                          {form}
                        </option>
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

            {/* Strength and Stock Information */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Strength & Dosage</h3>
                <span className="text-xs text-red-500 font-medium">* Required</span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Strength/Dosage <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.strength}
                  onChange={(e) => handleChange('strength', e.target.value)}
                  placeholder="e.g., 500mg, 250mg/5ml, 10mg"
                  className={`w-full px-4 py-3 border ${
                    errors.strength ? 'border-red-300' : 'border-gray-200'
                  } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white hover:bg-gray-50`}
                />
                {errors.strength && (
                  <p className="text-red-500 text-xs mt-1">{errors.strength}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Enter the strength per unit (e.g., 500mg per tablet, 250mg per 5ml)
                </p>
              </div>
            </div>

            {/* Stock Information */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Stock Information</h3>
                <span className="text-xs text-red-500 font-medium">* Required</span>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Current Stock */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Stock <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      value={formData.currentStock}
                      onChange={(e) => handleChange('currentStock', e.target.value)}
                      className={`w-full px-4 py-3 border ${
                        errors.currentStock ? 'border-red-300' : 'border-gray-200'
                      } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white hover:bg-gray-50`}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="text-gray-500">units</span>
                    </div>
                  </div>
                  {errors.currentStock && (
                    <p className="text-red-500 text-xs mt-1">{errors.currentStock}</p>
                  )}
                </div>

                {/* Minimum Stock */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Stock <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      value={formData.minimumStock}
                      onChange={(e) => handleChange('minimumStock', e.target.value)}
                      className={`w-full px-4 py-3 border ${
                        errors.minimumStock ? 'border-red-300' : 'border-gray-200'
                      } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white hover:bg-gray-50`}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="text-gray-500">units</span>
                    </div>
                  </div>
                  {errors.minimumStock && (
                    <p className="text-red-500 text-xs mt-1">{errors.minimumStock}</p>
                  )}
                </div>

                {/* Stock Status Display */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Status
                  </label>
                  <div className={`px-4 py-3 rounded-xl border ${getStockStatusColor()} border-current`}>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{getStockStatusText()}</span>
                      <span className="text-sm">
                        {formData.currentStock} / {formData.minimumStock}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Expiry and Supplier Information */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Expiry & Supplier</h3>
                <span className="text-xs text-red-500 font-medium">* Required</span>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Expiry Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => handleChange('expiryDate', e.target.value)}
                    className={`w-full px-4 py-3 border ${
                      errors.expiryDate ? 'border-red-300' : 'border-gray-200'
                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white hover:bg-gray-50`}
                  />
                  {errors.expiryDate && (
                    <p className="text-red-500 text-xs mt-1">{errors.expiryDate}</p>
                  )}
                </div>

                {/* Supplier */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supplier (Optional)
                  </label>
                  <div className="relative">
                    {suppliers.length > 0 ? (
                      <>
                        <select
                          value={formData.supplier}
                          onChange={(e) => handleChange('supplier', e.target.value)}
                          className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 appearance-none bg-white hover:bg-gray-50 cursor-pointer"
                        >
                          <option value="">Select Supplier</option>
                          {suppliers.map((supplier) => (
                            <option key={supplier} value={supplier}>
                              {supplier}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </>
                    ) : (
                      <input
                        type="text"
                        value={formData.supplier}
                        onChange={(e) => handleChange('supplier', e.target.value)}
                        placeholder="Enter supplier name"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white hover:bg-gray-50"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Status</h3>
              </div>
              
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer p-3 hover:bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => handleChange('isActive', e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-medium text-gray-900">Active in Inventory</span>
                    <p className="text-sm text-gray-500 mt-1">
                      When checked, this medication will be available for dispensing and inventory tracking.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Low Stock Warning */}
            {formData.currentStock < formData.minimumStock && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-yellow-800">Low Stock Warning</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Current stock ({formData.currentStock}) is below the minimum required ({formData.minimumStock}).
                      Consider reordering soon.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Expiry Warning */}
            {formData.expiryDate && (() => {
              const today = new Date();
              const expiry = new Date(formData.expiryDate);
              const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
              
              if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
                return (
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <h4 className="font-semibold text-orange-800">Expiring Soon</h4>
                        <p className="text-sm text-orange-700 mt-1">
                          This medication expires in {daysUntilExpiry} days. Consider using it soon or disposing of it properly.
                        </p>
                      </div>
                    </div>
                  </div>
                );
              } else if (daysUntilExpiry <= 0) {
                return (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <div>
                        <h4 className="font-semibold text-red-800">Expired Medication</h4>
                        <p className="text-sm text-red-700 mt-1">
                          This medication has expired! Do not use. Please dispose of it properly.
                        </p>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            {/* Submit Button */}
            <div className="flex justify-end pt-4 space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center gap-3 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 shadow-sm hover:shadow-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm hover:shadow-md"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {medicationToEdit ? 'Update Medication' : 'Add Medication'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewMedicationModal;