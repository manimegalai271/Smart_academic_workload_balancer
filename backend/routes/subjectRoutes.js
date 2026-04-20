const express = require('express');
const router = express.Router();
const {
  getAllSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
  markTopicCompleted,
  updateProgress
} = require('../controllers/subjectController');

// Get all subjects
router.get('/', getAllSubjects);

// Get subject by ID
router.get('/:id', getSubjectById);

// Create new subject
router.post('/', createSubject);

// Update subject
router.put('/:id', updateSubject);

// Delete subject
router.delete('/:id', deleteSubject);

// Dependency graph
// router.get('/graph', getDependencyGraph);

// Pruning endpoint
// router.post('/:id/prune', pruneTopics);

// Mark topic as completed
router.patch('/topic-complete', markTopicCompleted);

// Update progress
router.patch('/:id/progress', updateProgress);

module.exports = router;

