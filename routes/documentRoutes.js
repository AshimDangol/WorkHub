const express = require('express');
const router = express.Router();
const { getAllDocuments, getDocumentById, uploadDocument, deleteDocument } = require('../controllers/documentController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/', getAllDocuments);
router.get('/:id', getDocumentById);
router.post('/', uploadDocument);
router.delete('/:id', deleteDocument);

module.exports = router;
