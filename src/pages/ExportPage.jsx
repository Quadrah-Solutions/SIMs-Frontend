import React, { useState } from 'react';
import { 
  DownloadIcon, 
  PrinterIcon, 
  DocumentIcon, 
  DocumentChartBarIcon,
  ChartBarIcon,
  TableCellsIcon,
  ArrowDownTrayIcon,
  ClockIcon,
  CalendarIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import exportService from '../../services/exportService';
import { useNotification } from '../common/NotificationProvider';

const ExportPage = ({ visits = [], filters = {}, visitStats = {} }) => {
  const [loading, setLoading] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [includeSummary, setIncludeSummary] = useState(true);
  const [includeCharts, setIncludeCharts] = useState(false);
  const [exportRange, setExportRange] = useState('all');
  const { success, error } = useNotification();

  // Calculate statistics
  const stats = {
    totalVisits: visits.length,
    uniqueStudents: new Set(visits.map(v => v.studentId)).size,
    todayVisits: visits.filter(v => {
      const visitDate = new Date(v.date);
      const today = new Date();
      return visitDate.toDateString() === today.toDateString();
    }).length,
    emergencyCases: visits.filter(v => v.emergencyFlag).length,
    byDisposition: {
      returned: visits.filter(v => v.disposition === 'RETURNED_TO_CLASS').length,
      sentHome: visits.filter(v => v.disposition === 'SENT_HOME').length,
      observation: visits.filter(v => v.disposition === 'UNDER_OBSERVATION').length,
      referred: visits.filter(v => v.disposition === 'REFERRED_TO_HOSPITAL').length
    }
  };

  const exportOptions = [
    {
      id: 'pdf',
      name: 'PDF Report',
      description: 'Professional multi-page report with charts and analysis',
      icon: <DocumentIcon className="h-8 w-8" />,
      color: 'bg-red-500',
      formats: ['Standard', 'Detailed', 'Summary Only']
    },
    {
      id: 'csv',
      name: 'Spreadsheet (CSV)',
      description: 'Raw data for analysis in Excel or other tools',
      icon: <TableCellsIcon className="h-8 w-8" />,
      color: 'bg-green-500',
      formats: ['Full Data', 'Basic Info']
    },
    {
      id: 'print',
      name: 'Print View',
      description: 'Optimized layout for printing or sharing',
      icon: <PrinterIcon className="h-8 w-8" />,
      color: 'bg-blue-500',
      formats: ['Table Only', 'With Summary']
    },
    {
      id: 'analysis',
      name: 'Data Analysis',
      description: 'Charts and insights for presentations',
      icon: <DocumentChartBarIcon className="h-8 w-8" />,
      color: 'bg-purple-500',
      formats: ['Charts Only', 'Full Analysis']
    }
  ];

  const rangeOptions = [
    { id: 'all', label: 'All Records', count: visits.length },
    { id: 'today', label: 'Today Only', count: stats.todayVisits },
    { id: 'week', label: 'Last 7 Days', count: visits.filter(v => {
      const visitDate = new Date(v.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return visitDate >= weekAgo;
    }).length },
    { id: 'emergency', label: 'Emergency Cases', count: stats.emergencyCases }
  ];

  const handleExport = async () => {
    if (visits.length === 0) {
      error('No visit data available to export');
      return;
    }

    setLoading(true);
    try {
      let filteredVisits = visits;
      
      // Apply range filter
      switch(exportRange) {
        case 'today':
          filteredVisits = visits.filter(v => {
            const visitDate = new Date(v.date);
            const today = new Date();
            return visitDate.toDateString() === today.toDateString();
          });
          break;
        case 'week':
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          filteredVisits = visits.filter(v => new Date(v.date) >= weekAgo);
          break;
        case 'emergency':
          filteredVisits = visits.filter(v => v.emergencyFlag);
          break;
      }

      // Handle different export formats
      switch(selectedFormat) {
        case 'pdf':
          await exportService.exportVisitsToPDF(filteredVisits, filters);
          success(`PDF report exported successfully! (${filteredVisits.length} records)`);
          break;
        
        case 'csv':
          exportService.exportVisitsToCSV(filteredVisits, filters);
          success(`CSV file downloaded successfully! (${filteredVisits.length} records)`);
          break;
        
        case 'print':
          await exportService.printVisitsTable('visits-table');
          success('Print dialog opened successfully');
          break;
        
        case 'analysis':
          // For analysis, we'll use the PDF with extra charts
          await exportService.exportVisitsToPDF(filteredVisits, {
            ...filters,
            includeCharts: true,
            includeAnalysis: true
          });
          success(`Analysis report exported successfully!`);
          break;
        
        default:
          error('Please select an export format');
      }
    } catch (err) {
      error(`Export failed: ${err.message}`);
      console.error('Export error:', err);
    } finally {
      setLoading(false);
    }
  };

  const quickExport = async (format) => {
    setSelectedFormat(format);
    setLoading(true);
    try {
      if (format === 'pdf') {
        await exportService.exportVisitsToPDF(visits, filters);
        success('Quick PDF export completed!');
      } else if (format === 'csv') {
        exportService.exportVisitsToCSV(visits, filters);
        success('Quick CSV export completed!');
      }
    } catch (err) {
      error(`Quick export failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-violet-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Export & Reports</h1>
          <p className="text-gray-600 mt-2">
            Generate professional reports and export visit data in various formats
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Statistics & Quick Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Data Overview Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200/60 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <ChartBarIcon className="h-5 w-5 mr-2 text-blue-500" />
                Data Overview
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                      <ClockIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Visits</p>
                      <p className="text-xl font-bold text-gray-900">{stats.totalVisits}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg mr-3">
                      <UserGroupIcon className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Unique Students</p>
                      <p className="text-xl font-bold text-gray-900">{stats.uniqueStudents}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 bg-red-100 rounded-lg mr-3">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Emergency Cases</p>
                      <p className="text-xl font-bold text-gray-900">{stats.emergencyCases}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg mr-3">
                      <CalendarIcon className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Today</p>
                      <p className="text-xl font-bold text-gray-900">{stats.todayVisits}</p>
                    </div>
                  </div>
                </div>

                {/* Disposition Breakdown */}
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Disposition Breakdown</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-sm text-gray-600">Returned to Class</span>
                      </div>
                      <span className="font-semibold">{stats.byDisposition.returned}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                        <span className="text-sm text-gray-600">Sent Home</span>
                      </div>
                      <span className="font-semibold">{stats.byDisposition.sentHome}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                        <span className="text-sm text-gray-600">Under Observation</span>
                      </div>
                      <span className="font-semibold">{stats.byDisposition.observation}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                        <span className="text-sm text-gray-600">Referred to Hospital</span>
                      </div>
                      <span className="font-semibold">{stats.byDisposition.referred}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Export Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200/60 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <ArrowDownTrayIcon className="h-5 w-5 mr-2 text-green-500" />
                Quick Export
              </h2>
              
              <div className="space-y-3">
                <button
                  onClick={() => quickExport('pdf')}
                  disabled={loading || visits.length === 0}
                  className="w-full flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center">
                    <DocumentIcon className="h-6 w-6 text-red-600 mr-3" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Quick PDF</p>
                      <p className="text-sm text-gray-600">All records</p>
                    </div>
                  </div>
                  <DownloadIcon className="h-5 w-5 text-gray-400" />
                </button>

                <button
                  onClick={() => quickExport('csv')}
                  disabled={loading || visits.length === 0}
                  className="w-full flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center">
                    <TableCellsIcon className="h-6 w-6 text-green-600 mr-3" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Quick CSV</p>
                      <p className="text-sm text-gray-600">Spreadsheet data</p>
                    </div>
                  </div>
                  <DownloadIcon className="h-5 w-5 text-gray-400" />
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-3">Export Status</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">
                    {visits.length === 0 ? 'No data available' : 'Ready to export'}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    visits.length === 0 
                      ? 'bg-gray-100 text-gray-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {visits.length === 0 ? 'Empty' : `${visits.length} records`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Export Configuration */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200/60 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <h2 className="text-xl font-bold text-white">Configure Export</h2>
                <p className="text-blue-100 text-sm mt-1">
                  Customize your report settings before exporting
                </p>
              </div>

              <div className="p-6">
                {/* Export Format Selection */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Format</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {exportOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setSelectedFormat(option.id)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          selectedFormat === option.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className={`w-12 h-12 ${option.color} rounded-lg flex items-center justify-center mb-3`}>
                          <div className="text-white">
                            {option.icon}
                          </div>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-1">{option.name}</h4>
                        <p className="text-xs text-gray-600">{option.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Data Range Selection */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Range</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {rangeOptions.map((range) => (
                      <button
                        key={range.id}
                        onClick={() => setExportRange(range.id)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          exportRange === range.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        } ${range.count === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={range.count === 0}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">{range.label}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            exportRange === range.id
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {range.count}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${visits.length ? (range.count / visits.length * 100) : 0}%` 
                            }}
                          ></div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Export Options */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Options</h3>
                  <div className="space-y-4">
                    {selectedFormat === 'pdf' && (
                      <>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center">
                            <DocumentChartBarIcon className="h-5 w-5 text-gray-600 mr-3" />
                            <div>
                              <p className="font-medium text-gray-900">Include Summary Page</p>
                              <p className="text-sm text-gray-600">Adds executive summary and statistics</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={includeSummary}
                              onChange={(e) => setIncludeSummary(e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center">
                            <ChartBarIcon className="h-5 w-5 text-gray-600 mr-3" />
                            <div>
                              <p className="font-medium text-gray-900">Include Charts & Graphs</p>
                              <p className="text-sm text-gray-600">Adds visual data representations</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={includeCharts}
                              onChange={(e) => setIncludeCharts(e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Export Preview */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Preview</h3>
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {exportOptions.find(o => o.id === selectedFormat)?.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {rangeOptions.find(r => r.id === exportRange)?.label} • {exportRange === 'all' ? visits.length : rangeOptions.find(r => r.id === exportRange)?.count} records
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">Estimated Size</p>
                        <p className="text-sm text-gray-600">
                          {selectedFormat === 'pdf' ? '1-2 MB' : '100-500 KB'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-gray-700">Professional formatting</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-gray-700">Multiple page support</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-gray-700">Confidential watermark</span>
                      </div>
                      {selectedFormat === 'pdf' && includeSummary && (
                        <div className="flex items-center text-sm">
                          <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-gray-700">Executive summary included</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleExport}
                    disabled={loading || visits.length === 0}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Exporting...</span>
                      </>
                    ) : (
                      <>
                        <DownloadIcon className="h-5 w-5" />
                        <span>Generate & Download</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => window.print()}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    Print Preview
                  </button>
                </div>

                {/* Help Text */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-start">
                    <ExclamationTriangleIcon className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-800 mb-1">Export Tips</p>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• PDF reports include professional formatting and are best for sharing</li>
                        <li>• CSV files are ideal for data analysis in spreadsheet software</li>
                        <li>• Use Print View for physical copies or sharing as-is</li>
                        <li>• All exports include confidential watermarks for security</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportPage;