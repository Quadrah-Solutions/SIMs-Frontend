import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';

// src/services/exportService.js

const exportService = {
  
  // Export visits to PDF (Simplified version that triggers browser's print to PDF)
  async exportVisitsToPDF(visits, filters = {}) {
    try {
      console.log('Exporting to PDF:', { visitsCount: visits?.length || 0, filters });
      
      // Create a printable HTML document
      const printWindow = window.open('', '_blank');
      
      const htmlContent = `
        <html>
          <head>
            <title>Visits Report - ${new Date().toLocaleDateString()}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 40px;
                color: #333;
              }
              h1 {
                color: #2c3e50;
                border-bottom: 2px solid #3498db;
                padding-bottom: 10px;
                text-align: center;
              }
              .report-info {
                background-color: #f8f9fa;
                padding: 15px;
                border-radius: 5px;
                margin-bottom: 20px;
                border-left: 4px solid #3498db;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
              }
              th {
                background-color: #3498db;
                color: white;
                padding: 12px;
                text-align: left;
                border: 1px solid #ddd;
              }
              td {
                padding: 10px;
                border: 1px solid #ddd;
              }
              tr:nth-child(even) {
                background-color: #f9f9f9;
              }
              .badge {
                display: inline-block;
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: bold;
              }
              .critical { background-color: #ffebee; color: #c62828; }
              .serious { background-color: #fff3e0; color: #ef6c00; }
              .moderate { background-color: #fff8e1; color: #f9a825; }
              .stable { background-color: #e8f5e9; color: #2e7d32; }
              .emergency { background-color: #ffcdd2; color: #b71c1c; font-weight: bold; }
              .footer {
                margin-top: 40px;
                text-align: center;
                color: #7f8c8d;
                font-size: 12px;
                border-top: 1px solid #ecf0f1;
                padding-top: 10px;
              }
              @media print {
                body { margin: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <h1>Visit Records</h1>
            
            <div class="report-info">
              <p><strong>Report Generated:</strong> ${new Date().toLocaleString()}</p>
              ${filters.dateFrom || filters.dateTo ? 
                `<p><strong>Date Range:</strong> ${filters.dateFrom || 'Start'} to ${filters.dateTo || 'End'}</p>` : ''}
              ${filters.grade ? `<p><strong>Grade:</strong> ${filters.grade}</p>` : ''}
              ${filters.className ? `<p><strong>Class:</strong> ${filters.className}</p>` : ''}
              <p><strong>Total Records:</strong> ${visits?.length || 0}</p>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Student</th>
                  <th>Grade/Class</th>
                  <th>Reason</th>
                  <th>Condition</th>
                  <th>Outcome</th>
                </tr>
              </thead>
              <tbody>
                ${(visits || []).map(visit => {
                  const condition = this.getConditionFromVisit(visit);
                  const disposition = this.formatDisposition(visit.disposition);
                  const date = new Date(visit.date);
                  
                  return `
                    <tr>
                      <td>
                        ${date.toLocaleDateString()}<br>
                        <small>${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                      </td>
                      <td>${visit.student || 'Unknown Student'}</td>
                      <td>${visit.grade || 'N/A'} - ${visit.className || 'N/A'}</td>
                      <td>${visit.reason || 'N/A'}</td>
                      <td>
                        <span class="badge ${condition.toLowerCase()}">
                          ${condition}
                          ${visit.emergencyFlag ? ' <span class="emergency">EMERGENCY</span>' : ''}
                        </span>
                      </td>
                      <td>${disposition}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
            
            <div class="footer">
              <p>Confidential Medical Report - For authorized personnel only</p>
              <p>Generated by Syte Infirmary Management System</p>
            </div>
            
            <script>
              // Auto-print after a short delay
              setTimeout(() => {
                window.print();
                setTimeout(() => window.close(), 100);
              }, 500);
            </script>
          </body>
        </html>
      `;
      
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      const fileName = `visits-report-${new Date().toISOString().split('T')[0]}.pdf`;
      console.log('PDF generation initiated:', fileName);
      
      return fileName;
      
    } catch (error) {
      console.error('Error in PDF export:', error);
      throw new Error('Failed to generate PDF');
    }
  },
  
  // Export visits to CSV
  exportVisitsToCSV(visits, filters = {}) {
    try {
      if (!visits || visits.length === 0) {
        throw new Error('No visits to export');
      }
      
      // Prepare headers
      const headers = [
        'ID',
        'Date',
        'Time',
        'Student Name',
        'Grade',
        'Class',
        'Reason',
        'Condition',
        'Emergency',
        'Outcome',
        'Medications',
        'Treatments'
      ];
      
      // Prepare data rows
      const rows = visits.map(visit => {
        const condition = this.getConditionFromVisit(visit);
        const disposition = this.formatDisposition(visit.disposition);
        const date = new Date(visit.date);
        
        // Get medications and treatments
        const getVisitData = (key) => visit.original?.[key] ?? visit[key];
        const medications = getVisitData('medications') || [];
        const treatments = getVisitData('treatments') || [];
        
        const medText = medications.map(m => 
          `${m.medicationName || m.medication?.medicationName || 'Medication'}: ${m.dosage || 'N/A'}`
        ).join('; ');
        
        const treatmentText = treatments.map(t => 
          `${t.treatmentName}${t.description ? ` - ${t.description}` : ''}`
        ).join('; ');
        
        return [
          visit.id,
          date.toLocaleDateString(),
          date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          visit.student || `Student ${visit.studentId}`,
          visit.grade || 'N/A',
          visit.className || 'N/A',
          visit.reason || 'N/A',
          condition,
          visit.emergencyFlag ? 'Yes' : 'No',
          disposition,
          medText,
          treatmentText
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
      link.setAttribute('download', `visits-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return true;
      
    } catch (error) {
      console.error('Error generating CSV:', error);
      throw new Error('Failed to generate CSV');
    }
  },
  
  // Print visits table
  async printVisitsTable(elementId = 'visits-table') {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error('Table element not found');
      }
      
      // Clone the element to avoid modifying the original
      const printElement = element.cloneNode(true);
      
      // Remove action buttons from the clone
      const buttons = printElement.querySelectorAll('button');
      buttons.forEach(button => button.remove());
      
      // Create print window
      const printWindow = window.open('', '_blank');
      
      printWindow.document.write(`
        <html>
          <head>
            <title>Visits Report</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 40px;
              }
              h1 {
                text-align: center;
                color: #2c3e50;
                border-bottom: 2px solid #3498db;
                padding-bottom: 10px;
                margin-bottom: 30px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
              }
              th {
                background-color: #3498db;
                color: white;
                padding: 12px;
                text-align: left;
                border: 1px solid #ddd;
              }
              td {
                padding: 10px;
                border: 1px solid #ddd;
              }
              tr:nth-child(even) {
                background-color: #f9f9f9;
              }
              .print-footer {
                margin-top: 40px;
                text-align: center;
                color: #7f8c8d;
                font-size: 12px;
              }
              @media print {
                body { margin: 0; }
              }
            </style>
          </head>
          <body>
            <h1>Visit Records Report</h1>
            <p><strong>Generated on:</strong> ${new Date().toLocaleString()}</p>
            ${printElement.outerHTML}
            <div class="print-footer">
              <p>Confidential Medical Report - Page 1 of 1</p>
            </div>
          </body>
        </html>
      `);
      
      printWindow.document.close();
      
      // Wait for content to load then print
      setTimeout(() => {
        printWindow.print();
        setTimeout(() => printWindow.close(), 100);
      }, 500);
      
      return true;
      
    } catch (error) {
      console.error('Error printing:', error);
      throw new Error('Failed to print');
    }
  },
  
  // Capture table as image
  async captureTableAsImage(elementId = 'visits-table', filters = {}) {
    try {
      alert('For a complete screenshot feature, please install html2canvas library:\n\nnpm install html2canvas\n\nFor now, using print to PDF is recommended.');
      
      // Fallback to PDF export
      return await this.exportVisitsToPDF([], filters);
      
    } catch (error) {
      console.error('Error capturing image:', error);
      throw new Error('Please install html2canvas for screenshot functionality');
    }
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
  }
};

export default exportService;
