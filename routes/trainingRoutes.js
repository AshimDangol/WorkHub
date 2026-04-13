const express = require('express');
const router = express.Router();
const { getAllTrainings, getTrainingById, createTraining, updateTraining, deleteTraining } = require('../controllers/trainingController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/', getAllTrainings);
router.get('/:id', getTrainingById);
router.post('/', createTraining);
router.put('/:id', updateTraining);
router.delete('/:id', deleteTraining);

module.exports = router;
