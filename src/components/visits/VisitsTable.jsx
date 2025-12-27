import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import exportService from "../../services/exportService";

// Add filters to the component props
const VisitsTable = ({ visits, loading, currentPage, totalPages, totalCount, onPageChange, filters }) => {
  const navigate = useNavigate();
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState('');

  // Move ALL helper functions inside the component
  // They should NOT reference visit directly, only through parameters
  
  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  // Export functions - filters is now available from props
  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      setExportType('pdf');
      
      const fileName = await exportService.exportVisitsToPDF(visits, filters || {});
      console.log(`PDF exported: ${fileName}`);
      
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
      setExportType('');
    }
  };

  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      setExportType('csv');
      
      await exportService.exportVisitsToCSV(visits, filters || {});
      console.log('CSV exported successfully');
      
    } catch (error) {
      console.error('CSV export failed:', error);
      alert('Failed to export CSV. Please try again.');
    } finally {
      setIsExporting(false);
      setExportType('');
    }
  };

  const handlePrint = async () => {
    try {
      setIsExporting(true);
      setExportType('print');
      
      await exportService.printVisitsTable('visits-table');
      console.log('Print dialog opened');
      
    } catch (error) {
      console.error('Print failed:', error);
      alert('Failed to print. Please try again.');
    } finally {
      setIsExporting(false);
      setExportType('');
    }
  };

  const handleScreenshot = async () => {
    try {
      setIsExporting(true);
      setExportType('screenshot');
      
      await exportService.captureTableAsImage('visits-table', filters || {});
      console.log('Screenshot captured');
      
    } catch (error) {
      console.error('Screenshot failed:', error);
      alert('Failed to capture screenshot. Please try again.');
    } finally {
      setIsExporting(false);
      setExportType('');
    }
  };

  const getConditionBadge = (condition) => {
    const styles = {
      'Mild': 'bg-green-100 text-green-800',
      'Moderate': 'bg-yellow-100 text-yellow-800',
      'Serious': 'bg-orange-100 text-orange-800',
      'Critical': 'bg-red-100 text-red-800',
      'Stable': 'bg-blue-100 text-blue-800'
    };
    return styles[condition] || 'bg-gray-100 text-gray-800';
  };

  const getOutcomeBadge = (outcome) => {
    const styles = {
      'Returned to Class': 'bg-green-100 text-green-800',
      'Sent Home': 'bg-red-100 text-red-800',
      'Under Observation': 'bg-yellow-100 text-yellow-800',
      'Referred to Hospital': 'bg-orange-100 text-orange-800',
      'UNDER_OBSERVATION': 'bg-yellow-100 text-yellow-800',
      'SENT_HOME': 'bg-red-100 text-red-800',
      'RETURNED_TO_CLASS': 'bg-green-100 text-green-800',
      'REFERRED_TO_HOSPITAL': 'bg-orange-100 text-orange-800'
    };
    return styles[outcome] || 'bg-gray-100 text-gray-800';
  };

  // Format disposition for UI
  const formatDisposition = (disposition) => {
    const mapping = {
      'RETURNED_TO_CLASS': 'Returned to Class',
      'SENT_HOME': 'Sent Home',
      'UNDER_OBSERVATION': 'Under Observation',
      'REFERRED_TO_HOSPITAL': 'Referred to Hospital'
    };
    return mapping[disposition] || disposition;
  };

  // Determine condition from visit data - takes visit as parameter
  const getConditionFromVisit = (visit) => {
    // Use original.emergencyFlag if available, otherwise use visit.emergencyFlag
    const emergencyFlag = visit.original?.emergencyFlag || visit.emergencyFlag;
    const disposition = visit.original?.disposition || visit.disposition;
    
    if (emergencyFlag) return 'Critical';
    if (disposition === 'REFERRED_TO_HOSPITAL') return 'Serious';
    if (disposition === 'SENT_HOME') return 'Moderate';
    return 'Stable';
  };

  // Format date - takes date as parameter
  const formatDate = (date) => {
    if (!date) return 'N/A';
    
    if (date instanceof Date) {
      return date.toLocaleDateString();
    }
    
    try {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        if (typeof date === 'string' && date.includes(' ')) {
          const [datePart] = date.split(' ');
          return datePart;
        }
        return 'Invalid Date';
      }
      return parsedDate.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', date, error);
      return 'N/A';
    }
  };

  // Format time - takes date as parameter
  const formatTime = (date) => {
    if (!date) return '';
    
    try {
      const parsedDate = date instanceof Date ? date : new Date(date);
      if (isNaN(parsedDate.getTime())) {
        if (typeof date === 'string' && date.includes(' ')) {
          const [, timePart] = date.split(' ');
          return timePart || '';
        }
        return '';
      }
      return parsedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      console.error('Error formatting time:', date, error);
      return '';
    }
  };

  // Helper to get data from either visit or visit.original
  const getVisitData = (visit, key) => {
    if (visit.original && visit.original[key] !== undefined) {
      return visit.original[key];
    }
    return visit[key];
  };

  // Debug function (optional)
  const debugVisitData = (visit) => {
    console.log(`Visit ${visit.id} - original data:`, {
      hasOriginal: !!visit.original,
      originalKeys: visit.original ? Object.keys(visit.original) : [],
      originalMedications: visit.original?.medications,
      originalTreatments: visit.original?.treatments,
      originalEmergencyFlag: visit.original?.emergencyFlag,
      originalDisposition: visit.original?.disposition
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Table Header with Actions */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Visit Records</h3>
            <div className="flex space-x-3">
              <div className="animate-pulse h-8 w-8 bg-gray-200 rounded"></div>
              <div className="animate-pulse h-8 w-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>

        {/* Shimmer Effect Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {['Date', 'Student', 'Reason', 'Condition', 'Medications', 'Actions'].map((header) => (
                  <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((row) => (
                <tr key={row} className="border-b border-gray-100">
                  {/* Date */}
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="h-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 w-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded animate-pulse"></div>
                    </div>
                  </td>
                  
                  {/* Student */}
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="h-4 w-32 bg-gradient-to-r from-gray-100 to-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 w-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded animate-pulse"></div>
                    </div>
                  </td>
                  
                  {/* Reason */}
                  <td className="px-6 py-4">
                    <div className="h-4 w-48 bg-gradient-to-r from-gray-100 to-gray-200 rounded animate-pulse"></div>
                  </td>
                  
                  {/* Condition */}
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="h-6 w-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full animate-pulse"></div>
                      <div className="h-6 w-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full animate-pulse"></div>
                    </div>
                  </td>
                  
                  {/* Medications */}
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <div className="h-4 w-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 w-32 bg-gradient-to-r from-gray-100 to-gray-200 rounded animate-pulse"></div>
                    </div>
                  </td>
                  
                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <div className="h-8 w-8 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg animate-pulse"></div>
                      <div className="h-8 w-8 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg animate-pulse"></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Table Header with Actions */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Visit Records</h3>
          <div className="flex space-x-2">
            {/* Export Dropdown */}
            <div className="relative group">
              <button
                disabled={isExporting || visits.length === 0}
                className="text-gray-600 hover:text-gray-900 transition duration-200 p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                title="Export Options"
              >
                {isExporting && exportType === 'pdf' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                    <span className="text-sm">PDF...</span>
                  </>
                ) : isExporting && exportType === 'csv' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                    <span className="text-sm">CSV...</span>
                  </>
                ) : isExporting && exportType === 'print' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                    <span className="text-sm">Print...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm">Export</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </>
                )}
              </button>
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                <div className="py-1">
                  <button
                    onClick={handleExportPDF}
                    disabled={isExporting || visits.length === 0}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 disabled:opacity-50"
                  >
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export as PDF
                  </button>
                  <button
                    onClick={handleExportCSV}
                    disabled={isExporting || visits.length === 0}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 disabled:opacity-50"
                  >
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export as CSV
                  </button>
                  <button
                    onClick={handleScreenshot}
                    disabled={isExporting || visits.length === 0}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 disabled:opacity-50"
                  >
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Capture Screenshot
                  </button>
                  <div className="border-t border-gray-200 my-1"></div>
                  <button
                    onClick={handlePrint}
                    disabled={isExporting || visits.length === 0}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 disabled:opacity-50"
                  >
                    <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print Report
                  </button>
                </div>
              </div>
            </div>
            
            {/* Quick Print Button */}
            <button
              onClick={handlePrint}
              disabled={isExporting || visits.length === 0}
              className="text-gray-600 hover:text-gray-900 transition duration-200 p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Print"
            >
              {isExporting && exportType === 'print' ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
              )}
            </button>
          </div>
        </div>
        
        {/* Export Status Message */}
        {isExporting && (
          <div className="mt-2 text-sm text-blue-600 flex items-center gap-2">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
            {exportType === 'pdf' && 'Generating PDF report...'}
            {exportType === 'csv' && 'Exporting CSV file...'}
            {exportType === 'print' && 'Preparing for print...'}
            {exportType === 'screenshot' && 'Capturing screenshot...'}
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full" id="visits-table">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reason
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Condition
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Medications
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {visits.map((visit) => {
              // Call helper functions WITH the visit parameter
              const condition = getConditionFromVisit(visit);
              const disposition = getVisitData(visit, 'disposition');
              const formattedOutcome = formatDisposition(disposition);
              
              // Get medications and treatments
              const medications = getVisitData(visit, 'medications') || [];
              const treatments = getVisitData(visit, 'treatments') || [];
              
              return (
                <tr key={visit.id} className="hover:bg-gray-50">
                  {/* Date */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(visit.date)} <br />
                    <span className="text-xs text-gray-500">
                      {formatTime(visit.date)}
                    </span>
                  </td>

                  {/* Student */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {visit.student || `Student ${visit.studentId}`}
                    </div>
                    <div className="text-xs text-gray-500">
                      {visit.grade} - {visit.className}
                    </div>
                  </td>
                  
                  {/* Reason */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="max-w-xs truncate" title={visit.reason}>
                      {visit.reason}
                    </div>
                  </td>
                  
                  {/* Condition */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getConditionBadge(condition)}`}>
                      {condition}
                    </span>
                    {getVisitData(visit, 'emergencyFlag') && (
                      <span className="ml-1 inline-flex px-1 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        EMERGENCY
                      </span>
                    )}
                  </td>
                  
                  {/* Medications & Treatments */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="max-w-xs">
                      {/* Debug button (optional) */}
                      <button 
                        onClick={() => debugVisitData(visit)}
                        className="text-xs text-gray-400 hover:text-gray-600 mb-1"
                      >
                        Debug
                      </button>
                      
                      {/* Medications */}
                      {medications.length > 0 && (
                        <div className="mb-2">
                          <span className="text-xs font-medium text-blue-600">Medications:</span>
                          <div className="text-xs text-gray-500 space-y-1 mt-1">
                            {medications.map((med, idx) => (
                              <div key={idx} className="flex items-start">
                                <span className="text-gray-400 mr-1 mt-0.5">•</span>
                                <div>
                                  <span className="font-medium">
                                    {med.medicationName || med.medication?.medicationName || 'Medication'}
                                  </span>
                                  <span className="text-gray-600 ml-1">
                                    ({med.dosage || 'No dosage'})
                                  </span>
                                  {med.notes && (
                                    <div className="text-gray-500 italic">Notes: {med.notes}</div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Treatments */}
                      {treatments.length > 0 && (
                        <div>
                          <span className="text-xs font-medium text-green-600">Treatments:</span>
                          <div className="text-xs text-gray-500 space-y-1 mt-1">
                            {treatments.map((treatment, idx) => (
                              <div key={idx} className="flex items-start">
                                <span className="text-gray-400 mr-1 mt-0.5">•</span>
                                <div>
                                  <span className="font-medium">{treatment.treatmentName}</span>
                                  {treatment.description && (
                                    <span className="text-gray-600 ml-1">- {treatment.description}</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Show if none */}
                      {medications.length === 0 && treatments.length === 0 && (
                        <span className="text-xs text-gray-400 italic">None</span>
                      )}
                    </div>
                  </td>
                  
                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {/* View button */}
                      <button
                        onClick={() => navigate(`/visits/${visit.id}`)}
                        className="text-blue-600 hover:text-blue-900 transition duration-200 p-1 rounded hover:bg-blue-50"
                        title="View Visit Details"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      
                      {/* Edit button (optional) */}
                      <button
                        onClick={() => console.log('Edit visit:', visit.id)}
                        className="text-green-600 hover:text-green-900 transition duration-200 p-1 rounded hover:bg-green-50"
                        title="Edit Visit"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              Showing <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> to{' '}
              <span className="font-medium">{Math.min(currentPage * 10, totalCount)}</span> of{' '}
              <span className="font-medium">{totalCount}</span> visits
            </div>
            
            <div className="flex items-center space-x-1">
              {/* Previous Button */}
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                title="Previous Page"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Page Numbers */}
              {getPageNumbers().map((page) => (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`min-w-[40px] px-3 py-2 text-sm font-medium rounded-md transition duration-200 ${
                    currentPage === page
                      ? 'bg-blue-600 text-white border border-blue-600'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}

              {/* Next Button */}
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                title="Next Page"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisitsTable;