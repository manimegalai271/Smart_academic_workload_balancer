const express = require('express');
const router = express.Router();
const {
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getImpactAnalysis
} = require('../controllers/eventController');

// Get all events
router.get('/', getAllEvents);

// Create new event
router.post('/', createEvent);

// Update event
router.put('/:id', updateEvent);

// Delete event
router.delete('/:id', deleteEvent);

// Impact analysis / heat map
router.get('/impact', getImpactAnalysis);

module.exports = router;

