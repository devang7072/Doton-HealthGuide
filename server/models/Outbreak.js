/**
 * Outbreak.js — Crowdsourced disease outbreak report schema
 */
const mongoose = require('mongoose');

const outbreakSchema = new mongoose.Schema(
  {
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref : 'User',
    },
    district: {
      type    : String,
      required: [true, 'District is required'],
      trim    : true,
    },
    disease: {
      type    : String,
      required: [true, 'Disease name is required'],
      trim    : true,
    },
    severity: {
      type   : String,
      enum   : ['low', 'med', 'high'],
      default: 'med',
    },
    cases: {
      type   : Number,
      default: 0,
    },
    description: {
      type   : String,
      default: '',
    },
    verified: {
      type   : Boolean,
      default: false,  // Doctors can verify reports in the future
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref : 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Outbreak', outbreakSchema);
