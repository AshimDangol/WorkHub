const Document = require('../models/Document');

const getAllDocuments = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;
    const [documents, total] = await Promise.all([
      Document.find().populate('employeeId', 'name').populate('uploadedBy', 'username').skip(skip).limit(limit),
      Document.countDocuments()
    ]);
    res.status(200).json({ success: true, count: documents.length, total, page, pages: Math.ceil(total / limit), data: documents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getDocumentById = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id).populate('employeeId', 'name').populate('uploadedBy', 'username');
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
    res.status(200).json({ success: true, data: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const uploadDocument = async (req, res) => {
  const { employeeId, documentType, fileName, fileUrl, description } = req.body;
  if (!documentType || !fileName || !fileUrl) {
    return res.status(400).json({ success: false, message: 'documentType, fileName, and fileUrl are required' });
  }
  try {
    const newDoc = await Document.create({
      employeeId: employeeId || req.user._id,
      documentType: documentType.toLowerCase(),
      fileName, fileUrl,
      description: description || '',
      uploadedBy: req.user._id
    });
    res.status(201).json({ success: true, message: 'Document uploaded', data: newDoc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
    if (req.user.role !== 'admin' && doc.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    await Document.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Document deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllDocuments, getDocumentById, uploadDocument, deleteDocument };
