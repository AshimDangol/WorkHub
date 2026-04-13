const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Performance = require('../models/Performance');
const Training = require('../models/Training');
const Document = require('../models/Document');

// GET /api/employees?page=1&limit=20
const getAllEmployees = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const [employees, total] = await Promise.all([
      Employee.find().skip(skip).limit(limit),
      Employee.countDocuments()
    ]);

    res.status(200).json({
      success: true,
      count: employees.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: employees
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    res.status(200).json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createEmployee = async (req, res) => {
  const { name, email, position, department, salary, hireDate } = req.body;
  if (!name || !email || !position || !department) {
    return res.status(400).json({ success: false, message: 'name, email, position, and department are required' });
  }
  try {
    const newEmployee = await Employee.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      position: position.trim(),
      department: department.trim(),
      salary: typeof salary === 'number' && salary >= 0 ? salary : 0,
      hireDate: hireDate || new Date().toISOString().split('T')[0]
    });
    res.status(201).json({ success: true, message: 'Employee created successfully', data: newEmployee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    const { name, email, position, department, salary, hireDate } = req.body;
    const updated = await Employee.findByIdAndUpdate(
      req.params.id,
      {
        name: name !== undefined ? name.trim() : employee.name,
        email: email !== undefined ? email.trim().toLowerCase() : employee.email,
        position: position !== undefined ? position.trim() : employee.position,
        department: department !== undefined ? department.trim() : employee.department,
        salary: typeof salary === 'number' && salary >= 0 ? salary : employee.salary,
        hireDate: hireDate || employee.hireDate
      },
      { new: true, runValidators: true }
    );
    res.status(200).json({ success: true, message: 'Employee updated successfully', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cascade delete: remove all related records
const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    const id = employee._id;
    await Promise.all([
      Attendance.deleteMany({ employeeId: id }),
      Leave.deleteMany({ employeeId: id }),
      Performance.deleteMany({ employeeId: id }),
      Training.deleteMany({ employeeId: id }),
      Document.deleteMany({ employeeId: id }),
      Employee.findByIdAndDelete(id)
    ]);
    res.status(200).json({ success: true, message: 'Employee and all related records deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee };
