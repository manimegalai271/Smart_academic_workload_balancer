const ExternalEvent = require('../models/ExternalEvent');

// Get all events
const getAllEvents = async (req, res) => {
  try {
    const events = await ExternalEvent.find()
      .sort({ startDate: 1 })
      .lean();
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new event
const createEvent = async (req, res) => {
  try {
    const event = new ExternalEvent(req.body);
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update event
const updateEvent = async (req, res) => {
  try {
    const event = await ExternalEvent.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete event
const deleteEvent = async (req, res) => {
  try {
    const event = await ExternalEvent.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get impact analysis / heat map for period
const getImpactAnalysis = async (req, res) => {
  try {
    const { startDate, endDate, subjectId } = req.query;
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const events = await ExternalEvent.find({
      startDate: { $gte: start, $lte: end }
    }).sort({ startDate: 1 });

    // Group by day
    const dailyImpact = {};
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const studyHoursPerDay = 4; // Assume 4h study capacity
    
    const dateIterator = new Date(start);
    while (dateIterator <= end) {
      const dayKey = dateIterator.toISOString().split('T')[0];
      dailyImpact[dayKey] = {
        date: dayKey,
        availableHours: studyHoursPerDay * 60, // minutes
        blockedMinutes: 0,
        squeezePercent: 0,
        events: []
      };
      
      dateIterator.setDate(dateIterator.getDate() + 1);
    }

    // Calculate daily block
    events.forEach(event => {
      const dayKey = new Date(event.startDate).toISOString().split('T')[0];
      if (dailyImpact[dayKey]) {
        dailyImpact[dayKey].blockedMinutes += event.duration;
        dailyImpact[dayKey].events.push({
          title: event.title,
          duration: event.duration,
          type: event.type
        });
      }
    });

    // Compute squeeze %
    Object.values(dailyImpact).forEach(day => {
      day.squeezePercent = Math.round((day.blockedMinutes / day.availableHours) * 100);
      day.availableHours -= day.blockedMinutes;
      day.availableHours = Math.max(0, day.availableHours);
    });

    // Overall impact
    const totalBlocked = events.reduce((sum, e) => sum + e.duration, 0);
    const totalAvailable = totalDays * studyHoursPerDay * 60;
    const overallSqueeze = Math.round((totalBlocked / totalAvailable) * 100);

    // Subject-specific adjustment if provided
    let velocityAdjustment = 1.0;
    if (subjectId) {
      // Fetch subject target
      const subject = await Subject.findById(subjectId);
      if (subject) {
        const subjectStudyNeeded = subject.totalTopics * 60; // assume 60min/topic
        const adjustedAvailable = totalAvailable - totalBlocked;
        velocityAdjustment = adjustedAvailable > 0 ? subjectStudyNeeded / adjustedAvailable : 0.5;
      }
    }

    res.json({
      dailyImpact: Object.values(dailyImpact),
      overallSqueeze,
      totalBlocked,
      totalAvailable,
      velocityAdjustment: parseFloat(velocityAdjustment.toFixed(2)),
      recommendation: overallSqueeze > 50 ? 'High cognitive load! Consider Panic Mode.' : 'Manageable load.'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getImpactAnalysis
};

