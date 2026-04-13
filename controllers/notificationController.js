const { sendEmail } = require('../config/email');

// Send welcome email to new employee
const sendWelcomeEmail = async (req, res) => {
  const { email, name, position, department } = req.body;
  
  if (!email || !name) {
    return res.status(400).json({
      success: false,
      message: 'Email and name are required'
    });
  }
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #667eea;">Welcome to WorkForceHub! 🎉</h1>
      <p>Hi ${name},</p>
      <p>Congratulations! You've been added to our team.</p>
      <h3>Your Details:</h3>
      <ul>
        <li><strong>Position:</strong> ${position}</li>
        <li><strong>Department:</strong> ${department}</li>
      </ul>
      <p>We're excited to have you on board!</p>
      <p>Best regards,<br>The WorkForceHub Team</p>
    </div>
  `;
  
  const result = await sendEmail(email, 'Welcome to WorkForceHub!', html);
  
  if (result.success) {
    res.status(200).json({
      success: true,
      message: 'Welcome email sent successfully'
    });
  } else {
    res.status(500).json({
      success: false,
      message: 'Failed to send email'
    });
  }
};

// Send attendance alert
const sendAttendanceAlert = async (req, res) => {
  const { employeeName, date, status, employeeEmail } = req.body;
  
  if (!employeeName || !date || !status) {
    return res.status(400).json({
      success: false,
      message: 'Employee name, date, and status are required'
    });
  }
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #667eea;">Attendance Alert 📅</h1>
      <p>Attendance record for ${employeeName} on ${date}:</p>
      <h3 style="color: ${status === 'present' ? '#27ae60' : status === 'absent' ? '#e74c3c' : '#f39c12'};">
        Status: ${status.toUpperCase()}
      </h3>
      <p>Please review the attendance record in the system.</p>
    </div>
  `;
  
  const result = await sendEmail(employeeEmail, `Attendance Alert - ${date}`, html);
  
  if (result.success) {
    res.status(200).json({
      success: true,
      message: 'Attendance alert sent successfully'
    });
  } else {
    res.status(500).json({
      success: false,
      message: 'Failed to send alert'
    });
  }
};

// Send performance review notification
const sendPerformanceNotification = async (req, res) => {
  const { employeeName, employeeEmail, reviewerName, rating, reviewDate } = req.body;
  
  if (!employeeName || !reviewerName || !rating) {
    return res.status(400).json({
      success: false,
      message: 'Required fields missing'
    });
  }
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #667eea;">Performance Review Notification 📊</h1>
      <p>Hi ${employeeName},</p>
      <p>Your performance review for ${reviewDate} has been completed!</p>
      <h3>Review Details:</h3>
      <ul>
        <li><strong>Reviewer:</strong> ${reviewerName}</li>
        <li><strong>Rating:</strong> ${'★'.repeat(Math.round(rating))}${'☆'.repeat(5 - Math.round(rating))} (${rating}/5)</li>
      </ul>
      <p>Please check your performance record in the system for more details.</p>
    </div>
  `;
  
  const result = await sendEmail(employeeEmail, 'Performance Review Completed', html);
  
  if (result.success) {
    res.status(200).json({
      success: true,
      message: 'Performance notification sent successfully'
    });
  } else {
    res.status(500).json({
      success: false,
      message: 'Failed to send notification'
    });
  }
};

module.exports = { sendWelcomeEmail, sendAttendanceAlert, sendPerformanceNotification };
