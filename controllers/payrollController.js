const pdfMake = require('pdfmake');
const fs = require('fs');
const path = require('path');

// Generate payslip PDF
const generatePayslip = async (req, res) => {
  const { employeeId, month, year } = req.body;
  
  if (!employeeId || !month || !year) {
    return res.status(400).json({
      success: false,
      message: 'Employee ID, month, and year are required'
    });
  }
  
  // Mock data for demo
  const employee = {
    name: 'John Doe',
    position: 'Software Engineer',
    department: 'Engineering',
    basicSalary: 75000,
    allowance: 5000,
    tax: 15000,
    netSalary: 65000
  };
  
  const payslipData = {
    employee: {
      name: employee.name,
      id: employeeId,
      position: employee.position,
      department: employee.department
    },
    period: {
      month,
      year
    },
    earnings: {
      basicSalary: employee.basicSalary,
      allowance: employee.allowance,
      total: employee.basicSalary + employee.allowance
    },
    deductions: {
      tax: employee.tax,
      insurance: 2000,
      total: employee.tax + 2000
    },
    netSalary: employee.netSalary
  };
  
  // Create PDF document
  const pdfDoc = {
    content: [
      { text: 'WORKFORCEHUB', style: 'header', alignment: 'center' },
      { text: 'Monthly Payslip', style: 'subheader', alignment: 'center', margin: [0, 10, 0, 20] },
      
      { text: 'Employee Details', style: 'sectionTitle' },
      { text: `Name: ${payslipData.employee.name}`, margin: [0, 5, 0, 5] },
      { text: `Employee ID: ${payslipData.employee.id}`, margin: [0, 5, 0, 5] },
      { text: `Position: ${payslipData.employee.position}`, margin: [0, 5, 0, 5] },
      { text: `Department: ${payslipData.employee.department}`, margin: [0, 5, 0, 20] },
      
      { text: `Period: ${payslipData.period.month} ${payslipData.period.year}`, style: 'sectionTitle' },
      { text: 'Earnings', style: 'subSectionTitle' },
      { text: `Basic Salary: $${payslipData.earnings.basicSalary.toLocaleString()}`, margin: [0, 5, 0, 5] },
      { text: `Allowance: $${payslipData.earnings.allowance.toLocaleString()}`, margin: [0, 5, 0, 5] },
      { text: `Total Earnings: $${payslipData.earnings.total.toLocaleString()}`, style: 'total', margin: [0, 5, 0, 15] },
      
      { text: 'Deductions', style: 'subSectionTitle' },
      { text: `Tax: $${payslipData.deductions.tax.toLocaleString()}`, margin: [0, 5, 0, 5] },
      { text: `Insurance: $${payslipData.deductions.insurance.toLocaleString()}`, margin: [0, 5, 0, 5] },
      { text: `Total Deductions: $${payslipData.deductions.total.toLocaleString()}`, style: 'total', margin: [0, 5, 0, 15] },
      
      { text: `Net Salary: $${payslipData.netSalary.toLocaleString()}`, style: 'netSalary', alignment: 'center', margin: [0, 20, 0, 20] },
      
      { text: 'Thank you for your hard work!', style: 'footer', alignment: 'center' }
    ],
    styles: {
      header: { fontSize: 24, bold: true, color: '#667eea', margin: [0, 0, 0, 10] },
      subheader: { fontSize: 18, color: '#666', margin: [0, 0, 0, 20] },
      sectionTitle: { fontSize: 16, bold: true, margin: [0, 10, 0, 5] },
      subSectionTitle: { fontSize: 14, bold: true, margin: [0, 10, 0, 5] },
      total: { fontSize: 12, bold: true, color: '#333' },
      netSalary: { fontSize: 20, bold: true, color: '#27ae60' },
      footer: { fontSize: 12, color: '#999', margin: [0, 20, 0, 0] }
    }
  };
  
  try {
    const pdfBuffer = await new Promise((resolve, reject) => {
      const pdf = pdfMake.createPdf(pdfDoc);
      pdf.getBuffer((buffer) => {
        resolve(buffer);
      });
    });
    
    // Save to file
    const fileName = `payslip_${employeeId}_${month}_${year}.pdf`;
    const filePath = path.join(__dirname, '..', 'payslips', fileName);
    
    if (!fs.existsSync(path.join(__dirname, '..', 'payslips'))) {
      fs.mkdirSync(path.join(__dirname, '..', 'payslips'));
    }
    
    fs.writeFileSync(filePath, pdfBuffer);
    
    res.status(200).json({
      success: true,
      message: 'Payslip generated successfully',
      fileName,
      filePath: `/payslips/${fileName}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { generatePayslip };
