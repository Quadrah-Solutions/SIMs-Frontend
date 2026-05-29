import React, { useState, useEffect } from 'react';

const BulkUploadModal = ({ isOpen, onClose, onUpload }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  // House options - same as in NewStudentModal
  const houseOptions = [
    { id: 'AD', name: 'ADDO' },
    { id: 'AS', name: 'ASIEDU' },
    { id: 'BT', name: 'BUTLER' },
    { id: 'CH', name: 'CHINERY' },
    { id: 'CR', name: 'CROFFIE' },
    { id: 'EN', name: 'ENGMANN' },
    { id: 'SC', name: 'SCOTTON' },
    { id: 'YB', name: 'YEBOAH' }
  ];

  useEffect(() => {
    if (isOpen) {
      // Small delay to trigger animation
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
      setFile(null);
      setError('');
    }
  }, [isOpen]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validate file type
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExtension = selectedFile.name.slice(
      ((selectedFile.name.lastIndexOf('.') - 1) >>> 0) + 2
    ).toLowerCase();
    
    if (!validExtensions.includes('.' + fileExtension)) {
      setError('Please upload an Excel (.xlsx, .xls) or CSV file');
      return;
    }

    // Validate file size (10MB max)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
    setError('');
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setError('');

    try {
      await onUpload(file);
      onClose();
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setError('');
  };

  const downloadTemplate = () => {
  // Create header row with all fields including House and Year Group as year
  const headers = [
    'Student ID*', 
    'First Name*', 
    'Last Name*', 
    'Grade Level*', 
    'Class*', 
    'Date of Birth*', 
    'Gender*', 
    'Boarding Status*',
    'House', 
    'Year Group*', // CHANGED: Now expects year (e.g., 2025)
    'Year Joined',
    'Allergies',
    'Special Notes',
    'Emergency Contact 1 Name', 
    'Emergency Contact 1 Relationship', 
    'Emergency Contact 1 Phone', 
    'Emergency Contact 1 Email',
    'Emergency Contact 2 Name', 
    'Emergency Contact 2 Relationship', 
    'Emergency Contact 2 Phone', 
    'Emergency Contact 2 Email'
  ];

  // Example data rows - Year Group as year
  const exampleRows = [
    [
      'MG012345678912',
      'Janice', 
      'Danquah', 
      'Form 3', 
      '3GS1', 
      '2003-06-15', 
      'Female', 
      'BOARDING',
      'AD',
      '2025', // CHANGED: Now just the year
      '2023-09-01', // Year joined as date
      'None',
      'Excellent in Mathematics',
      'William Ababio', 
      'Parent', 
      '0244022847', 
      'parent1@email.com',
      'Trustee Quarshie', 
      'Guardian', 
      '0242507307', 
      'guardian@email.com'
    ],
    [
      'MG011000501226', 
      'Jane', 
      'Smith', 
      'Form 1', 
      '1GA3', 
      '2009-08-22', 
      'Female', 
      'DAY',
      '', // Empty house for day student
      '2025', // CHANGED: Now just the year
      '2024-09-01', // Year joined as date
      'Peanuts, Pollen',
      'Needs special attention in Science',
      'John Smith', 
      'Father', 
      '0241234567', 
      'john@email.com',
      'Mary Smith', 
      'Mother', 
      '0247654321', 
      'mary@email.com'
    ],
    [
      'MG011000501227',
      'Michael',
      'Johnson',
      'Form 2',
      '2GB1',
      '2008-03-10',
      'Male',
      'BOARDING',
      'SC',
      '2025', // CHANGED: Now just the year
      '2023-09-01', // Year joined as date
      'None',
      'School Prefect',
      'Robert Johnson',
      'Father',
      '0241112233',
      'robert@email.com',
      'Sarah Johnson',
      'Mother',
      '0244445566',
      'sarah@email.com'
    ]
  ];

  // Instructions - Update to reflect year format
  const instructions = [
    ['* Required fields'],
    ['Student ID format: MG0 + 11 digits (e.g. MG011000501225)'],
    ['Boarding Status: DAY or BOARDING'],
    ['Gender: Male/Female/Other/Prefer not to say'],
    ['House Codes: AD=ADDO, AS=ASIEDU, BT=BUTLER, CH=CHINERY, CR=CROFFIE, EN=ENGMANN, SC=SCOTTON, YB=YEBOAH'],
    ['Year Group: Enter the academic year as 4 digits (e.g., 2025 for 2024-2025 academic year)'],
    ['Year Joined: Date student joined the school (YYYY-MM-DD format)'],
    ['Allergies: Separate multiple allergies with commas'],
    ['Special Notes: Any additional information about the student'],
    ['Emergency Contacts: Can leave blank if not applicable'],
    ['For boarding students: House is required'],
    ['For day students: House can be left empty']
  ];

  // Combine all data
  const allData = [headers, ...exampleRows, ...Array(1).fill(Array(headers.length).fill('')), ...instructions];
  
  const csvContent = allData.map(row => row.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'student_upload_template.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

  const viewHouseCodes = () => {
    // Create a modal or alert showing house codes
    const houseList = houseOptions.map(house => `${house.id} = ${house.name}`).join('\n');
    alert(`House Codes:\n\n${houseList}\n\nNote: House is optional for DAY students, recommended for BOARDING students.`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Modal positioned under the Add Student button - same as NewStudentModal */}
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
            <h2 className="text-2xl font-bold text-gray-900">Bulk Upload Students</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition duration-200 p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-gray-600 mt-1">Upload multiple students via Excel/CSV file</p>
        </div>

        {/* Form Content - Scrollable */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 220px)' }}>
          <div className="p-6 space-y-6 bg-gray-50">
            {/* File Upload Section */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">File Upload</h3>
              </div>

              <div className="space-y-4">
                {/* File Selection */}
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-gray-50 transition duration-200">
                  {file ? (
                    <div className="space-y-4">
                      <div className="p-3 bg-green-100 rounded-lg inline-block">
                        <svg className="w-10 h-10 text-green-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={removeFile}
                        className="text-red-600 hover:text-red-700 text-sm font-medium px-3 py-1 border border-red-600 rounded-lg hover:bg-red-50"
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-3 bg-gray-100 rounded-lg inline-block">
                        <svg className="w-10 h-10 text-gray-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Select a file to upload</p>
                        <p className="text-sm text-gray-500 mt-1">Excel or CSV format</p>
                      </div>
                      <label className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition duration-200">
                        Browse Files
                        <input
                          type="file"
                          accept=".xlsx,.xls,.csv"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-gray-400">
                        Supports .xlsx, .xls, .csv (Max 10MB)
                      </p>
                    </div>
                  )}
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-red-700">{error}</span>
                    </div>
                  </div>
                )}

                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                      <p className="font-medium text-blue-900">File Requirements:</p>
                      <ul className="text-sm text-blue-700 mt-1 space-y-1">
                        <li>• First row must be headers (download template for correct format)</li>
                        <li>• Required fields: Student ID, First Name, Last Name, Grade, Class, Date of Birth, Gender, Boarding Status, Year Group</li>
                        <li>• Date format: YYYY-MM-DD (e.g., 2005-08-15)</li>
                        <li>• Year Group: Enter as 4-digit year (e.g., 2025)</li>
                        <li>• Year Joined: Date student joined (YYYY-MM-DD format)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* House Codes Info */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-purple-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-purple-900">House Information</p>
                        <button
                          onClick={viewHouseCodes}
                          className="text-sm text-purple-700 hover:text-purple-800 underline"
                        >
                          View House Codes
                        </button>
                      </div>
                      <p className="text-sm text-purple-700 mt-1">
                        Use 2-letter house codes (e.g., "AD" for ADDO).
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Template Download */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Template Download</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Download our updated template file with the new <strong>House</strong> field.
                The template includes all required fields, house codes, and examples.
              </p>
              <div className="space-y-3">
                <button
                  onClick={downloadTemplate}
                  className="w-full px-4 py-3 border border-green-600 text-green-700 rounded-xl hover:bg-green-50 transition duration-200 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Updated Template (.csv)
                </button>
                {/* <p className="text-xs text-gray-500 text-center">
                  Now includes House field with example house codes
                </p> */}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={onClose}
                disabled={uploading}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              
              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Upload File
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadModal;