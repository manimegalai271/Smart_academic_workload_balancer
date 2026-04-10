const mongoose = require('mongoose');

const studyActivitySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true
  },
  studiedToday: {
    type: Boolean,
    default: false
  },
  totalTopicsCompleted: {
    type: Number,
    default: 0
  },
  totalStudyMinutes: {
    type: Number,
    default: 0
  },
  subjectsStudied: [{
    type: String
  }]
});

module.exports = mongoose.model('StudyActivity', studyActivitySchema);

