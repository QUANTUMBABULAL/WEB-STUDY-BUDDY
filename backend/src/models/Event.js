const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  start: { type: Date, required: true },
  backgroundColor: { type: String, default: '#2b9cf3' },
  borderColor: { type: String, default: '#2b9cf3' },
  textColor: { type: String, default: '#ffffff' },
  className: { type: String, default: '' },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Event', eventSchema);
