/**
 * authRoutes.js — Register, Login, Get Profile, Update Profile
 */
const express = require('express');
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

// ── Helper: generate JWT ─────────────────────────────────────────
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// ── POST /api/auth/register ──────────────────────────────────────
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please provide name, email and password' });
  }

  try {
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const user = await User.create({ name, email, password });

    res.status(201).json({
      _id  : user._id,
      name : user.name,
      email: user.email,
      role : user.role,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/auth/login ─────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id  : user._id,
      name : user.name,
      email: user.email,
      role : user.role,
      profile: user.profile,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/auth/me ─────────────────────────────────────────────
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PUT /api/auth/profile ────────────────────────────────────────
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update top-level fields
    if (req.body.name)  user.name  = req.body.name;

    // Update nested profile fields
    if (req.body.profile) {
      user.profile = { ...user.profile.toObject(), ...req.body.profile };
    }

    // Update password if provided
    if (req.body.password) {
      user.password = req.body.password; // pre-save hook will hash it
    }

    const updated = await user.save();
    res.json({
      _id    : updated._id,
      name   : updated.name,
      email  : updated.email,
      role   : updated.role,
      profile: updated.profile,
      token  : generateToken(updated._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/auth/subscribe ─────────────────────────────────────
router.post('/subscribe', protect, async (req, res) => {
  try {
    const subscription = req.body;
    if (!subscription) {
      return res.status(400).json({ message: 'Subscription is required' });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.pushSubscription = subscription;
    await user.save();

    res.status(201).json({ message: 'Push subscription saved successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
