const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  completed: {
    type: Boolean,
    default: false
  },
  scheduledDate: Date,
  dayNumber: Number
});

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  totalTopics: {
    type: Number,
    default: 0
  },
  completedTopics: {
    type: Number,
    default: 0
  },
  progress: {
    type: Number,
    default: 0
  },
  topics: [topicSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  targetDays: {
    type: Number,
    default: 7
  },
  deadline: {
    type: Date,
    default: null
  }
});

module.exports = mongoose.model('Subject', subjectSchema);

