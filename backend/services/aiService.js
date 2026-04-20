const Subject = require('../models/Subject');

// Predefined topic breakdowns for common subjects
const subjectTopics = {
  'operating system': [
    'Introduction to Operating Systems',
    'Process Management',
    'CPU Scheduling',
    'Process Synchronization',
    'Deadlocks',
    'Memory Management',
    'Virtual Memory',
    'File Systems',
    'I/O Systems',
    'Disk Management',
    'Operating System Security',
    'Case Study: Linux/Windows'
  ],
  'data structure': [
    'Fundamentals',
    'Arrays',
    'Linked Lists',
    'Stacks',
    'Queues',
    'Trees',
    'Binary Search Trees',
    'AVL Trees',
    'B Trees',
    'Heaps',
    'Hash Tables',
    'Graphs',
    'Graph Traversal',
    'Sorting Algorithms',
    'Searching Algorithms',
    'Recursion',
    'Dynamic Programming'
  ],
  'data structures': [
    'Fundamentals',
    'Arrays',
    'Linked Lists',
    'Stacks',
    'Queues',
    'Trees',
    'Binary Search Trees',
    'AVL Trees',
    'B Trees',
    'Heaps',
    'Hash Tables',
    'Graphs',
    'Graph Traversal',
    'Sorting Algorithms',
    'Searching Algorithms',
    'Recursion',
    'Dynamic Programming'
  ],
  'database': [
    'Introduction to DBMS',
    'Data Models',
    'ER Model',
    'Relational Model',
    'SQL Basics',
    'Advanced SQL',
    'Normalization',
    'Keys and Constraints',
    'Transaction Management',
    'Concurrency Control',
    'Indexing',
    'Query Optimization',
    'NoSQL Databases'
  ],
  'computer network': [
    'Introduction to Computer Networks',
    'Network Models',
    'Physical Layer',
    'Data Link Layer',
    'Network Layer',
    'Transport Layer',
    'Application Layer',
    'IP Addressing',
    'Routing Algorithms',
    'TCP/IP Protocol Suite',
    'Network Security',
    'Wireless Networks'
  ],
  'computer networks': [
    'Introduction to Computer Networks',
    'Network Models',
    'Physical Layer',
    'Data Link Layer',
    'Network Layer',
    'Transport Layer',
    'Application Layer',
    'IP Addressing',
    'Routing Algorithms',
    'TCP/IP Protocol Suite',
    'Network Security',
    'Wireless Networks'
  ],
  'algorithm': [
    'Introduction to Algorithms',
    'Time and Space Complexity',
    'Asymptotic Notation',
    'Recursion',
    'Divide and Conquer',
    'Greedy Algorithms',
    'Dynamic Programming',
    'Graph Algorithms',
    'Sorting Algorithms',
    'Searching Algorithms',
    'Hashing Techniques',
    'String Algorithms',
    'NP-Completeness'
  ],
  'algorithms': [
    'Introduction to Algorithms',
    'Time and Space Complexity',
    'Asymptotic Notation',
    'Recursion',
    'Divide and Conquer',
    'Greedy Algorithms',
    'Dynamic Programming',
    'Graph Algorithms',
    'Sorting Algorithms',
    'Searching Algorithms',
    'Hashing Techniques',
    'String Algorithms',
    'NP-Completeness'
  ],
  'machine learning': [
    'Introduction to Machine Learning',
    'Supervised Learning',
    'Linear Regression',
    'Logistic Regression',
    'Decision Trees',
    'Random Forests',
    'Support Vector Machines',
    'Neural Networks',
    'Deep Learning',
    'Unsupervised Learning',
    'Clustering',
    'Dimensionality Reduction',
    'Model Evaluation'
  ]
};

// Default topic generator for unknown subjects
const generateDefaultTopics = (subjectName, count = 14) => {
  const defaultTopics = [
    'Fundamentals',
    'Introduction & Basics',
    'Core Concepts',
    'Principles',
    'Implementation',
    'Practical Applications',
    'Advanced Topics',
    'Best Practices',
    'Common Patterns',
    'Real-world Examples',
    'Troubleshooting',
    'Optimization',
    'Review & Summary',
    'Assessment'
  ];
  
  const topics = [];
  for (let i = 0; i < Math.min(count, defaultTopics.length); i++) {
    topics.push(`${subjectName} - ${defaultTopics[i]}`);
  }
  return topics;
};

