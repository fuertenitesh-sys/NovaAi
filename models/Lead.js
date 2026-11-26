const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Contact name is required'],
    trim: true,
    maxlength: 120
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    default: ''
  },
  company: {
    type: String,
    trim: true,
    maxlength: 140,
    default: 'Independent'
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  message: {
    type: String,
    trim: true,
    maxlength: 2000,
    default: ''
  },
  context: {
    type: String,
    trim: true,
    default: 'General Enterprise Inquiry'
  },
  page: {
    type: String,
    default: '/'
  },
  status: {
    type: String,
    enum: ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'CLOSED'],
    default: 'NEW'
  },
  ipAddress: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.models.Lead || mongoose.model('Lead', LeadSchema);
