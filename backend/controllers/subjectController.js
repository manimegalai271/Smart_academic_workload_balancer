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

// Intelligent Pruning - Panic Mode (hide 30% supporting topics)
const pruneTopics = async (req, res) => {
  try {
    const { id } = req.params;
    const { panic = false } = req.query;
    
    const subject = await Subject.findById(id);
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    const visibleTopics = subject.topics.filter(t => !t.hidden);
    const totalVisible = visibleTopics.length;
    
    if (panic && totalVisible > 5) {
      // Sort by priority (core first), then difficulty, then index
      const sortedTopics = subject.topics.slice().sort((a, b) => {
        const prioA = a.priority === 'core' ? 0 : 1;
        const prioB = b.priority === 'core' ? 0 : 1;
        if (prioA !== prioB) return prioA - prioB;
        const diffA = { easy: 0, medium: 1, hard: 2 }[a.difficulty || 'medium'];
        const diffB = { easy: 0, medium: 1, hard: 2 }[b.difficulty || 'medium'];
        if (diffA !== diffB) return diffA - diffB;
        return (a.dayNumber || 999) - (b.dayNumber || 999);
      });

      // Mark bottom 30% as hidden (min 2 topics)
      const toHideCount = Math.max(2, Math.floor(totalVisible * 0.3));
      for (let i = totalVisible - toHideCount; i < totalVisible; i++) {
        sortedTopics[i].hidden = true;
      }

      // Update subject with new topics array order (core first)
      subject.topics = sortedTopics;
      
      // Recalc progress based on visible non-completed
      subject.totalTopics = subject.topics.filter(t => !t.hidden).length;
      subject.completedTopics = subject.topics.filter(t => !t.hidden && t.completed).length;
      subject.progress = subject.totalTopics > 0 ? Math.round((subject.completedTopics / subject.totalTopics) * 100) : 0;

      await subject.save();

      res.json({
        success: true,
        message: `Panic Mode activated! Hidden ${toHideCount} supporting topics. Focus on ${subject.totalTopics} core topics.`,
        hiddenCount: toHideCount,
        subject
      });
    } else {
      // Reset hidden
      let hiddenCount = 0;
      subject.topics.forEach(topic => {
        if (topic.hidden) {
          topic.hidden = false;
          hiddenCount++;
        }
      });
      
      // Recalc total
      subject.totalTopics = subject.topics.length;
      subject.completedTopics = subject.topics.filter(t => t.completed).length;
      subject.progress = subject.totalTopics > 0 ? Math.round((subject.completedTopics / subject.totalTopics) * 100) : 0;

      await subject.save();

      res.json({
        success: true,
        message: `Panic Mode deactivated. Restored ${hiddenCount} topics.`,
        subject
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mark topic as completed (updated for hidden topics)
const markTopicCompleted = async (req, res) => {
  try {
    const { subjectId, topicIndex } = req.body;
    const subject = await Subject.findById(subjectId);
    
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    
    const topic = subject.topics[topicIndex];

    if (topic && !topic.hidden) {  // Ignore hidden topics
      const wasCompleted = Boolean(topic.completed);

      subject.topics[topicIndex].completed = true;
      subject.completedTopics = subject.topics.filter(t => !t.hidden && t.completed).length;
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

// Get dependency graph (DAG topo sort + warnings)
const getDependencyGraph = async (req, res) => {
  try {
    const subjects = await Subject.find({ prerequisites: { $exists: true, $ne: [] } }).populate('prerequisites');
    const allSubjects = await Subject.find();

    // Build graph: { subjectId: { name, prereqs: [] } }
    const graph = {};
    const indegree = {};
    
    allSubjects.forEach(s => {
      graph[s._id.toString()] = { 
        id: s._id.toString(),
        name: s.name,
        progress: s.progress,
        prereqs: [],
        status: s.prerequisites.length === 0 ? 'ready' : 'locked'
      };
      indegree[s._id.toString()] = 0;
    });

    subjects.forEach(s => {
      s.prerequisites.forEach(prereqId => {
        const prereqStr = prereqId._id.toString();
        graph[s._id.toString()].prereqs.push(prereqStr);
        indegree[s._id.toString()]++;
      });
    });

    // Kahn's algorithm for topo sort, detect cycles
    const queue = Object.keys(graph).filter(id => indegree[id] === 0);
    const order = [];
    const visited = new Set();

    while (queue.length > 0) {
      const node = queue.shift();
      order.push(graph[node]);
      visited.add(node);

      Object.keys(graph).forEach(neighbor => {
        if (graph[node].prereqs.includes(neighbor)) {
          indegree[neighbor]--;
          if (indegree[neighbor] === 0) {
            queue.push(neighbor);
          }
        }
      });
    }

    const hasCycle = visited.size < Object.keys(graph).length;
    const warnings = [];

    if (hasCycle) {
      warnings.push('⚠️ Cycle detected in dependencies - review prereqs!');
    }

    // Check incomplete prereqs for ready subjects
    order.forEach(subject => {
      const incompletePrereqs = subject.prereqs.filter(prereqId => {
        const prereq = graph[prereqId];
        return prereq && prereq.progress < 100;
      });
      if (incompletePrereqs.length > 0) {
        subject.status = 'partial';
        warnings.push(`Partial prereqs for ${subject.name}`);
      }
    });

    res.json({
      graph: order,
      warnings,
      hasCycle,
      suggestedOrder: order.map(s => s.name).join(' → ')
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
  pruneTopics,
  markTopicCompleted,
  updateProgress,
  getDependencyGraph
};


