const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  documentType: { type: String, required: true, enum: ['contract', 'certificate', 'id_proof', 'degree', 'other'] },
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  description: { type: String, default: '' },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

documentSchema.index({ employeeId: 1 });
documentSchema.index({ uploadedBy: 1 });

module.exports = mongoose.model('Document', documentSchema);
