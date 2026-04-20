const express = require('express');
const router = express.Router();
const {
  getAllProgress,
  getProgressBySubject,
  createProgress,
  deleteProgress,
  getStats,
  createStudySession,
  completeStudySession,
  getStudySessionsBySubject,
  getAllStudySessions
} = require('../controllers/progressController');

// Get all progress records
router.get('/', getAllProgress);

// Get progress by subject
router.get('/subject/:subjectId', getProgressBySubject);

// Get overall stats
router.get('/stats', getStats);

// Create new progress record
router.post('/', createProgress);

// Delete progress record
router.delete('/:id', deleteProgress);

// Study session routes
router.post('/session', createStudySession);
router.patch('/session/:id/complete', completeStudySession);
router.get('/sessions/subject/:subjectId', getStudySessionsBySubject);
router.get('/sessions', getAllStudySessions);

// Velocity predictor
// router.get('/velocity/:subjectId', getVelocity);

module.exports = router;

