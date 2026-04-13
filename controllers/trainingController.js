const Training = require('../models/Training');

const getAllTrainings = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;
    const [trainings, total] = await Promise.all([
      Training.find().populate('employeeId', 'name email').skip(skip).limit(limit),
      Training.countDocuments()
    ]);
    res.status(200).json({ success: true, count: trainings.length, total, page, pages: Math.ceil(total / limit), data: trainings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTrainingById = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id).populate('employeeId', 'name email');
    if (!training) return res.status(404).json({ success: false, message: 'Training not found' });
    res.status(200).json({ success: true, data: training });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createTraining = async (req, res) => {
  const { employeeId, title, description, trainer, startDate, endDate, completionStatus, certificateUrl } = req.body;
  if (!title || !startDate) {
    return res.status(400).json({ success: false, message: 'title and startDate are required' });
  }
  try {
    const newTraining = await Training.create({
      employeeId: employeeId || req.user._id,
      title: title.trim(),
      description: description || '',
      trainer: trainer || '',
      startDate,
      endDate: endDate || '',
      completionStatus: completionStatus || 'in_progress',
      certificateUrl: certificateUrl || ''
    });
    res.status(201).json({ success: true, message: 'Training record created', data: newTraining });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateTraining = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) return res.status(404).json({ success: false, message: 'Training not found' });
    const { title, description, trainer, startDate, endDate, completionStatus, certificateUrl } = req.body;
    const updated = await Training.findByIdAndUpdate(
      req.params.id,
      {
        title: title !== undefined ? title.trim() : training.title,
        description: description !== undefined ? description.trim() : training.description,
        trainer: trainer !== undefined ? trainer.trim() : training.trainer,
        startDate: startDate || training.startDate,
        endDate: endDate !== undefined ? endDate : training.endDate,
        completionStatus: completionStatus || training.completionStatus,
        certificateUrl: certificateUrl !== undefined ? certificateUrl : training.certificateUrl
      },
      { new: true, runValidators: true }
    );
    res.status(200).json({ success: true, message: 'Training record updated', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteTraining = async (req, res) => {
  try {
    const training = await Training.findByIdAndDelete(req.params.id);
    if (!training) return res.status(404).json({ success: false, message: 'Training not found' });
    res.status(200).json({ success: true, message: 'Training record deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllTrainings, getTrainingById, createTraining, updateTraining, deleteTraining };
