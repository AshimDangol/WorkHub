const Department = require('../models/Department');
const Employee = require('../models/Employee');

const getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find().populate('managerId', 'name');
    res.status(200).json({ success: true, count: departments.length, data: departments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getDepartmentById = async (req, res) => {
  try {
    const dept = await Department.findById(req.params.id).populate('managerId', 'name');
    if (!dept) return res.status(404).json({ success: false, message: 'Department not found' });
    res.status(200).json({ success: true, data: dept });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createDepartment = async (req, res) => {
  const { name, description, managerId } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'Department name is required' });
  try {
    // Safe exact-match check (no regex injection)
    const existingDept = await Department.findOne({ name: { $regex: new RegExp(`^${name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } });
    if (existingDept) return res.status(400).json({ success: false, message: 'Department already exists' });
    const newDept = await Department.create({ name: name.trim(), description: description || '', managerId: managerId || null });
    res.status(201).json({ success: true, message: 'Department created successfully', data: newDept });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateDepartment = async (req, res) => {
  try {
    const dept = await Department.findById(req.params.id);
    if (!dept) return res.status(404).json({ success: false, message: 'Department not found' });
    const { name, description, managerId } = req.body;
    if (name) {
      const existingDept = await Department.findOne({
        name: { $regex: new RegExp(`^${name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
        _id: { $ne: req.params.id }
      });
      if (existingDept) return res.status(400).json({ success: false, message: 'Department name already exists' });
    }
    const updated = await Department.findByIdAndUpdate(
      req.params.id,
      {
        name: name !== undefined ? name.trim() : dept.name,
        description: description !== undefined ? description : dept.description,
        managerId: managerId !== undefined ? managerId : dept.managerId
      },
      { new: true, runValidators: true }
    );
    res.status(200).json({ success: true, message: 'Department updated successfully', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteDepartment = async (req, res) => {
  try {
    const dept = await Department.findById(req.params.id);
    if (!dept) return res.status(404).json({ success: false, message: 'Department not found' });
    const count = await Employee.countDocuments({ department: dept.name });
    if (count > 0) return res.status(400).json({ success: false, message: 'Cannot delete department with existing employees' });
    await Department.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Department deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllDepartments, getDepartmentById, createDepartment, updateDepartment, deleteDepartment };
