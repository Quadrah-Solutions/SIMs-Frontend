import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const pdfExportService = {
  
  // Generate comprehensive PDF report
  async generateAnalyticsReport(data, filters) {
    try {
      const { 
        dashboardStats, 
        visitStats, 
        visitSummary, 
        trends, 
        frequentVisitors, 
        medicationUsage 
      } = data;
      
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Add logo at the top
      await this.addLogo(doc);
      
      // Add header
      this.addHeader(doc, filters);
      
      // Add dashboard statistics
      this.addDashboardStats(doc, dashboardStats);
      
      // Add visit summary
      this.addVisitSummary(doc, visitSummary);
      
      // Add trend analysis chart
      await this.addTrendChart(doc, trends);
      
      // Add visits by disposition
      this.addVisitsByDisposition(doc, visitStats);
      
      // Add footer
      this.addFooter(doc);
      
      // Save the PDF
      const fileName = this.generateFileName(filters);
      doc.save(fileName);
      
      return fileName;
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF report');
    }
  },
  
  // Add logo to PDF
  async addLogo(doc) {
    try {
      // Load the logo image from public/images folder
      const logoUrl = '/images/school-logo.png';
      
      // Create an image object
      const logoImage = new Image();
      logoImage.crossOrigin = 'Anonymous'; // For CORS if needed
      logoImage.src = logoUrl;
      
      // Wait for image to load
      await new Promise((resolve, reject) => {
        logoImage.onload = resolve;
        logoImage.onerror = reject;
        
        // Set timeout for safety
        setTimeout(() => {
          if (!logoImage.complete) {
            reject(new Error('Logo loading timeout'));
          }
        }, 3000);
      });
      
      // Add logo to PDF (positioned as a badge at top)
      const logoWidth = 30; // Width in mm
      const logoHeight = 30; // Height in mm
      const logoX = 20; // Left margin
      const logoY = 15; // From top
      
      // Convert image to data URL
      const canvas = document.createElement('canvas');
      canvas.width = logoImage.width;
      canvas.height = logoImage.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(logoImage, 0, 0);
      const logoDataUrl = canvas.toDataURL('image/png');
      
      // Add to PDF
      doc.addImage(logoDataUrl, 'PNG', logoX, logoY, logoWidth, logoHeight);
      
      // Add a badge-like circle around the logo (optional)
      doc.setDrawColor(0, 0, 128); // Dark blue border
      doc.setLineWidth(0.5);
      doc.circle(logoX + logoWidth/2, logoY + logoHeight/2, logoWidth/2 + 2);
      
    } catch (error) {
      console.warn('Could not load logo, proceeding without it:', error);
      // Continue without logo if there's an error
    }
  },
  
  // Generate filename based on filters
  generateFileName(filters) {
    const date = new Date().toISOString().split('T')[0];
    const dateRange = filters.dateRange || 'report';
    return `Infirmary_Report_${dateRange}_${date}.pdf`;
  },
  
  // Add header section (modified to accommodate logo)
  addHeader(doc, filters) {
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 128); // Dark blue
    doc.setFont('helvetica', 'bold');
    
    // Move header text to the right to accommodate logo
    doc.text('Syte Infirmary Managememt Report', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    
    // Date range info (adjusted position)
    const dateRangeText = this.formatDateRange(filters.dateRange);
    doc.text(`Period: ${dateRangeText}`, 60, 35); // Moved right to avoid logo
    
    // Generated date
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 60, 42);
    
    // Page number
    doc.setFontSize(10);
    doc.text(`Page 1 of 1`, 180, 290, { align: 'right' });
    
    // Separator line (moved down)
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 52, 190, 52); // Moved down from 47 to 52
  },
  
  // Format date range for display
  formatDateRange(dateRange) {
    const now = new Date();
    switch(dateRange) {
      case 'last_7_days':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return `${weekAgo.toLocaleDateString()} - ${now.toLocaleDateString()}`;
      case 'last_30_days':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return `${monthAgo.toLocaleDateString()} - ${now.toLocaleDateString()}`;
      case 'last_90_days':
        const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        return `${quarterAgo.toLocaleDateString()} - ${now.toLocaleDateString()}`;
      case 'this_year':
        const yearStart = new Date(now.getFullYear(), 0, 1);
        return `${yearStart.toLocaleDateString()} - ${now.toLocaleDateString()}`;
      default:
        return 'Custom Date Range';
    }
  },
  
  // Add dashboard statistics section (adjusted positions)
  addDashboardStats(doc, dashboardStats) {
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('Dashboard Overview', 20, 65); // Moved down from 60 to 65
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    const stats = [
      { label: 'Total Visits', value: dashboardStats.totalVisits || 0, y: 75 },
      { label: 'Total Students', value: dashboardStats.totalStudents || 0, y: 82 },
      { label: 'Medications Administered', value: dashboardStats.totalMedications || 0, y: 89 },
      { label: 'Emergency Cases', value: dashboardStats.totalEmergencies || 0, y: 96 }
    ];
    
    stats.forEach(stat => {
      doc.text(`${stat.label}:`, 20, stat.y);
      doc.setFont('helvetica', 'bold');
      doc.text(`${stat.value}`, 80, stat.y);
      doc.setFont('helvetica', 'normal');
    });
    
    // Add a simple bar chart visualization (adjusted position)
    this.addMiniBarChart(doc, dashboardStats, 120, 70); // Moved down from 65 to 70
  },
  
  // Add mini bar chart for dashboard stats
  addMiniBarChart(doc, stats, x, y) {
    const maxValue = Math.max(
      stats.totalVisits || 0,
      stats.totalStudents || 0,
      stats.totalMedications || 0,
      stats.totalEmergencies || 0
    );
    
    const barHeight = 4;
    const barWidth = 50;
    
    // Draw bars
    const metrics = [
      { label: 'Visits', value: stats.totalVisits || 0, color: [66, 135, 245] },
      { label: 'Students', value: stats.totalStudents || 0, color: [52, 168, 83] },
      { label: 'Meds', value: stats.totalMedications || 0, color: [155, 81, 224] },
      { label: 'Emerg', value: stats.totalEmergencies || 0, color: [234, 67, 53] }
    ];
    
    metrics.forEach((metric, index) => {
      const barX = x;
      const barY = y + (index * 10);
      const normalizedWidth = (metric.value / maxValue) * barWidth;
      
      // Draw bar
      doc.setFillColor(...metric.color);
      doc.rect(barX, barY, normalizedWidth, barHeight, 'F');
      
      // Draw label
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.text(metric.label, barX - 15, barY + 3);
      doc.text(metric.value.toString(), barX + barWidth + 5, barY + 3);
    });
  },
  
  // Add visit summary table (adjusted positions)
  addVisitSummary(doc, visitSummary) {
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('Visit Summary', 20, 115); // Moved down from 110 to 115
    
    // Table headers
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Visit Type', 20, 125); // Moved down
    doc.text('Count', 100, 125);
    doc.text('Change', 140, 125);
    
    // Table rows
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    const items = visitSummary || [];
    items.forEach((item, index) => {
      const y = 132 + (index * 7); // Moved down
      doc.text(item.type || 'N/A', 20, y);
      doc.text((item.count || 0).toString(), 100, y);
      
      // Color code changes
      if (item.change && item.change.startsWith('+')) {
        doc.setTextColor(52, 168, 83); // Green
      } else if (item.change && item.change.startsWith('-')) {
        doc.setTextColor(234, 67, 53); // Red
      } else {
        doc.setTextColor(95, 99, 104); // Gray
      }
      doc.text(item.change || '0%', 140, y);
      doc.setTextColor(0, 0, 0); // Reset to black
    });
    
    // Draw table lines
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 127, 190, 127); // Header line
    if (items.length > 0) {
      const bottomY = 132 + (items.length * 7);
      doc.line(20, bottomY, 190, bottomY); // Bottom line
    }
  },
  
  // Add trend chart (simplified version) (adjusted positions)
  async addTrendChart(doc, trends) {
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('Monthly Trends', 20, 175); // Moved down from 170 to 175
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Clinic visits and incidents over time', 20, 182); // Moved down
    
    // Draw a simple chart
    const chartData = trends || [];
    if (chartData.length > 0) {
      const chartX = 20;
      const chartY = 190; // Moved down from 185
      const chartWidth = 160;
      const chartHeight = 50;
      
      // Draw chart border
      doc.setDrawColor(100, 100, 100);
      doc.rect(chartX, chartY, chartWidth, chartHeight);
      
      // Find max value for scaling
      const maxVisits = Math.max(...chartData.map(d => d.visits || 0));
      const maxIncidents = Math.max(...chartData.map(d => d.incidents || 0));
      const maxValue = Math.max(maxVisits, maxIncidents) * 1.1;
      
      // Draw grid lines
      doc.setDrawColor(220, 220, 220);
      for (let i = 1; i < 5; i++) {
        const gridY = chartY + (i * chartHeight / 5);
        doc.line(chartX, gridY, chartX + chartWidth, gridY);
      }
      
      // Draw data points and lines for visits
      doc.setDrawColor(66, 135, 245); // Blue for visits
      doc.setFillColor(66, 135, 245);
      
      const pointSize = 2;
      const visitsPoints = [];
      
      chartData.forEach((data, index) => {
        const x = chartX + (index * chartWidth / (chartData.length - 1));
        const y = chartY + chartHeight - ((data.visits || 0) / maxValue * chartHeight);
        visitsPoints.push({ x, y });
        
        // Draw point
        doc.circle(x, y, pointSize, 'F');
        
        // Draw month label
        if (index % 2 === 0) { // Show every other month to avoid clutter
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          doc.text(data.month || '', x - 5, chartY + chartHeight + 5);
        }
      });
      
      // Connect visits points
      for (let i = 1; i < visitsPoints.length; i++) {
        doc.line(visitsPoints[i-1].x, visitsPoints[i-1].y, visitsPoints[i].x, visitsPoints[i].y);
      }
      
      // Draw legend
      doc.setFontSize(9);
      doc.setTextColor(66, 135, 245);
      doc.text('● Visits', chartX + 5, chartY + chartHeight + 15);
      doc.setTextColor(255, 153, 51);
      doc.text('● Incidents', chartX + 40, chartY + chartHeight + 15);
    } else {
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text('No trend data available', 30, 205); // Moved down
    }
  },
  
  // Add visits by disposition section (adjusted positions)
  addVisitsByDisposition(doc, visitStats) {
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('Visits by Disposition', 20, 255); // Moved down from 250
    
    const stats = visitStats || {};
    const dispositions = [
      { key: 'RETURNED_TO_CLASS', label: 'Returned to Class', color: [52, 168, 83] },
      { key: 'SENT_HOME', label: 'Sent Home', color: [66, 135, 245] },
      { key: 'UNDER_OBSERVATION', label: 'Under Observation', color: [255, 193, 7] },
      { key: 'REFERRED_TO_HOSPITAL', label: 'Referred to Hospital', color: [234, 67, 53] }
    ];
    
    let currentY = 265; // Moved down from 260
    dispositions.forEach(disposition => {
      const count = stats[disposition.key] || 0;
      
      // Draw colored dot
      doc.setFillColor(...disposition.color);
      doc.circle(20, currentY - 1, 2, 'F');
      
      // Draw label and count
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.text(disposition.label, 28, currentY);
      doc.setFont('helvetica', 'bold');
      doc.text(count.toString(), 120, currentY);
      
      currentY += 7;
    });
  },
  
  // Add footer
  addFooter(doc) {
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'italic');
    doc.text('Syte Infirmary Management System - Confidential Report', 105, 285, { align: 'center' });
  },
  
  // Alternative: Capture HTML content as image (for complex charts)
  async generateReportFromHTML(elementId, filters) {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error('Report element not found');
      }
      
      // Hide buttons and controls before capture
      const originalDisplay = {};
      const controls = element.querySelectorAll('.no-print, button, .filter-controls');
      controls.forEach(control => {
        originalDisplay[control.id] = control.style.display;
        control.style.display = 'none';
      });
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      // Restore original display
      controls.forEach(control => {
        if (originalDisplay[control.id] !== undefined) {
          control.style.display = originalDisplay[control.id];
        }
      });
      
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const doc = new jsPDF('p', 'mm', 'a4');
      
      // Add logo first
      await this.addLogo(doc);
      
      // Calculate how many pages needed
      let heightLeft = imgHeight;
      let position = 0;
      
      // Adjust position to account for logo
      position = 50; // Start after logo
      
      doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // Add additional pages if content is longer than one page
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        doc.addPage();
        doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      const fileName = this.generateFileName(filters);
      doc.save(fileName);
      
      return fileName;
      
    } catch (error) {
      console.error('Error generating HTML-based report:', error);
      throw error;
    }
  }
};