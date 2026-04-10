const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  topicsCompleted: {
    type: Number,
    default: 0
  },
  studyTime: {
    type: Number,
    default: 0 // in minutes
  },
  notes: String
});

module.exports = mongoose.model('Progress', progressSchema);

