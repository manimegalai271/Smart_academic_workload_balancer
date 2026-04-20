const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const subjectRoutes = require('./routes/subjectRoutes');
const progressRoutes = require('./routes/progressRoutes');
const activityRoutes = require('./routes/activityRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/subjects', subjectRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/events', require('./routes/eventRoutes'));

// AI Chat endpoint
app.post('/api/ai/chat', async (req, res) => {
  const { message } = req.body;
  
  try {
    const aiService = require('./services/aiService');
    const response = await aiService.processUserRequest(message);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// AI Quiz Generation endpoint
app.post('/api/generateQuiz', async (req, res) => {
  const { subjectName, topics, difficulty } = req.body;
  
  try {
    const aiService = require('./services/aiService');
    const questions = await aiService.generateQuizQuestions(subjectName, topics, difficulty);
    res.json({ questions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