// Parse user message to extract subject and days
const parseUserRequest = (message) => {
  const lowerMessage = message.toLowerCase();
  
  // Extract number of days
  const dayMatch = lowerMessage.match(/(\d+)\s*days?/);
  const days = dayMatch ? parseInt(dayMatch[1]) : 7;
  
  // Extract subject name
  let subject = null;
  const subjects = Object.keys(subjectTopics);
  for (const subj of subjects) {
    if (lowerMessage.includes(subj)) {
      subject = subj;
      break;
    }
  }
  
  // If no predefined subject, try to extract from common patterns
  if (!subject) {
    const subjectMatch = message.match(/(?:study|learn|finish|complete|balance)\s+(?:my\s+)?(.+?)(?:\s+in|\s+for|\s+topics|$)/i);
    if (subjectMatch) {
      subject = subjectMatch[1].trim();
    }
  }
  
  return { subject, days };
};

// Balance topics across days (avoid heavy workload)
const balanceTopics = (topics, days) => {
  const schedule = [];
  const topicsPerDay = Math.ceil(topics.length / days);
  
  for (let i = 0; i < days; i++) {
    const start = i * topicsPerDay;
    const end = Math.min(start + topicsPerDay, topics.length);
    const dayTopics = topics.slice(start, end);
    
    // Make first days easier topics
    if (i < Math.floor(days / 3)) {
      schedule.push({
        day: i + 1,
        topics: dayTopics,
        difficulty: 'easy',
        focus: 'Foundation Building'
      });
    } else if (i < Math.floor(2 * days / 3)) {
      schedule.push({
        day: i + 1,
        topics: dayTopics,
        difficulty: 'medium',
        focus: 'Core Concepts'
      });
    } else {
      schedule.push({
        day: i + 1,
        topics: dayTopics,
        difficulty: 'medium',
        focus: 'Advanced Topics'
      });
    }
  }
  
  return schedule;
};

// Main AI service function
const processUserRequest = async (message) => {
  const { subject, days } = parseUserRequest(message);
  
  if (!subject) {
    return {
      success: false,
      message: "I couldn't identify the subject. Please specify a subject like 'Operating System', 'Data Structures', etc.",
      suggestions: [
        "Balance my Operating System study topics",
        "Create a study schedule for Data Structures",
        "I have an exam in 10 days, balance my study workload",
        "Show my study progress"
      ]
    };
  }
  
  // Get topics for the subject
  let topics = subjectTopics[subject.toLowerCase()] || generateDefaultTopics(subject, days * 2);
  
  // Limit topics based on days
  topics = topics.slice(0, days * 2);
  
  // Create balanced schedule
  const schedule = balanceTopics(topics, days);
  
  // Save subject to database
  const subjectDoc = new Subject({
    name: subject.charAt(0).toUpperCase() + subject.slice(1),
    description: `AI-balanced study plan for ${days} days`,
    totalTopics: topics.length,
    targetDays: days,
    topics: topics.map((topic, index) => ({
      name: topic,
      difficulty: index < topics.length / 3 ? 'easy' : index < 2 * topics.length / 3 ? 'medium' : 'hard',
      priority: index < topics.length * 0.7 ? 'core' : 'supporting',
      dayNumber: Math.floor(index / (topics.length / days)) + 1
    }))
  });
  
  await subjectDoc.save();
  
  // Format response
  let responseMessage = `📚 **${subjectDoc.name} Study Plan**\n\n`;
  responseMessage += `I have created a balanced ${days}-day study plan for you!\n\n`;
  responseMessage += `**Progress: 0% completed**\n\n`;
  responseMessage += `📅 **Your Schedule:**\n\n`;
  
  schedule.forEach(day => {
    responseMessage += `**Day ${day.day}** - ${day.focus}\n`;
    day.topics.forEach(topic => {
      responseMessage += `  • ${topic}\n`;
    });
    responseMessage += '\n';
  });
  
  responseMessage += `✅ This plan is designed to prevent overload and help you complete the syllabus!\n`;
  responseMessage += `\n💡 Tips:\n`;
  responseMessage += `• Start with easier topics to build confidence\n`;
  responseMessage += `• Take short breaks between topics\n`;
  responseMessage += `• Mark topics as completed to track progress\n`;
  
  return {
    success: true,
    message: responseMessage,
    subjectId: subjectDoc._id,
    schedule: schedule,
    progress: 0,
    totalTopics: topics.length
  };
};

