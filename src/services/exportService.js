import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const exportService = {
  
  async exportVisitsToPDF(visits, filters = {}, options = {}) {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const includeSummary = options.includeSummary !== false;
      const includeCharts = options.includeCharts || false;
      const includeAnalysis = options.includeAnalysis || false;
      
      // Add cover page
      this.addProfessionalCoverPage(doc, visits, filters);
      
      // Add summary page if requested
      if (includeSummary) {
        doc.addPage();
        this.addExecutiveSummaryPage(doc, visits, filters);
      }
      
      // Add analysis page if requested
      if (includeAnalysis) {
        doc.addPage();
        this.addAnalysisPage(doc, visits);
      }
      
      // Add visits table
      doc.addPage();
      this.addProfessionalVisitsTable(doc, visits);
      
      // Add charts page if requested
      if (includeCharts) {
        doc.addPage();
        this.addChartsPage(doc, visits);
      }
      
      // Add footer to all pages
      this.addProfessionalFooter(doc);
      
      // Save the document
      const fileName = this.generateFileName('visits', 'pdf', filters);
      doc.save(fileName);
      
      return fileName;
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF: ' + error.message);
    }
  },
  
  addProfessionalCoverPage(doc, visits, filters) {
    // Watermark background
    doc.setFontSize(60);
    doc.setTextColor(240, 240, 240);
    doc.setFont('helvetica', 'bold');
    doc.text('SYTE INFIRMARY', 105, 150, { align: 'center' });
    
    // Title
    doc.setFontSize(24);
    doc.setTextColor(0, 51, 102);
    doc.text('Visit Records Report', 105, 50, { align: 'center' });
    
    // Subtitle
    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.text('Confidential Medical Document', 105, 60, { align: 'center' });
    
    // Report info box
    doc.setDrawColor(0, 51, 102);
    doc.setLineWidth(1);
    doc.rect(30, 80, 150, 100);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 51, 102);
    doc.setFont('helvetica', 'bold');
    doc.text('REPORT METADATA', 105, 95, { align: 'center' });
    
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    
    const metadata = [
      `Report ID: ${this.generateReportId()}`,
      `Generated: ${new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`,
      `Total Records: ${visits.length}`,
      filters.dateFrom ? `From: ${filters.dateFrom}` : '',
      filters.dateTo ? `To: ${filters.dateTo}` : '',
      filters.grade ? `Grade: ${filters.grade}` : '',
      filters.className ? `Class: ${filters.className}` : ''
    ].filter(Boolean);
    
    metadata.forEach((item, index) => {
      doc.text(item, 40, 115 + (index * 8));
    });
    
    // Confidential notice
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.setFont('helvetica', 'italic');
    doc.text('FOR AUTHORIZED PERSONNEL ONLY • CONFIDENTIAL', 105, 200, { align: 'center' });
  },
  
  addExecutiveSummaryPage(doc, visits, filters) {
    const stats = this.calculateVisitStats(visits);
    
    // Page title
    doc.setFontSize(18);
    doc.setTextColor(0, 51, 102);
    doc.setFont('helvetica', 'bold');
    doc.text('Executive Summary', 20, 30);
    
    // Introduction
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    
    const introText = `This report provides a comprehensive overview of student health center activities 
for the specified reporting period. The SYTE Infirmary maintains high standards of care 
while ensuring proper documentation and follow-up for all student interactions.`;
    
    const splitIntro = doc.splitTextToSize(introText, 170);
    doc.text(splitIntro, 20, 45);
    
    // Key metrics
    doc.setFontSize(14);
    doc.setTextColor(0, 51, 102);
    doc.setFont('helvetica', 'bold');
    doc.text('Key Performance Indicators', 20, 85);
    
    // Metrics grid - FIXED: Convert numbers to strings
    const metrics = [
      { label: 'Total Visits', value: stats.totalVisits.toString(), color: [66, 133, 244] },
      { label: 'Unique Students', value: stats.uniqueStudents.toString(), color: [51, 153, 102] },
      { label: 'Emergency Cases', value: stats.emergencyCases.toString(), color: [234, 67, 53] },
      { label: 'Avg Visits/Day', value: stats.avgVisitsPerDay.toFixed(1), color: [255, 193, 7] }
    ];
    
    metrics.forEach((metric, index) => {
      const x = 30 + (index % 2 * 80);
      const y = 100 + Math.floor(index / 2) * 30;
      
      // Metric card
      doc.setFillColor(...metric.color);
      doc.circle(x + 5, y + 5, 8, 'F');
      
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      // FIXED: metric.value is already a string
      doc.text(metric.value, x + 20, y + 9);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(metric.label, x + 20, y + 15);
    });
  },
  
  addAnalysisPage(doc, visits) {
    const stats = this.calculateVisitStats(visits);
    
    // Page title
    doc.setFontSize(18);
    doc.setTextColor(0, 51, 102);
    doc.setFont('helvetica', 'bold');
    doc.text('Detailed Analysis', 20, 30);
    
    // Disposition breakdown
    doc.setFontSize(14);
    doc.text('Disposition Breakdown', 20, 50);
    
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    
    let currentY = 60;
    if (stats.dispositionBreakdown) {
      Object.entries(stats.dispositionBreakdown).forEach(([disposition, count]) => {
        const formattedDisposition = this.formatDisposition(disposition);
        doc.text(`${formattedDisposition}: ${count}`, 30, currentY);
        currentY += 8;
      });
    }
    
    // Condition breakdown
    doc.setFontSize(14);
    doc.setTextColor(0, 51, 102);
    doc.setFont('helvetica', 'bold');
    doc.text('Condition Severity', 20, currentY + 10);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    currentY += 20;
    if (stats.conditionBreakdown) {
      Object.entries(stats.conditionBreakdown).forEach(([condition, count]) => {
        doc.text(`${condition}: ${count}`, 30, currentY);
        currentY += 8;
      });
    }
  },
  
  addChartsPage(doc, visits) {
    const stats = this.calculateVisitStats(visits);
    
    // Page title
    doc.setFontSize(18);
    doc.setTextColor(0, 51, 102);
    doc.setFont('helvetica', 'bold');
    doc.text('Data Visualization', 20, 30);
    
    // Simple bar chart for dispositions
    doc.setFontSize(14);
    doc.text('Disposition Distribution', 20, 50);
    
    const chartX = 30;
    const chartY = 60;
    const chartWidth = 140;
    const chartHeight = 60;
    
    if (stats.dispositionBreakdown) {
      const dispositions = Object.entries(stats.dispositionBreakdown);
      const maxCount = Math.max(...dispositions.map(([_, count]) => count));
      const barWidth = chartWidth / dispositions.length;
      
      // Draw chart background
      doc.setDrawColor(200, 200, 200);
      doc.rect(chartX, chartY, chartWidth, chartHeight);
      
      // Draw bars
      dispositions.forEach(([disposition, count], index) => {
        const barHeight = (count / maxCount) * chartHeight;
        const barX = chartX + (index * barWidth);
        const barY = chartY + chartHeight - barHeight;
        
        const color = this.getDispositionColor(disposition);
        doc.setFillColor(...color);
        doc.rect(barX + 2, barY, barWidth - 4, barHeight, 'F');
        
        // Label
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        const label = this.formatDisposition(disposition).split(' ')[0];
        doc.text(label, barX + barWidth/2 - 5, chartY + chartHeight + 5);
      });
    }
  },
  
  addProfessionalVisitsTable(doc, visits) {
    if (visits.length === 0) return;
    
    const tableData = visits.map(visit => {
      const date = new Date(visit.date);
      const studentName = visit.student || `Student ${visit.studentId}`;
      const condition = this.getConditionFromVisit(visit);
      const disposition = this.formatDisposition(visit.disposition);
      
      return [
        date.toLocaleDateString(),
        studentName,
        `${visit.grade || ''} - ${visit.className || ''}`,
        visit.reason || 'N/A',
        condition,
        disposition
      ];
    });
    
    autoTable(doc, {
      startY: 30,
      head: [['Date', 'Student', 'Grade/Class', 'Reason', 'Condition', 'Outcome']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [0, 51, 102],
        textColor: 255,
        fontSize: 11,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 9,
        cellPadding: 4,
        overflow: 'linebreak',
        cellWidth: 'wrap'
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 35 },
        2: { cellWidth: 25 },
        3: { cellWidth: 35 },
        4: { cellWidth: 25 },
        5: { cellWidth: 35 }
      },
      margin: { left: 10, right: 10 },
      didDrawPage: (data) => {
        // Add page title
        if (data.pageNumber === 1) {
          doc.setFontSize(16);
          doc.setTextColor(0, 51, 102);
          doc.setFont('helvetica', 'bold');
          doc.text('Visit Records', 105, 20, { align: 'center' });
        }
      }
    });
  },
  
  addProfessionalFooter(doc) {
    const pageCount = doc.internal.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Footer line
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 282, 190, 282);
      
      // Page number
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
      
      // Confidential notice
      doc.setFontSize(8);
      doc.text('SYTE Infirmary Management System • Confidential Document', 105, 295, { align: 'center' });
    }
  },
  
  // Calculate visit statistics
  calculateVisitStats(visits) {
    if (!visits || visits.length === 0) {
      return {
        totalVisits: 0,
        uniqueStudents: 0,
        emergencyCases: 0,
        avgVisitsPerDay: 0,
        dispositionBreakdown: {},
        conditionBreakdown: {}
      };
    }
    
    const uniqueStudents = new Set(visits.map(v => v.studentId || v.student)).size;
    const emergencyCases = visits.filter(v => v.emergencyFlag).length;
    
    // Calculate visits per day
    const dates = visits.map(v => new Date(v.date).toDateString());
    const uniqueDates = new Set(dates).size;
    const avgVisitsPerDay = visits.length / (uniqueDates || 1);
    
    // Disposition breakdown
    const dispositionBreakdown = {};
    visits.forEach(visit => {
      const disposition = visit.disposition || 'UNKNOWN';
      dispositionBreakdown[disposition] = (dispositionBreakdown[disposition] || 0) + 1;
    });
    
    // Condition breakdown
    const conditionBreakdown = {};
    visits.forEach(visit => {
      const condition = this.getConditionFromVisit(visit);
      conditionBreakdown[condition] = (conditionBreakdown[condition] || 0) + 1;
    });
    
    return {
      totalVisits: visits.length,
      uniqueStudents,
      emergencyCases,
      avgVisitsPerDay,
      dispositionBreakdown,
      conditionBreakdown
    };
  },

  getDispositionColor(disposition) {
    const colors = {
      'RETURNED_TO_CLASS': [76, 175, 80],    // Green
      'SENT_HOME': [33, 150, 243],          // Blue
      'UNDER_OBSERVATION': [255, 193, 7],   // Yellow
      'REFERRED_TO_HOSPITAL': [244, 67, 54] // Red
    };
    return colors[disposition] || [158, 158, 158]; // Gray for unknown
  },
  
  // Helper methods
  getConditionFromVisit(visit) {
    const emergencyFlag = visit.original?.emergencyFlag || visit.emergencyFlag;
    const disposition = visit.original?.disposition || visit.disposition;
    
    if (emergencyFlag) return 'Critical';
    if (disposition === 'REFERRED_TO_HOSPITAL') return 'Serious';
    if (disposition === 'SENT_HOME') return 'Moderate';
    if (disposition === 'UNDER_OBSERVATION') return 'Moderate';
    return 'Stable';
  },
  
  formatDisposition(disposition) {
    const mapping = {
      'RETURNED_TO_CLASS': 'Returned to Class',
      'SENT_HOME': 'Sent Home',
      'UNDER_OBSERVATION': 'Under Observation',
      'REFERRED_TO_HOSPITAL': 'Referred to Hospital'
    };
    return mapping[disposition] || disposition || 'Unknown';
  },

  generateFileName(base, extension, filters) {
    const date = new Date().toISOString().split('T')[0];
    const time = new Date().toTimeString().split(' ')[0].replace(/:/g, '');
    return `${base}-report-${date}-${time}.${extension}`;
  },
  
  generateReportId() {
    const date = new Date();
    const timestamp = date.getTime().toString().slice(-6);
    return `RPT-${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}-${timestamp}`;
  },

  // CSV Export Method
  exportVisitsToCSV(visits, filters = {}) {
    try {
      if (!visits || visits.length === 0) {
        throw new Error('No visits to export');
      }
      
      // Prepare headers
      const headers = [
        'Date',
        'Student Name',
        'Grade',
        'Class',
        'Reason',
        'Condition',
        'Emergency',
        'Outcome',
        'Nurse',
        'Notes'
      ];
      
      // Prepare data rows
      const rows = visits.map(visit => {
        const date = new Date(visit.date);
        const condition = this.getConditionFromVisit(visit);
        const disposition = this.formatDisposition(visit.disposition);
        
        return [
          date.toLocaleDateString(),
          visit.student || `Student ${visit.studentId}`,
          visit.grade || 'N/A',
          visit.className || 'N/A',
          visit.reason || 'N/A',
          condition,
          visit.emergencyFlag ? 'Yes' : 'No',
          disposition,
          visit.nurseName || visit.nurse || 'N/A',
          visit.notes || ''
        ];
      });
      
      // Create CSV content
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => 
          typeof cell === 'string' ? `"${cell.replace(/"/g, '""')}"` : cell
        ).join(','))
      ].join('\n');
      
      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `visits-export-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      setTimeout(() => URL.revokeObjectURL(url), 100);
      
      console.log('CSV exported successfully');
      return true;
      
    } catch (error) {
      console.error('Error generating CSV:', error);
      throw new Error('Failed to generate CSV: ' + error.message);
    }
  },

  // Print Method
  async printVisitsTable(elementId = 'visits-table') {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error('Table element not found');
      }
      
      // Create print window
      const printWindow = window.open('', '_blank');
      
      printWindow.document.write(`
        <html>
          <head>
            <title>Visits Report - ${new Date().toLocaleDateString()}</title>
            <style>
              @media print {
                @page {
                  size: A4;
                  margin: 15mm;
                }
                body {
                  font-family: Arial, sans-serif;
                  font-size: 12pt;
                  line-height: 1.4;
                  color: #000;
                }
                h1 {
                  color: #2c3e50;
                  border-bottom: 2px solid #3498db;
                  padding-bottom: 10px;
                  margin-bottom: 20px;
                  text-align: center;
                }
                table {
                  width: 100%;
                  border-collapse: collapse;
                  margin: 20px 0;
                  font-size: 10pt;
                }
                th {
                  background-color: #3498db;
                  color: white;
                  padding: 8px;
                  text-align: left;
                  border: 1px solid #ddd;
                  font-weight: bold;
                }
                td {
                  padding: 6px;
                  border: 1px solid #ddd;
                  vertical-align: top;
                }
                tr:nth-child(even) {
                  background-color: #f9f9f9;
                }
                .print-info {
                  background-color: #f8f9fa;
                  padding: 10px;
                  border-radius: 4px;
                  margin-bottom: 20px;
                  font-size: 10pt;
                }
                .print-footer {
                  margin-top: 30px;
                  text-align: center;
                  font-size: 9pt;
                  color: #666;
                  border-top: 1px solid #ddd;
                  padding-top: 10px;
                }
              }
            </style>
          </head>
          <body>
            <h1>Visit Records Report</h1>
            
            <div class="print-info">
              <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
              <p><strong>System:</strong> SYTE Infirmary Management System</p>
            </div>
            
            ${element.outerHTML}
            
            <div class="print-footer">
              <p>Confidential Medical Document - Page 1 of 1</p>
              <p>For authorized personnel only</p>
            </div>
            
            <script>
              // Auto-print when loaded
              window.onload = function() {
                setTimeout(() => {
                  window.print();
                  setTimeout(() => window.close(), 100);
                }, 500);
              };
            </script>
          </body>
        </html>
      `);
      
      printWindow.document.close();
      
      return true;
      
    } catch (error) {
      console.error('Error printing:', error);
      throw new Error('Failed to print: ' + error.message);
    }
  }
};

export default exportService;