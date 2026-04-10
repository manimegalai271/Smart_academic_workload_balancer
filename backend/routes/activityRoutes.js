const express = require('express');
const router = express.Router();
const StudyActivity = require('../models/StudyActivity');

// Get all study activities
router.get('/', async (req, res) => {
  try {
    const activities = await StudyActivity.find().sort({ date: -1 }).limit(365);
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Record study activity for today
router.post('/record', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { topicsCompleted, subjectName, studyMinutes } = req.body;
    
    let activity = await StudyActivity.findOne({ date: today });
    
    if (activity) {
      activity.studiedToday = true;
      activity.totalTopicsCompleted += topicsCompleted || 0;
      activity.totalStudyMinutes += studyMinutes || 0;
      if (subjectName && !activity.subjectsStudied.includes(subjectName)) {
        activity.subjectsStudied.push(subjectName);
      }
      await activity.save();
    } else {
      activity = new StudyActivity({
        date: today,
        studiedToday: true,
        totalTopicsCompleted: topicsCompleted || 0,
        totalStudyMinutes: studyMinutes || 0,
        subjectsStudied: subjectName ? [subjectName] : []
      });
      await activity.save();
    }
    
    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get current streak
router.get('/streak', async (req, res) => {
  try {
    const activities = await StudyActivity.find({ studiedToday: true }).sort({ date: -1 });
    
    if (activities.length === 0) {
      return res.json({ currentStreak: 0, longestStreak: 0 });
    }
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Check if studied today or yesterday to start counting current streak
    const lastActivity = activities[0];
    const lastActivityDate = new Date(lastActivity.date);
    lastActivityDate.setHours(0, 0, 0, 0);
    
    const hasStudiedTodayOrYesterday = 
      lastActivityDate.getTime() === today.getTime() || 
      lastActivityDate.getTime() === yesterday.getTime();
    
    if (hasStudiedTodayOrYesterday) {
      // Count current streak
      let checkDate = hasStudiedTodayOrYesterday ? lastActivityDate : yesterday;
      
      for (let i = 0; i < activities.length; i++) {
        const activityDate = new Date(activities[i].date);
        activityDate.setHours(0, 0, 0, 0);
        
        const expectedDate = new Date(checkDate);
        expectedDate.setDate(expectedDate.getDate() - i);
        
        if (activityDate.getTime() === expectedDate.getTime()) {
          currentStreak++;
        } else {
          break;
        }
      }
    }
    
    // Calculate longest streak
    const sortedActivities = [...activities].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    for (let i = 0; i < sortedActivities.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const currentDate = new Date(sortedActivities[i].date);
        const prevDate = new Date(sortedActivities[i - 1].date);
        currentDate.setHours(0, 0, 0, 0);
        prevDate.setHours(0, 0, 0, 0);
        
        const diffDays = Math.round((currentDate - prevDate) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);
    }
    
    res.json({ currentStreak, longestStreak });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get badges based on streak
router.get('/badges', async (req, res) => {
  try {
    const { currentStreak } = req.query;
    const streak = parseInt(currentStreak) || 0;
    
    const badges = [
      { name: 'Beginner Learner', days: 7, earned: streak >= 7, icon: '🌱' },
      { name: 'Consistent Learner', days: 30, earned: streak >= 30, icon: '📚' },
      { name: 'Dedicated Scholar', days: 50, earned: streak >= 50, icon: '🏆' },
      { name: 'Study Master', days: 100, earned: streak >= 100, icon: '👑' },
      { name: 'Academic Warrior', days: 150, earned: streak >= 150, icon: '⚔️' },
      { name: 'Knowledge Seeker', days: 200, earned: streak >= 200, icon: '🔮' },
      { name: 'Scholar Extraordinaire', days: 365, earned: streak >= 365, icon: '🌟' }
    ];
    
    res.json(badges);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