// Get progress for all subjects
const getProgress = async () => {
  const subjects = await Subject.find();
  
  return subjects.map(subj => ({
    id: subj._id,
    name: subj.name,
    progress: subj.progress,
    completedTopics: subj.completedTopics,
    totalTopics: subj.totalTopics
  }));
};

// Fisher-Yates shuffle algorithm for randomizing arrays
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Shuffle answer options for a question
const shuffleOptions = (question) => {
  const options = [
    { key: 'A', value: question.options.A },
    { key: 'B', value: question.options.B },
    { key: 'C', value: question.options.C },
    { key: 'D', value: question.options.D }
  ];
  
  const shuffledOptions = shuffleArray(options);
  const newOptions = {};
  let newCorrectAnswer = question.correctAnswer;
  
  shuffledOptions.forEach((opt, index) => {
    const newKey = String.fromCharCode(65 + index); // A, B, C, D
    newOptions[newKey] = opt.value;
    if (opt.key === question.correctAnswer) {
      newCorrectAnswer = newKey;
    }
  });
  
  return {
    ...question,
    options: newOptions,
    correctAnswer: newCorrectAnswer
  };
};

// Generate AI Quiz Questions
const generateQuizQuestions = async (subjectName, topics, difficulty = 'medium') => {
  // Build difficulty distribution
  let difficultyText = '';
  if (difficulty === 'easy') {
    difficultyText = 'All questions should be easy - basic definitions and simple concepts.';
  } else if (difficulty === 'hard') {
    difficultyText = 'All questions should be hard - scenario-based and analytical questions.';
  } else {
    difficultyText = 'Mix of difficulty: 2 easy, 2 medium, 1 hard questions.';
  }
  
  // Get topic names for the quiz
  const topicNames = topics.map(t => t.name || t).slice(0, 10); // Use up to 10 topics
  
  const prompt = `
Generate 5 MCQ quiz questions for the subject: ${subjectName}

Topics covered: ${topicNames.join(', ')}

${difficultyText}

Format each question as follows (use this exact format):
---
QUESTION: [question text]
A) [option A]
B) [option B]
C) [option C]
D) [option D]
ANSWER: [correct answer letter]
EXPLANATION: [brief explanation of why this is the correct answer]
---
  `.trim();

  // Try to use OpenAI if available, otherwise generate fallback questions
  try {
    // Check if OpenAI is configured
    if (process.env.OPENAI_API_KEY) {
      const { default: OpenAI } = await import('openai');
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7
      });
      
      const content = response.choices[0].message.content;
      return parseQuizResponse(content);
    } else {
      // Return fallback questions if no API key
      return generateFallbackQuestions(subjectName, topicNames);
    }
  } catch (error) {
    console.log('OpenAI not available, using fallback questions:', error.message);
    return generateFallbackQuestions(subjectName, topicNames);
  }
};

// Parse AI response into structured quiz questions
const parseQuizResponse = (content) => {
  const questions = [];
  const blocks = content.split('---').filter(block => block.trim());
  
  for (const block of blocks) {
    const lines = block.trim().split('\n');
    let question = {
      question: '',
      options: { A: '', B: '', C: '', D: '' },
      correctAnswer: '',
      explanation: ''
    };
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('QUESTION:')) {
        question.question = trimmedLine.replace('QUESTION:', '').trim();
      } else if (trimmedLine.startsWith('A)')) {
        question.options.A = trimmedLine.replace('A)', '').trim();
      } else if (trimmedLine.startsWith('B)')) {
        question.options.B = trimmedLine.replace('B)', '').trim();
      } else if (trimmedLine.startsWith('C)')) {
        question.options.C = trimmedLine.replace('C)', '').trim();
      } else if (trimmedLine.startsWith('D)')) {
        question.options.D = trimmedLine.replace('D)', '').trim();
      } else if (trimmedLine.startsWith('ANSWER:')) {
        const answer = trimmedLine.replace('ANSWER:', '').trim().toUpperCase();
        question.correctAnswer = answer.charAt(0);
      } else if (trimmedLine.startsWith('EXPLANATION:')) {
        question.explanation = trimmedLine.replace('EXPLANATION:', '').trim();
      }
    }
    
    // Only add if we have a valid question
    if (question.question && question.correctAnswer) {
      questions.push(question);
    }
  }
  
  return questions;
};

