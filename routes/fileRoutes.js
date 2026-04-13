const express = require('express');
const router = express.Router();
const { uploadDocument, getAllDocuments, getDocumentById, deleteDocument } = require('../controllers/fileController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/', getAllDocuments);
router.get('/:id', getDocumentById);
router.post('/', uploadDocument);
router.delete('/:id', deleteDocument);

module.exports = router;
