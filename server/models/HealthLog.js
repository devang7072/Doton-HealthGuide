/**
 * HealthLog.js — Daily vitals / symptom log schema
 */
const mongoose = require('mongoose');

const healthLogSchema = new mongoose.Schema(
  {
    userId: {
      type    : mongoose.Schema.Types.ObjectId,
      ref     : 'User',
      required: true,
    },
    metricType: {
      type    : String,
      required: true,
      enum    : [
        'bp_systolic',   // mmHg
        'bp_diastolic',  // mmHg
        'heart_rate',    // bpm
        'blood_sugar',   // mg/dL
        'weight',        // kg
        'temperature',   // °C
        'oxygen_level',  // SpO2 %
      ],
    },
    value: {
      type    : Number,
      required: [true, 'Value is required'],
    },
    unit: {
      type   : String,
      default: '',
    },
    notes: {
      type   : String,
      default: '',
    },
    loggedAt: {
      type   : Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('HealthLog', healthLogSchema);
