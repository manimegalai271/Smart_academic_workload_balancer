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

// Calculate study velocity and projected completion
const getVelocity = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    const remainingTopics = Math.max(0, subject.totalTopics - subject.completedTopics);
    if (remainingTopics === 0) {
      return res.json({
        velocity: 1.0,
        projectedDate: new Date().toISOString().split('T')[0],
        riskLevel: 'completed',
        daysNeeded: 0,
        message: 'Subject completed!'
      });
    }

    // Get last 7 days progress data
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentProgress = await Progress.find({
      subjectId,
      date: { $gte: sevenDaysAgo }
    }).sort({ date: -1 });

    let totalCompletedRecent = 0;
    let daysWithData = 0;
    recentProgress.forEach(p => {
      if (p.topicsCompleted > 0) {
        totalCompletedRecent += p.topicsCompleted;
        daysWithData++;
      }
    });

    // Daily averages
    const dailyAvgTopics = daysWithData > 0 ? totalCompletedRecent / daysWithData : 0.1;
    const plannedDaily = subject.totalTopics / subject.targetDays;
    let velocity = plannedDaily > 0 ? dailyAvgTopics / plannedDaily : 1.0;
    velocity = Math.max(0.1, Math.min(3.0, velocity)); // Clamp 0.1-3.0

    // Update subject's lastVelocity
    subject.lastVelocity = velocity;
    await subject.save();

    // Projection
    const daysNeeded = dailyAvgTopics > 0 ? remainingTopics / dailyAvgTopics : 30;
    const projectedDate = new Date();
    projectedDate.setDate(projectedDate.getDate() + Math.ceil(daysNeeded));

    // Risk assessment (if deadline set)
    let riskLevel = 'low';
    let riskMessage = '';
    if (subject.deadline) {
      const deadline = new Date(subject.deadline);
      if (projectedDate > deadline) {
        riskLevel = 'high';
        riskMessage = `Warning: Projected finish (${projectedDate.toISOString().split('T')[0]}) after deadline!`;
      } else if ((deadline - projectedDate) / (1000 * 60 * 60 * 24) < 3) {
        riskLevel = 'medium';
        riskMessage = 'Close to deadline - keep up the pace!';
      } else {
        riskMessage = 'On track!';
      }
    }

    res.json({
      velocity: parseFloat(velocity.toFixed(2)),
      dailyAvgTopics: parseFloat(dailyAvgTopics.toFixed(2)),
      remainingTopics,
      daysNeeded: parseFloat(daysNeeded.toFixed(1)),
      projectedDate: projectedDate.toISOString().split('T')[0],
      riskLevel,
      riskMessage,
      lastUpdated: new Date().toISOString()
    });
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
  getAllStudySessions,
  getVelocity
};


