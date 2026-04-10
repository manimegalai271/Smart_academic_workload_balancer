const Subject = require('../models/Subject');
const StudyActivity = require('../models/StudyActivity');

// Normalize subject name to prevent duplicates
const normalizeSubjectName = (name) => {
  if (!name) return name;
  
  const normalized = name.toLowerCase().trim();
  
  // Common variations mapping
  const variations = {
    'os': 'Operating System',
    'operating system': 'Operating System',
    'operating systems': 'Operating System',
    'dbms': 'Database Management System',
    'database': 'Database Management System',
    'databases': 'Database Management System',
    'database management system': 'Database Management System',
    'database management systems': 'Database Management System',
    'cn': 'Computer Networks',
    'computer network': 'Computer Networks',
    'computer networks': 'Computer Networks',
    'ds': 'Data Structures',
    'data structure': 'Data Structures',
    'data structures': 'Data Structures',
    'algo': 'Algorithms',
    'algorithm': 'Algorithms',
    'algorithms': 'Algorithms',
    'ai': 'Artificial Intelligence',
    'artificial intelligence': 'Artificial Intelligence',
    'ml': 'Machine Learning',
    'machine learning': 'Machine Learning',
    'web dev': 'Web Development',
    'web development': 'Web Development',
    'dsa': 'Data Structures and Algorithms',
    'data structures and algorithms': 'Data Structures and Algorithms',
    'daa': 'Design and Analysis of Algorithms',
    'design and analysis of algorithms': 'Design and Analysis of Algorithms',
    'co': 'Computer Organization',
    'computer organization': 'Computer Organization',
    'computer architecture': 'Computer Organization',
    'oops': 'Object Oriented Programming',
    'oop': 'Object Oriented Programming',
    'object oriented programming': 'Object Oriented Programming',
    'se': 'Software Engineering',
    'software engineering': 'Software Engineering',
    'cd': 'Compiler Design',
    'compiler design': 'Compiler Design',
    'cn': 'Computer Networks',
    ' networks': 'Computer Networks',
  };
  
  if (variations[normalized]) {
    return variations[normalized];
  }
  
  // Capitalize first letter of each word for other subjects
  return name.trim().split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
};

// Validate subject name - reject non-academic subjects
const validateSubjectName = (name) => {
  if (!name) return { valid: false, message: 'Subject name is required' };
  
  const normalizedName = name.toLowerCase().trim();
  
  // List of invalid subjects (not academic subjects)
  const invalidSubjects = [
    'progress',
    'schedule',
    'dashboard',
    'subjects',
    'home',
    'profile',
    'settings',
    'tasks',
    'notes',
    'assignments',
    'deadlines',
    'calendar',
    'planner',
    'todo',
    'to-do',
    'work',
    'homework',
    'class',
    'lesson',
    'exam',
    'test',
    'quiz',
    'grade',
    'grades',
    'score',
    'result',
    'results',
    'achievements',
    'badges',
    'streak',
    'study plan',
    'study schedule',
    'timetable',
    'routine',
    'tracker',
    'tracking',
    'analytics',
    'reports',
    'overview',
    'summary',
    'statistics',
    'stats',
    'performance',
    'activity',
    'log',
    'history'
  ];
  
  // Check if the subject is in the invalid list
  if (invalidSubjects.includes(normalizedName)) {
    return { 
      valid: false, 
      message: `"${name}" is not a valid academic subject. Please enter a subject like Operating System, DBMS, Data Structures, etc.` 
    };
  }
  
  // Additional check: if the name is too short or too generic
  if (normalizedName.length < 2) {
    return { valid: false, message: 'Subject name is too short' };
  }
  
  // Check if it contains only common UI words
  const commonUIWords = ['my', 'the', 'all', 'new', 'add', 'create', 'edit', 'delete', 'view', 'show', 'list', 'item', 'entry'];
  const words = normalizedName.split(' ').filter(w => w.length > 0);
  const isAllUIWords = words.length > 0 && words.every(w => commonUIWords.includes(w));
  
  if (isAllUIWords) {
    return { 
      valid: false, 
      message: `"${name}" appears to be a UI term, not an academic subject.` 
    };
  }
  
  return { valid: true, message: 'Valid subject' };
};

// Get all subjects
const getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find().sort({ createdAt: -1 });
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single subject by ID
const getSubjectById = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    res.json(subject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new subject
const createSubject = async (req, res) => {
  try {
    const { name, description, totalTopics, targetDays, topics } = req.body;
    
    // Validate subject name - reject non-academic subjects
    const validation = validateSubjectName(name);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.message });
    }
    
    // Normalize the subject name
    const normalizedName = normalizeSubjectName(name);
    
    // Check for duplicate subject (case-insensitive)
    const existingSubject = await Subject.findOne({ 
      name: { $regex: new RegExp(`^${normalizedName}$`, 'i') } 
    });
    
    if (existingSubject) {
      return res.status(400).json({ 
        error: `Subject "${normalizedName}" already exists!`,
        existingSubject: existingSubject
      });
    }
    
    const subject = new Subject({
      name: normalizedName,
      description,
      totalTopics,
      targetDays,
      topics
    });
    await subject.save();
    res.status(201).json(subject);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update subject
const updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    res.json(subject);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete subject
const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mark topic as completed
const markTopicCompleted = async (req, res) => {
  try {
    const { subjectId, topicIndex } = req.body;
    const subject = await Subject.findById(subjectId);
    
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    
    const topic = subject.topics[topicIndex];

    if (topic) {
      const wasCompleted = Boolean(topic.completed);

      subject.topics[topicIndex].completed = true;
      subject.completedTopics = subject.topics.filter(t => t.completed).length;
      subject.progress = Math.round((subject.completedTopics / subject.totalTopics) * 100);
      await subject.save();

      if (!wasCompleted) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let activity = await StudyActivity.findOne({ date: today });

        if (activity) {
          activity.studiedToday = true;
          activity.totalTopicsCompleted += 1;
          if (subject.name && !activity.subjectsStudied.includes(subject.name)) {
            activity.subjectsStudied.push(subject.name);
          }
          await activity.save();
        } else {
          activity = new StudyActivity({
            date: today,
            studiedToday: true,
            totalTopicsCompleted: 1,
            totalStudyMinutes: 0,
            subjectsStudied: subject.name ? [subject.name] : []
          });
          await activity.save();
        }
      }
    }
    
    res.json(subject);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update progress
const updateProgress = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    
    const { progress, completedTopics } = req.body;
    if (progress !== undefined) subject.progress = progress;
    if (completedTopics !== undefined) subject.completedTopics = completedTopics;
    
    await subject.save();
    res.json(subject);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getAllSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
  markTopicCompleted,
  updateProgress
};

