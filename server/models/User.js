/**
 * User.js — Mongoose schema for registered users
 */
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type    : String,
      required: [true, 'Name is required'],
      trim    : true,
    },
    email: {
      type     : String,
      required : [true, 'Email is required'],
      unique   : true,
      lowercase: true,
      trim     : true,
    },
    password: {
      type    : String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    role: {
      type   : String,
      enum   : ['user', 'doctor', 'admin'],
      default: 'user',
    },
    profile: {
      age       : { type: Number },
      gender    : { type: String, enum: ['male', 'female', 'other', ''] },
      bloodGroup: { type: String },
      phone     : { type: String },
      district  : { type: String, default: 'Ludhiana' },
      conditions: { type: [String], default: [] }, // e.g. ['diabetes', 'hypertension']
    },
    pushSubscription: {
      type   : Object,
      default: null,
    },
  },
  { timestamps: true }
);

// ── Hash password before saving ──────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Instance method — compare plain text password with hash ──────
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
