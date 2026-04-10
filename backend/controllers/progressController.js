const Progress = require('../models/Progress');
const Subject = require('../models/Subject');
const StudySession = require('../models/StudySession');

// Get all progress records
const getAllProgress = async (req, res) => {
  try {
    const progress = await Progress.find().populate('subjectId').sort({ date: -1 });
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get progress by subject ID
const getProgressBySubject = async (req, res) => {
  try {
    const progress = await Progress.find({ subjectId: req.params.subjectId }).sort({ date: -1 });
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new progress record
const createProgress = async (req, res) => {
  try {
    const { subjectId, topicsCompleted, studyTime, notes } = req.body;
    const progress = new Progress({
      subjectId,
      topicsCompleted,
      studyTime,
      notes
    });
    await progress.save();
    
    // Update subject's completed topics
    const subject = await Subject.findById(subjectId);
    if (subject) {
      subject.completedTopics = (subject.completedTopics || 0) + (topicsCompleted || 0);
      subject.progress = Math.round((subject.completedTopics / subject.totalTopics) * 100);
      await subject.save();
    }
    
    res.status(201).json(progress);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete progress record
const deleteProgress = async (req, res) => {
  try {
    const progress = await Progress.findByIdAndDelete(req.params.id);
    if (!progress) {
      return res.status(404).json({ error: 'Progress not found' });
    }
    res.json({ message: 'Progress deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get overall statistics
const getStats = async (req, res) => {
  try {
    const subjects = await Subject.find();
    const totalSubjects = subjects.length;
    const totalTopics = subjects.reduce((sum, s) => sum + s.totalTopics, 0);
    const completedTopics = subjects.reduce((sum, s) => sum + s.completedTopics, 0);
    const overallProgress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
    
    res.json({
      totalSubjects,
      totalTopics,
      completedTopics,
      overallProgress
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new study session
const createStudySession = async (req, res) => {
  try {
    const { subjectId, topicName, topicIndex, duration } = req.body;
    
    const session = new StudySession({
      subjectId,
      topicName,
      topicIndex,
      duration,
      startedAt: new Date()
    });
    
    await session.save();
    res.status(201).json(session);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Complete study session
const completeStudySession = async (req, res) => {
  try {
    const session = await StudySession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    session.completed = true;
    session.completedAt = new Date();
    await session.save();
    
    // Mark topic as completed in Subject
    const subject = await Subject.findById(session.subjectId);
    if (subject && subject.topics[session.topicIndex]) {
      subject.topics[session.topicIndex].completed = true;
      subject.completedTopics = (subject.completedTopics || 0) + 1;
      subject.progress = Math.round((subject.completedTopics / subject.totalTopics) * 100);
      await subject.save();
    }
    
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get study sessions by subject
const getStudySessionsBySubject = async (req, res) => {
  try {
    const sessions = await StudySession.find({ subjectId: req.params.subjectId })
      .sort({ date: -1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all study sessions
const getAllStudySessions = async (req, res) => {
  try {
    const sessions = await StudySession.find()
      .populate('subjectId', 'name')
      .sort({ date: -1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllProgress,
  getProgressBySubject,
  createProgress,
  deleteProgress,
  getStats,
  createStudySession,
  completeStudySession,
  getStudySessionsBySubject,
  getAllStudySessions
};