// Generate fallback questions when OpenAI is not available
// Expanded question pool with 15-16 questions per subject for variety
const generateFallbackQuestions = (subjectName, topics) => {
  const fallbackQuestions = {
    'Operating System': [
      {
        question: 'What is the main function of an Operating System?',
        options: { A: 'Compile programs', B: 'Manage hardware and software resources', C: 'Run web browsers', D: 'Store files' },
        correctAnswer: 'B',
        explanation: 'An OS manages hardware and software resources including CPU, memory, and I/O devices.'
      },
      {
        question: 'What is a process in an Operating System?',
        options: { A: 'A file on disk', B: 'A program in execution', C: 'A hardware component', D: 'A network connection' },
        correctAnswer: 'B',
        explanation: 'A process is a program in execution, which includes the program code and its current activity.'
      },
      {
        question: 'What is CPU scheduling?',
        options: { A: 'Loading programs into memory', B: 'Allocating CPU time to processes', C: 'Managing disk storage', D: 'Handling user input' },
        correctAnswer: 'B',
        explanation: 'CPU scheduling is the process of deciding which process runs on the CPU at any given time.'
      },
      {
        question: 'What is a deadlock?',
        options: { A: 'System crash', B: 'Circular waiting for resources', C: 'Memory overflow', D: 'Network failure' },
        correctAnswer: 'B',
        explanation: 'A deadlock occurs when two or more processes are waiting for resources held by each other.'
      },
      {
        question: 'What is virtual memory?',
        options: { A: 'Extra physical RAM', B: 'Disk space used as RAM', C: 'Cache memory', D: 'Register memory' },
        correctAnswer: 'B',
        explanation: 'Virtual memory uses disk space to extend the available memory beyond physical RAM.'
      },
      {
        question: 'What is the purpose of a semaphore?',
        options: { A: 'Store temporary data', B: 'Synchronize processes', C: 'Manage files', D: 'Allocate memory' },
        correctAnswer: 'B',
        explanation: 'A semaphore is a synchronization primitive used to control access to shared resources.'
      },
      {
        question: 'What is paging in memory management?',
        options: { A: 'Compacting memory', B: 'Dividing memory into fixed-size pages', C: 'Swapping processes', D: 'Allocating stack space' },
        correctAnswer: 'B',
        explanation: 'Paging divides memory into fixed-size blocks called pages, enabling efficient memory usage.'
      },
      {
        question: 'What is a thread?',
        options: { A: 'A lightweight process', B: 'A file handle', C: 'A network connection', D: 'A memory segment' },
        correctAnswer: 'A',
        explanation: 'A thread is a lightweight unit of execution within a process, sharing resources with other threads.'
      },
      {
        question: 'What is thrashing?',
        options: { A: 'CPU overheating', B: 'Excessive paging activity', C: 'Memory leak', D: 'Process termination' },
        correctAnswer: 'B',
        explanation: 'Thrashing occurs when the system spends more time paging than executing processes.'
      },
      {
        question: 'What is the difference between preemptive and non-preemptive scheduling?',
        options: { A: 'Preemptive is slower', B: 'Preemptive can interrupt running processes', C: 'Non-preemptive is faster', D: 'There is no difference' },
        correctAnswer: 'B',
        explanation: 'Preemptive scheduling allows the OS to interrupt a running process, while non-preemptive does not.'
      },
      {
        question: 'What is a context switch?',
        options: { A: 'Changing user accounts', B: 'Saving and loading process state', C: 'Switching between applications', D: 'Changing network protocols' },
        correctAnswer: 'B',
        explanation: 'A context switch saves the state of a running process and loads another process for execution.'
      },
      {
        question: 'What is the purpose of the kernel?',
        options: { A: 'User interface', B: 'Core of the operating system', C: 'Application software', D: 'Network driver' },
        correctAnswer: 'B',
        explanation: 'The kernel is the core component of an OS that manages system resources and hardware.'
      },
      {
        question: 'What is fragmentation in memory?',
        options: { A: 'Memory compression', B: 'Scattered unused memory spaces', C: 'Memory encryption', D: 'Memory backup' },
        correctAnswer: 'B',
        explanation: 'Fragmentation occurs when free memory is divided into small non-contiguous blocks.'
      },
      {
        question: 'What is a file system?',
        options: { A: 'A type of software', B: 'Method of organizing files on storage', C: 'A network protocol', D: 'A programming language' },
        correctAnswer: 'B',
        explanation: 'A file system is a method used to store, organize, and manage files on storage devices.'
      },
      {
        question: 'What is RAID?',
        options: { A: 'A programming language', B: 'Redundant Array of Independent Disks', C: 'A network protocol', D: 'An operating system' },
        correctAnswer: 'B',
        explanation: 'RAID is a technology for combining multiple disks for better performance and reliability.'
      },
      {
        question: 'What is the purpose of cache memory?',
        options: { A: 'Permanent storage', B: 'Fast access to frequently used data', C: 'Network buffering', D: 'File storage' },
        correctAnswer: 'B',
        explanation: 'Cache memory provides fast access to frequently used data by storing it closer to the CPU.'
      }
    ],
    'Database Management System': [
      {
        question: 'What does DBMS stand for?',
        options: { A: 'Database Management System', B: 'Data Backup Management System', C: 'Digital Business Management System', D: 'Database Monitoring System' },
        correctAnswer: 'A',
        explanation: 'DBMS stands for Database Management System, software for creating and managing databases.'
      },
      {
        question: 'What is a primary key?',
        options: { A: 'First column in a table', B: 'Unique identifier for a record', C: 'Foreign table reference', D: 'Index for faster search' },
        correctAnswer: 'B',
        explanation: 'A primary key is a unique identifier for each record in a database table.'
      },
      {
        question: 'What is normalization in databases?',
        options: { A: 'Converting data to numbers', B: 'Organizing data to reduce redundancy', C: 'Creating backups', D: 'Encrypting data' },
        correctAnswer: 'B',
        explanation: 'Normalization organizes data into tables to minimize redundancy and improve data integrity.'
      },
      {
        question: 'What is SQL?',
        options: { A: 'Programming language', B: 'Query language for databases', C: 'Operating system', D: 'Web browser' },
        correctAnswer: 'B',
        explanation: 'SQL (Structured Query Language) is used to manage and manipulate relational databases.'
      },
      {
        question: 'What is a foreign key?',
        options: { A: 'Primary key in another table', B: 'Unique index', C: 'Password field', D: 'Timestamp column' },
        correctAnswer: 'A',
        explanation: 'A foreign key is a field that references a primary key in another table.'
      },
      {
        question: 'What is a join operation in SQL?',
        options: { A: 'Combining two tables', B: 'Deleting records', C: 'Creating indexes', D: 'Backing up data' },
        correctAnswer: 'A',
        explanation: 'A join operation combines rows from two or more tables based on a related column.'
      },
      {
        question: 'What is a transaction in databases?',
        options: { A: 'A single query', B: 'A sequence of operations as a unit', C: 'A table backup', D: 'A user login' },
        correctAnswer: 'B',
        explanation: 'A transaction is a sequence of database operations treated as a single unit of work.'
      },
      {
        question: 'What does ACID stand for in databases?',
        options: { A: 'Automated Computer Information Data', B: 'Atomicity, Consistency, Isolation, Durability', C: 'Advanced Computer Integrated Database', D: 'Array of Complex Indexed Data' },
        correctAnswer: 'B',
        explanation: 'ACID properties ensure reliable database transactions: Atomicity, Consistency, Isolation, Durability.'
      },
      {
        question: 'What is indexing in databases?',
        options: { A: 'Creating duplicate tables', B: 'Data structure for faster retrieval', C: 'Deleting old records', D: 'Encrypting data' },
        correctAnswer: 'B',
        explanation: 'Indexing creates data structures that improve the speed of data retrieval operations.'
      },
      {
        question: 'What is a view in databases?',
        options: { A: 'A physical table', B: 'Virtual table based on query results', C: 'A backup copy', D: 'An index structure' },
        correctAnswer: 'B',
        explanation: 'A view is a virtual table generated from a query, not stored as actual data.'
      },
      {
        question: 'What is data warehousing?',
        options: { A: 'Storing data in files', B: 'Large repository for analytical queries', C: 'Database encryption', D: 'Data compression' },
        correctAnswer: 'B',
        explanation: 'A data warehouse is a large repository designed for analytical querying and reporting.'
      },
      {
        question: 'What is a trigger in databases?',
        options: { A: 'A type of index', B: 'Automatic action on events', C: 'A backup mechanism', D: 'A user permission' },
        correctAnswer: 'B',
        explanation: 'A trigger is a stored procedure that automatically executes when specific events occur.'
      },
      {
        question: 'What is the difference between DELETE and TRUNCATE?',
        options: { A: 'They are the same', B: 'DELETE removes rows one by one, TRUNCATE removes all', C: 'TRUNCATE is slower', D: 'DELETE cannot be rolled back' },
        correctAnswer: 'B',
        explanation: 'DELETE removes rows individually and can be rolled back; TRUNCATE removes all rows at once.'
      },
      {
        question: 'What is a stored procedure?',
        options: { A: 'A database table', B: 'Precompiled SQL code stored in database', C: 'A type of index', D: 'A backup file' },
        correctAnswer: 'B',
        explanation: 'A stored procedure is precompiled SQL code that can be executed repeatedly.'
      },
      {
        question: 'What is NoSQL database?',
        options: { A: 'SQL without queries', B: 'Non-relational database', C: 'New SQL version', D: 'Encrypted SQL' },
        correctAnswer: 'B',
        explanation: 'NoSQL databases are non-relational databases designed for flexible schemas and scalability.'
      },
      {
        question: 'What is database replication?',
        options: { A: 'Copying data to multiple locations', B: 'Deleting duplicate records', C: 'Creating indexes', D: 'Running queries' },
        correctAnswer: 'A',
        explanation: 'Replication involves copying and maintaining database data across multiple locations.'
      }
    ],
    'Data Structures': [
      {
        question: 'What is an array?',
        options: { A: 'Collection of different data types', B: 'Linear collection of same-type elements', C: 'Hierarchical structure', D: 'Dynamic memory allocation' },
        correctAnswer: 'B',
        explanation: 'An array is a linear data structure that stores elements of the same type in contiguous memory.'
      },
      {
        question: 'What is the time complexity of binary search?',
        options: { A: 'O(n)', B: 'O(log n)', C: 'O(n²)', D: 'O(1)' },
        correctAnswer: 'B',
        explanation: 'Binary search has O(log n) time complexity as it divides the search space in half each iteration.'
      },
      {
        question: 'What is a linked list?',
        options: { A: 'Array of pointers', B: 'Nodes connected by pointers', C: 'Stack implementation', D: 'Hash table' },
        correctAnswer: 'B',
        explanation: 'A linked list consists of nodes where each node contains data and a pointer to the next node.'
      },
      {
        question: 'What is a stack?',
        options: { A: 'FIFO data structure', B: 'LIFO data structure', C: 'Priority queue', D: 'Tree structure' },
        correctAnswer: 'B',
        explanation: 'Stack follows Last In First Out (LIFO) principle - last element added is first to be removed.'
      },
      {
        question: 'What is a binary search tree?',
        options: { A: 'Tree with 2 nodes', B: 'Tree where left child < parent < right child', C: 'Complete binary tree', D: 'Balanced tree' },
        correctAnswer: 'B',
        explanation: 'In BST, left child contains values less than parent, right child contains values greater than parent.'
      },
      {
        question: 'What is a queue data structure?',
        options: { A: 'LIFO structure', B: 'FIFO structure', C: 'Random access structure', D: 'Hierarchical structure' },
        correctAnswer: 'B',
        explanation: 'Queue follows First In First Out (FIFO) principle - first element added is first to be removed.'
      },
      {
        question: 'What is a hash table?',
        options: { A: 'Tree-based structure', B: 'Uses hash function for indexing', C: 'Linked list variant', D: 'Sorting algorithm' },
        correctAnswer: 'B',
        explanation: 'A hash table uses a hash function to compute an index into an array of buckets or slots.'
      },
      {
        question: 'What is the time complexity of accessing an element in an array?',
        options: { A: 'O(n)', B: 'O(log n)', C: 'O(1)', D: 'O(n²)' },
        correctAnswer: 'C',
        explanation: 'Array provides O(1) constant time access as elements are stored in contiguous memory.'
      },
      {
        question: 'What is a heap data structure?',
        options: { A: 'Tree with min or max at root', B: 'Linked list variant', C: 'Hash table', D: 'Stack implementation' },
        correctAnswer: 'A',
        explanation: 'A heap is a complete binary tree where either minimum or maximum element is at the root.'
      },
      {
        question: 'What is recursion?',
        options: { A: 'Loop iteration', B: 'Function calling itself', C: 'Array sorting', D: 'Memory allocation' },
        correctAnswer: 'B',
        explanation: 'Recursion is a programming technique where a function calls itself to solve smaller subproblems.'
      },
      {
        question: 'What is a graph?',
        options: { A: 'Linear data structure', B: 'Collection of nodes and edges', C: 'Tree structure', D: 'Array variant' },
        correctAnswer: 'B',
        explanation: 'A graph is a data structure consisting of vertices (nodes) connected by edges.'
      },
      {
        question: 'What is BFS (Breadth-First Search)?',
        options: { A: 'Search level by level', B: 'Search from root to leaves', C: 'Depth traversal', D: 'Random search' },
        correctAnswer: 'A',
        explanation: 'BFS explores all neighbors at the present depth before moving to the next level.'
      },
      {
        question: 'What is DFS (Depth-First Search)?',
        options: { A: 'Search level by level', B: 'Explore as deep as possible', C: 'Random search', D: 'Binary search variant' },
        correctAnswer: 'B',
        explanation: 'DFS explores as far as possible along each branch before backtracking.'
      },
      {
        question: 'What is a trie data structure?',
        options: { A: 'Tree for string operations', B: 'Hash table variant', C: 'Queue implementation', D: 'Stack variant' },
        correctAnswer: 'A',
        explanation: 'A trie (prefix tree) is a tree data structure used for efficient string operations like autocomplete.'
      },
      {
        question: 'What is the space complexity of a linked list?',
        options: { A: 'O(1)', B: 'O(n)', C: 'O(log n)', D: 'O(n²)' },
        correctAnswer: 'B',
        explanation: 'Linked list has O(n) space complexity as it stores n elements plus pointer overhead.'
      },
      {
        question: 'What is a balanced binary search tree?',
        options: { A: 'Tree with equal nodes', B: 'Tree with height difference bounded', C: 'Complete binary tree', D: 'Full binary tree' },
        correctAnswer: 'B',
        explanation: 'A balanced BST maintains O(log n) height, ensuring efficient operations even with many elements.'
      }
    ],
    'Computer Networks': [
      {
        question: 'What does HTTP stand for?',
        options: { A: 'HyperText Transfer Protocol', B: 'High Transfer Text Protocol', C: 'HyperText Transmission Process', D: 'Host Text Transfer Protocol' },
        correctAnswer: 'A',
        explanation: 'HTTP (HyperText Transfer Protocol) is used for transmitting web pages on the internet.'
      },
      {
        question: 'What is the OSI model?',
        options: { A: 'Network hardware standard', B: '7-layer networking model', C: 'Internet protocol', D: 'Web browser' },
        correctAnswer: 'B',
        explanation: 'OSI (Open Systems Interconnection) is a 7-layer conceptual model for network communication.'
      },
      {
        question: 'What is an IP address?',
        options: { A: 'Email address', B: 'Unique device identifier on network', C: 'Phone number', D: 'Website URL' },
        correctAnswer: 'B',
        explanation: 'An IP address is a unique numerical identifier assigned to each device connected to a network.'
      },
      {
        question: 'What does TCP stand for?',
        options: { A: 'Transfer Control Protocol', B: 'Transmission Control Protocol', C: 'Text Communication Protocol', D: 'Technical Computer Protocol' },
        correctAnswer: 'B',
        explanation: 'TCP (Transmission Control Protocol) ensures reliable, ordered delivery of data between devices.'
      },
      {
        question: 'What is a router?',
        options: { A: 'Connects computers in a LAN', B: 'Forwards data between networks', C: 'Modulates signals', D: 'Stores web pages' },
        correctAnswer: 'B',
        explanation: 'A router forwards data packets between different networks, determining the best path.'
      },
      {
        question: 'What is DNS?',
        options: { A: 'Network security protocol', B: 'Domain Name System', C: 'Data Network Service', D: 'Dynamic Network System' },
        correctAnswer: 'B',
        explanation: 'DNS translates domain names into IP addresses, making websites accessible by name.'
      },
      {
        question: 'What is the difference between TCP and UDP?',
        options: { A: 'They are the same', B: 'TCP is reliable, UDP is faster', C: 'UDP is more secure', D: 'TCP is connectionless' },
        correctAnswer: 'B',
        explanation: 'TCP provides reliable, ordered delivery; UDP is faster but doesn\'t guarantee delivery.'
      },
      {
        question: 'What is a subnet mask?',
        options: { A: 'Network password', B: 'Identifies network and host portions', C: 'Firewall rule', D: 'IP version number' },
        correctAnswer: 'B',
        explanation: 'A subnet mask divides an IP address into network and host portions.'
      },
      {
        question: 'What is a firewall?',
        options: { A: 'Network cable', B: 'Security system controlling traffic', C: 'Web browser', D: 'Email client' },
        correctAnswer: 'B',
        explanation: 'A firewall monitors and controls incoming and outgoing network traffic based on security rules.'
      },
      {
        question: 'What does FTP stand for?',
        options: { A: 'File Transfer Protocol', B: 'Fast Transfer Process', C: 'File Transmission Program', D: 'Foreign Transfer Protocol' },
        correctAnswer: 'A',
        explanation: 'FTP (File Transfer Protocol) is used for transferring files between a client and server.'
      },
      {
        question: 'What is a switch in networking?',
        options: { A: 'Router device', B: 'Connects devices within a network', C: 'Modem device', D: 'Firewall device' },
        correctAnswer: 'B',
        explanation: 'A switch connects devices within a network and uses MAC addresses to forward data.'
      },
      {
        question: 'What is latency in networks?',
        options: { A: 'Network speed', B: 'Delay in data transmission', C: 'Bandwidth capacity', D: 'Packet loss' },
        correctAnswer: 'B',
        explanation: 'Latency is the time delay in data transmission over a network.'
      },
      {
        question: 'What is bandwidth?',
        options: { A: 'Network delay', B: 'Maximum data transfer rate', C: 'Network security', D: 'IP address range' },
        correctAnswer: 'B',
        explanation: 'Bandwidth is the maximum amount of data that can be transmitted over a network in a given time.'
      },
      {
        question: 'What is DHCP?',
        options: { A: 'Network security protocol', B: 'Automatically assigns IP addresses', C: 'File transfer protocol', D: 'Email protocol' },
        correctAnswer: 'B',
        explanation: 'DHCP (Dynamic Host Configuration Protocol) automatically assigns IP addresses to network devices.'
      },
      {
        question: 'What is a VPN?',
        options: { A: 'Virus Protection Network', B: 'Virtual Private Network', C: 'Very Fast Network', D: 'Visual Protocol Network' },
        correctAnswer: 'B',
        explanation: 'A VPN creates a secure, encrypted connection over a less secure network like the internet.'
      },
      {
        question: 'What is the purpose of ARP?',
        options: { A: 'Routing packets', B: 'Maps IP to MAC addresses', C: 'Translating domain names', D: 'Encrypting data' },
        correctAnswer: 'B',
        explanation: 'ARP (Address Resolution Protocol) maps IP addresses to MAC addresses in a local network.'
      }
    ]
  };
  
  // Get questions for the subject or use generic ones
  const normalizedSubject = subjectName.toLowerCase();
  let questions = fallbackQuestions['Operating System']; // Default
  
  for (const [key, value] of Object.entries(fallbackQuestions)) {
    if (normalizedSubject.includes(key.toLowerCase()) || key.toLowerCase().includes(normalizedSubject)) {
      questions = value;
      break;
    }
  }
  
  // Randomly select 5 questions from the pool
  const shuffledQuestions = shuffleArray(questions);
  const selectedQuestions = shuffledQuestions.slice(0, 5);
  
  // Shuffle answer options for each selected question
  const randomizedQuestions = selectedQuestions.map(q => shuffleOptions(q));
  
  return randomizedQuestions;
};

module.exports = {
  processUserRequest,
  getProgress,
  subjectTopics,
  generateQuizQuestions
};

