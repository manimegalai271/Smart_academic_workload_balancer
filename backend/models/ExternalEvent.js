const mongoose = require('mongoose');

const externalEventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  type: {
    type: String,
    enum: ['job', 'class', 'sleep', 'meal', 'exercise', 'social', 'other'],
    default: 'other'
  },
  recurring: {
    type: Boolean,
    default: false
  },
  color: {
    type: String,
    default: '#3498db'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for day key (YYYY-MM-DD)
externalEventSchema.virtual('dayKey').get(function() {
  const date = new Date(this.startDate);
  return date.toISOString().split('T')[0];
});

externalEventSchema.index({ startDate: 1 });
externalEventSchema.index({ dayKey: 1 });

module.exports = mongoose.model('ExternalEvent', externalEventSchema);

