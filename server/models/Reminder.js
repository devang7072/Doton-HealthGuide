/**
 * Reminder.js — Medicine / Vaccine reminder schema
 */
const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema(
  {
    userId: {
      type    : mongoose.Schema.Types.ObjectId,
      ref     : 'User',
      required: true,
    },
    name: {
      type    : String,
      required: [true, 'Medicine name is required'],
      trim    : true,
    },
    type: {
      type    : String,
      required: [true, 'Type is required'],
      enum    : ['Medicine', 'Vaccine', 'Checkup', 'Other'],
    },
    time: {
      type    : Date,
      required: [true, 'Reminder time is required'],
    },
    note: {
      type   : String,
      default: '',
    },
    active: {
      type   : Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Reminder', reminderSchema);
