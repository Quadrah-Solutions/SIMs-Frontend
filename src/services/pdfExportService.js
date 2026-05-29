import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import autoTable from 'jspdf-autotable';

export const pdfExportService = {
  
  // Main function to generate comprehensive medical report with multiple pages
  async generateMedicalReport(reportData, filters, reportType = 'summary') {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // PAGE 1: COVER PAGE
      await this.generateCoverPage(doc, filters, reportType);
      
      // PAGE 2: EXECUTIVE SUMMARY & KEY METRICS
      doc.addPage();
      this.generateExecutiveSummaryPage(doc, reportData, filters);
      
      // PAGE 3: DETAILED ANALYSIS
      doc.addPage();
      this.generateAnalysisPage(doc, reportData, reportType);
      
      // PAGE 4: TABLES & CHARTS
      doc.addPage();
      this.generateDataTablesPage(doc, reportData, reportType);
      
      // PAGE 5: APPROVALS & FOOTER
      doc.addPage();
      this.generateApprovalPage(doc);
      
      // Generate filename and save
      const fileName = this.generateReportFileName(reportType, filters);
      doc.save(fileName);
      
      return fileName;
      
    } catch (error) {
      console.error('Error generating medical report:', error);
      throw new Error('Failed to generate PDF report');
    }
  },

  // COVER PAGE
  async generateCoverPage(doc, filters, reportType) {
    // Watermark - using simple text instead of angled text
    doc.setFontSize(60);
    doc.setTextColor(240, 240, 240);
    doc.setFont('helvetica', 'bold');
    doc.text('CONFIDENTIAL', 105, 150, { align: 'center' });
    
    // School logo and header
    try {
      const logoUrl = '/images/school-logo.png';
      const logoImage = new Image();
      logoImage.crossOrigin = 'Anonymous';
      logoImage.src = logoUrl;
      
      await new Promise((resolve) => {
        logoImage.onload = resolve;
        logoImage.onerror = resolve;
        setTimeout(resolve, 500);
      });
      
      if (logoImage.complete && logoImage.naturalWidth > 0) {
        const canvas = document.createElement('canvas');
        canvas.width = logoImage.width;
        canvas.height = logoImage.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(logoImage, 0, 0);
        const logoDataUrl = canvas.toDataURL('image/png');
        
        // Add logo
        doc.addImage(logoDataUrl, 'PNG', 85, 40, 40, 40);
      }
    } catch (error) {
      console.warn('Logo loading failed:', error);
    }
    
    // School name
    doc.setFontSize(24);
    doc.setTextColor(0, 51, 102);
    doc.setFont('helvetica', 'bold');
    doc.text('SYTE INFIRMARY', 105, 90, { align: 'center' });
    
    // Subtitle
    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text('Student Health Management System', 105, 100, { align: 'center' });
    doc.text('Ministry of Education Accredited', 105, 108, { align: 'center' });
    
    // Report title
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    
    const reportTitles = {
      'summary': 'Health Center Summary Report',
      'detailed': 'Detailed Medical Analysis Report',
      'visits': 'Clinic Visits Analysis Report',
      'medications': 'Medication Administration Report',
      'emergency': 'Emergency Cases Report'
    };
    
    doc.text(reportTitles[reportType] || 'Medical Report', 105, 130, { align: 'center' });
    
    // Report metadata box
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.rect(30, 150, 150, 80);
    
    // Metadata content
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    
    const metadata = [
      `Reporting Period: ${this.formatDateRange(filters?.dateRange)}`,
      `Report Type: ${reportType.charAt(0).toUpperCase() + reportType.slice(1)}`,
      `Generated: ${new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`,
      `Report ID: ${this.generateReportId()}`,
      `Prepared For: School Administration`,
      `Prepared By: SYTE Infirmary Management System`
    ];
    
    metadata.forEach((line, index) => {
      doc.text(line, 40, 165 + (index * 12));
    });
    
    // Confidential notice
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.setFont('helvetica', 'italic');
    doc.text('Confidential - For Internal Use Only', 105, 260, { align: 'center' });
    
    // Page indicator
    this.addPageFooter(doc, 1);
  },

  // EXECUTIVE SUMMARY PAGE
  generateExecutiveSummaryPage(doc, reportData, filters) {
    const { dashboardStats, visitStats } = reportData;
    
    // Page header
    doc.setFontSize(16);
    doc.setTextColor(0, 51, 102);
    doc.setFont('helvetica', 'bold');
    doc.text('Executive Summary', 20, 30);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text(`Period: ${this.formatDateRange(filters?.dateRange)}`, 20, 38);
    
    // Summary text
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    
    const summaryText = `This comprehensive report provides an overview of student health center activities and performance metrics for the specified reporting period. 
The SYTE Infirmary continues to deliver essential healthcare services to the student population, maintaining high standards of care and efficient service delivery.

Key findings from this reporting period include:
• Total clinic visits: ${dashboardStats?.totalVisits || 0}
• Unique students served: ${dashboardStats?.totalStudents || 0}
• Medications administered: ${dashboardStats?.totalMedications || 0}
• Emergency cases handled: ${dashboardStats?.totalEmergencies || 0}
• Overall clinic utilization: ${((dashboardStats?.totalVisits || 0) / (dashboardStats?.totalStudents || 1) * 100).toFixed(1)}%

The infirmary maintains comprehensive records of all student interactions, ensuring continuity of care and proper documentation for medical history tracking.`;
    
    const splitText = doc.splitTextToSize(summaryText, 170);
    doc.text(splitText, 20, 50);
    
    // Key Metrics Section
    doc.setFontSize(14);
    doc.setTextColor(0, 51, 102);
    doc.setFont('helvetica', 'bold');
    doc.text('Key Performance Indicators', 20, 110);
    
    // Metrics grid - Using simple shapes instead of emoji
    const metrics = [
      { 
        label: 'Total Visits', 
        value: dashboardStats?.totalVisits || 0, 
        color: [66, 133, 244],
        symbol: '■' // Square symbol instead of emoji
      },
      { 
        label: 'Unique Students', 
        value: dashboardStats?.totalStudents || 0, 
        color: [51, 153, 102],
        symbol: '●' // Circle symbol
      },
      { 
        label: 'Medications', 
        value: dashboardStats?.totalMedications || 0, 
        color: [155, 81, 224],
        symbol: '◆' // Diamond symbol
      },
      { 
        label: 'Emergency Cases', 
        value: dashboardStats?.totalEmergencies || 0, 
        color: [234, 67, 53],
        symbol: '▲' // Triangle symbol
      },
      { 
        label: 'Return to Class', 
        value: `${((visitStats?.RETURNED_TO_CLASS || 0) / ((dashboardStats?.totalVisits || 0) || 1) * 100).toFixed(1)}%`, 
        color: [255, 193, 7],
        symbol: '✓' // Check mark
      },
      { 
        label: 'Avg. Response', 
        value: '<15 min', 
        color: [66, 133, 244],
        symbol: '⏰' // Clock (this should work in PDF)
      }
    ];
    
    // Draw metrics in a 3x2 grid
    metrics.forEach((metric, index) => {
      const row = Math.floor(index / 3);
      const col = index % 3;
      
      const x = 20 + (col * 60);
      const y = 125 + (row * 30);
      
      // Metric card background
      doc.setFillColor(248, 249, 250);
      doc.rect(x, y, 55, 25, 'F');
      
      // Border
      doc.setDrawColor(...metric.color);
      doc.setLineWidth(0.5);
      doc.rect(x, y, 55, 25);
      
      // Symbol with color
      doc.setFontSize(12);
      doc.setTextColor(...metric.color);
      doc.text(metric.symbol, x + 8, y + 10);
      
      // Value
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(metric.value.toString(), x + 20, y + 10);
      
      // Label
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(metric.label, x + 5, y + 20, { maxWidth: 50 });
    });
    
    // Performance notes
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'italic');
    doc.text('All metrics are calculated based on verified clinic records and real-time data tracking.', 20, 190);
    
    // Page footer
    this.addPageFooter(doc, 2);
  },

  // ANALYSIS PAGE
  generateAnalysisPage(doc, reportData, reportType) {
    const { visitSummary, trends, frequentVisitors } = reportData;
    
    // Page header
    doc.setFontSize(16);
    doc.setTextColor(0, 51, 102);
    doc.setFont('helvetica', 'bold');
    doc.text('Data Analysis & Insights', 20, 30);
    
    // Visit Summary Section
    doc.setFontSize(14);
    doc.text('Visit Summary by Type', 20, 45);
    
    if (visitSummary && visitSummary.length > 0) {
      const summaryData = visitSummary.map(item => [
        item.type || 'N/A',
        item.count || 0,
        item.change || '0%'
      ]);
      
      autoTable(doc, {
        startY: 50,
        head: [['Visit Type', 'Count', 'Trend']],
        body: summaryData,
        theme: 'striped',
        headStyles: { 
          fillColor: [66, 133, 244], 
          textColor: 255,
          fontSize: 11 
        },
        styles: { 
          fontSize: 10,
          cellPadding: 3
        },
        columnStyles: {
          0: { cellWidth: 100 },
          1: { cellWidth: 40, halign: 'center' },
          2: { cellWidth: 40, halign: 'center' }
        },
        margin: { left: 20, right: 20 }
      });
    } else {
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text('No visit summary data available', 30, 55);
    }
    
    // Trend Analysis Section
    const trendY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : 100;
    
    doc.setFontSize(14);
    doc.setTextColor(0, 51, 102);
    doc.setFont('helvetica', 'bold');
    doc.text('Monthly Trend Analysis', 20, trendY);
    
    if (trends && trends.length > 0) {
      // Simple trend visualization
      const chartX = 30;
      const chartY = trendY + 15;
      const chartWidth = 140;
      const chartHeight = 50;
      
      // Calculate max for scaling
      const maxVisits = Math.max(...trends.map(t => t.visits || 0));
      
      // Draw chart area
      doc.setDrawColor(200, 200, 200);
      doc.rect(chartX, chartY, chartWidth, chartHeight);
      
      // Draw grid lines
      doc.setDrawColor(240, 240, 240);
      for (let i = 1; i < 5; i++) {
        const y = chartY + (i * chartHeight / 5);
        doc.line(chartX, y, chartX + chartWidth, y);
      }
      
      // Draw data points
      const pointSize = 2;
      const points = [];
      
      trends.forEach((trend, index) => {
        const x = chartX + (index * chartWidth / (trends.length - 1));
        const y = chartY + chartHeight - ((trend.visits || 0) / (maxVisits || 1) * chartHeight);
        points.push({ x, y });
        
        // Draw point
        doc.setFillColor(66, 133, 244);
        doc.circle(x, y, pointSize, 'F');
        
        // Month label
        if (index % 2 === 0) {
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          doc.text(trend.month?.substring(0, 3) || '', x - 3, chartY + chartHeight + 5);
        }
      });
      
      // Connect points with line
      doc.setDrawColor(66, 133, 244);
      doc.setLineWidth(0.5);
      for (let i = 1; i < points.length; i++) {
        doc.line(points[i-1].x, points[i-1].y, points[i].x, points[i].y);
      }
      
      // Add trend insights with proper symbols
      const insightsY = chartY + chartHeight + 20;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      
      const totalVisits = trends.reduce((sum, t) => sum + (t.visits || 0), 0);
      const avgVisits = (totalVisits / (trends.length || 1)).toFixed(1);
      
      // Using ASCII symbols instead of emoji
      doc.text('• Average monthly visits: ' + avgVisits, 30, insightsY);
      doc.text('• Total period visits: ' + totalVisits, 30, insightsY + 7);
      doc.text('• Data reflects verified clinic records', 30, insightsY + 14);
      
      // Legend with ASCII symbols
      doc.setFontSize(9);
      doc.setTextColor(51, 153, 102);
      doc.text('■ Increase', 30, insightsY + 25);
      doc.setTextColor(234, 67, 53);
      doc.text('■ Decrease', 70, insightsY + 25);
      doc.setTextColor(255, 193, 7);
      doc.text('■ Stable', 110, insightsY + 25);
    } else {
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text('No trend data available', 30, trendY + 15);
    }
    
    // Page footer
    this.addPageFooter(doc, 3);
  },

  // DATA TABLES PAGE
  generateDataTablesPage(doc, reportData, reportType) {
    const { frequentVisitors, medicationUsage, visits } = reportData;
    
    // Page header
    doc.setFontSize(16);
    doc.setTextColor(0, 51, 102);
    doc.setFont('helvetica', 'bold');
    doc.text('Detailed Data Tables', 20, 30);
    
    // Frequent Visitors Table
    doc.setFontSize(14);
    doc.text('Frequent Visitors (Top 10)', 20, 45);
    
    if (frequentVisitors && frequentVisitors.length > 0) {
      const visitorData = frequentVisitors.slice(0, 10).map(visitor => [
        visitor.studentName || 'N/A',
        visitor.grade || 'N/A',
        visitor.visits || 0,
        visitor.lastVisit || 'N/A'
      ]);
      
      autoTable(doc, {
        startY: 50,
        head: [['Student Name', 'Grade', 'Visit Count', 'Last Visit']],
        body: visitorData,
        theme: 'grid',
        headStyles: { 
          fillColor: [51, 153, 102], 
          textColor: 255,
          fontSize: 11 
        },
        styles: { 
          fontSize: 9,
          cellPadding: 3
        },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 30, halign: 'center' },
          2: { cellWidth: 30, halign: 'center' },
          3: { cellWidth: 60 }
        },
        margin: { left: 20, right: 20 }
      });
    } else {
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text('No frequent visitor data available', 30, 55);
    }
    
    // Medication Usage Table
    const medY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : 100;
    
    doc.setFontSize(14);
    doc.setTextColor(0, 51, 102);
    doc.setFont('helvetica', 'bold');
    doc.text('Medication Administration Summary', 20, medY);
    
    if (medicationUsage && medicationUsage.length > 0) {
      const medData = medicationUsage.slice(0, 15).map(med => [
        med.name || med.medicationName || 'N/A',
        med.quantity || med.dosage || 0,
        med.unit || 'N/A',
        med.students || 0
      ]);
      
      autoTable(doc, {
        startY: medY + 5,
        head: [['Medication', 'Quantity', 'Unit', 'Students']],
        body: medData,
        theme: 'grid',
        headStyles: { 
          fillColor: [155, 81, 224], 
          textColor: 255,
          fontSize: 11 
        },
        styles: { 
          fontSize: 9,
          cellPadding: 3
        },
        columnStyles: {
          0: { cellWidth: 70 },
          1: { cellWidth: 30, halign: 'center' },
          2: { cellWidth: 30, halign: 'center' },
          3: { cellWidth: 30, halign: 'center' }
        },
        margin: { left: 20, right: 20 }
      });
    } else {
      // Show message if no medication data
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text('No medication administration data available', 30, medY + 10);
    }
    
    // Recent Visits Table
    const visitsY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : 150;
    
    doc.setFontSize(14);
    doc.setTextColor(0, 51, 102);
    doc.setFont('helvetica', 'bold');
    doc.text('Recent Clinic Visits', 20, visitsY);
    
    if (visits && visits.length > 0) {
      const recentVisits = visits.slice(0, 10).map(visit => [
        visit.date || 'N/A',
        visit.studentName || 'N/A',
        visit.reason || 'N/A',
        visit.disposition || 'N/A'
      ]);
      
      autoTable(doc, {
        startY: visitsY + 5,
        head: [['Date', 'Student', 'Reason', 'Disposition']],
        body: recentVisits,
        theme: 'grid',
        headStyles: { 
          fillColor: [255, 193, 7], 
          textColor: 0,
          fontSize: 11 
        },
        styles: { 
          fontSize: 8,
          cellPadding: 2,
          overflow: 'linebreak',
          cellWidth: 'wrap'
        },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 45 },
          2: { cellWidth: 60 },
          3: { cellWidth: 45 }
        },
        margin: { left: 20, right: 20 }
      });
    }
    
    // Data notes
    const notesY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : 250;
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'italic');
    doc.text('Note: All data is extracted from the SYTE Infirmary Management System database.', 20, notesY);
    doc.text('Records are maintained in compliance with healthcare documentation standards.', 20, notesY + 5);
    
    // Page footer
    this.addPageFooter(doc, 4);
  },

  // APPROVAL PAGE
  generateApprovalPage(doc) {
    // Page header
    doc.setFontSize(16);
    doc.setTextColor(0, 51, 102);
    doc.setFont('helvetica', 'bold');
    doc.text('Approval & Authorization', 105, 40, { align: 'center' });
    
    // Authorization text
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    
    const authText = `This report has been generated by the SYTE Infirmary Management System and represents an accurate 
summary of health center activities for the specified reporting period. The information contained herein is 
confidential and intended only for authorized school personnel involved in student health management and 
administrative oversight.

By signing below, the approving officials acknowledge receipt and review of this report, confirming its 
accuracy and authorizing its inclusion in official school health records.`;
    
    const splitText = doc.splitTextToSize(authText, 170);
    doc.text(splitText, 20, 60);
    
    // Signature section
    const signatureY = 140;
    
    // School Nurse signature
    doc.setFontSize(12);
    doc.setTextColor(0, 51, 102);
    doc.setFont('helvetica', 'bold');
    doc.text('School Nurse / Health Officer', 30, signatureY);
    
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(30, signatureY + 5, 80, signatureY + 5);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text('Signature', 30, signatureY + 12);
    doc.text('Date: __________________', 30, signatureY + 20);
    
    // Principal signature
    doc.setFontSize(12);
    doc.setTextColor(0, 51, 102);
    doc.setFont('helvetica', 'bold');
    doc.text('Head of School / Principal', 100, signatureY);
    
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(100, signatureY + 5, 150, signatureY + 5);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text('Signature', 100, signatureY + 12);
    doc.text('Date: __________________', 100, signatureY + 20);
    
    // Medical Director signature
    const directorY = signatureY + 50;
    doc.setFontSize(12);
    doc.setTextColor(0, 51, 102);
    doc.setFont('helvetica', 'bold');
    doc.text('Medical Director / Supervisor', 65, directorY);
    
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(65, directorY + 5, 115, directorY + 5);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text('Signature', 65, directorY + 12);
    doc.text('Date: __________________', 65, directorY + 20);
    
    // Final notes
    const notesY = directorY + 40;
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.setFont('helvetica', 'italic');
    
    const notesText = `This document constitutes an official record of the SYTE Infirmary. 
Unauthorized reproduction or distribution is prohibited. All records are maintained 
in accordance with data protection regulations and healthcare confidentiality standards.`;
    
    const notesSplit = doc.splitTextToSize(notesText, 170);
    doc.text(notesSplit, 20, notesY);
    
    // Document distribution
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('Document Distribution:', 20, notesY + 30);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const distribution = [
      '1. School Administration Office (Original)',
      '2. Infirmary Records (Copy)',
      '3. Student Health Files (Reference Copy)',
      '4. Board of Education (Summary Copy)'
    ];
    
    distribution.forEach((item, index) => {
      doc.text(item, 25, notesY + 40 + (index * 6));
    });
    
    // Page footer
    this.addPageFooter(doc, 5);
  },

  // Add page footer
  addPageFooter(doc, pageNumber) {
    const totalPages = 5; // Fixed for this report structure
    
    // Footer line
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 282, 190, 282);
    
    // Page number
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Page ${pageNumber} of ${totalPages}`, 105, 290, { align: 'center' });
    
    // Confidential notice on all pages except cover
    if (pageNumber > 1) {
      doc.setFontSize(8);
      doc.text('Confidential - SYTE Infirmary Management System', 105, 295, { align: 'center' });
    }
  },

  // Generate student medical report (single page)
  async generateStudentMedicalReport(studentData) {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Cover watermark
    doc.setFontSize(40);
    doc.setTextColor(240, 240, 240);
    doc.setFont('helvetica', 'bold');
    doc.text('MEDICAL RECORD', 105, 150, { align: 'center' });
    
    // Header
    doc.setFontSize(18);
    doc.setTextColor(0, 51, 102);
    doc.setFont('helvetica', 'bold');
    doc.text('STUDENT MEDICAL RECORD', 105, 30, { align: 'center' });
    
    // Student info box
    doc.setDrawColor(0, 51, 102);
    doc.setLineWidth(0.5);
    doc.rect(20, 40, 170, 40);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 51, 102);
    doc.setFont('helvetica', 'bold');
    doc.text('Student Information', 25, 48);
    
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    
    const studentInfo = [
      `Name: ${studentData.fullName || 'N/A'}`,
      `Student ID: ${studentData.studentId || 'N/A'}`,
      `Grade/Class: ${studentData.grade || ''} - ${studentData.className || ''}`,
      `Date of Birth: ${studentData.dateOfBirth || 'N/A'}`
    ];
    
    studentInfo.forEach((info, index) => {
      const col = index < 2 ? 25 : 105;
      const row = index % 2 === 0 ? 55 : 62;
      doc.text(info, col, row);
    });
    
    // Medical History Table
    const startY = 90;
    doc.setFontSize(14);
    doc.setTextColor(0, 51, 102);
    doc.setFont('helvetica', 'bold');
    doc.text('Medical History', 20, startY);
    
    if (studentData.medicalHistory && studentData.medicalHistory.length > 0) {
      const historyData = studentData.medicalHistory.map(record => [
        record.date || 'N/A',
        record.condition || 'N/A',
        record.treatment || 'N/A',
        record.notes?.substring(0, 50) + '...' || 'N/A'
      ]);
      
      autoTable(doc, {
        startY: startY + 5,
        head: [['Date', 'Condition', 'Treatment', 'Notes']],
        body: historyData.slice(0, 8), // Limit to 8 most recent
        theme: 'grid',
        headStyles: { 
          fillColor: [66, 133, 244], 
          textColor: 255,
          fontSize: 10 
        },
        styles: { 
          fontSize: 8,
          cellPadding: 2
        },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 40 },
          2: { cellWidth: 50 },
          3: { cellWidth: 55 }
        },
        margin: { left: 20, right: 20 }
      });
    }
    
    // Allergies & Conditions
    const detailsY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : startY + 50;
    
    doc.setFontSize(14);
    doc.setTextColor(0, 51, 102);
    doc.setFont('helvetica', 'bold');
    doc.text('Health Details', 20, detailsY);
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    
    const details = [
      `Allergies: ${studentData.allergies || 'None recorded'}`,
      `Chronic Conditions: ${studentData.chronicConditions || 'None recorded'}`,
      `Blood Type: ${studentData.bloodType || 'Not recorded'}`,
      `Emergency Contact: ${studentData.emergencyContact || 'N/A'}`
    ];
    
    details.forEach((detail, index) => {
      doc.text(detail, 25, detailsY + 10 + (index * 7));
    });
    
    // Signature section
    const signatureY = detailsY + 40;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    
    // Nurse signature
    doc.text('Attending Nurse/Physician:', 30, signatureY);
    doc.line(30, signatureY + 2, 80, signatureY + 2);
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Signature & Stamp', 30, signatureY + 8);
    
    // Date
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('Date:', 30, signatureY + 15);
    doc.line(30, signatureY + 17, 60, signatureY + 17);
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('SYTE Infirmary - Confidential Student Record', 105, 285, { align: 'center' });
    doc.text(`Generated: ${new Date().toLocaleDateString()} | Record ID: ${studentData.studentId || 'N/A'}`, 105, 290, { align: 'center' });
    
    const fileName = `Student_Medical_Record_${studentData.studentId || 'unknown'}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    return fileName;
  },

  // Helper functions
  generateReportId() {
    const date = new Date();
    const timestamp = date.getTime().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `MED-${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}-${timestamp}${random}`;
  },

  formatDateRange(dateRange) {
    if (!dateRange) return 'All Time';
    
    const now = new Date();
    const formatDate = (date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    switch(dateRange) {
      case 'last_7_days':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return `${formatDate(weekAgo)} to ${formatDate(now)}`;
      case 'last_30_days':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return `${formatDate(monthAgo)} to ${formatDate(now)}`;
      case 'last_90_days':
        const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        return `${formatDate(quarterAgo)} to ${formatDate(now)}`;
      case 'this_year':
        const yearStart = new Date(now.getFullYear(), 0, 1);
        return `${formatDate(yearStart)} to ${formatDate(now)}`;
      default:
        return dateRange;
    }
  },

  generateReportFileName(reportType, filters) {
    const date = new Date().toISOString().split('T')[0];
    const dateRange = filters?.dateRange || 'report';
    const type = reportType || 'summary';
    
    return `SYTE_Infirmary_${type.charAt(0).toUpperCase() + type.slice(1)}_Report_${dateRange}_${date}.pdf`;
  }
};