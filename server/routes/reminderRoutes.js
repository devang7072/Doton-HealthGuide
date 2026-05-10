/**
 * reminderRoutes.js — CRUD for medicine/vaccine reminders
 * All routes are protected (requires JWT)
 */
const express  = require('express');
const Reminder = require('../models/Reminder');
const protect  = require('../middleware/authMiddleware');

const router = express.Router();

// ── GET /api/reminders — get all reminders for logged-in user ────
router.get('/', protect, async (req, res) => {
  try {
    const reminders = await Reminder.find({ userId: req.userId })
      .sort({ time: 1 });
    res.json(reminders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/reminders — create a new reminder ──────────────────
router.post('/', protect, async (req, res) => {
  const { name, type, time, note } = req.body;

  if (!name || !type || !time) {
    return res.status(400).json({ message: 'Name, type and time are required' });
  }

  try {
    const reminder = await Reminder.create({
      userId: req.userId,
      name,
      type,
      time: new Date(time),
      note: note || '',
    });
    res.status(201).json(reminder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── DELETE /api/reminders/:id — delete a reminder ───────────────
router.delete('/:id', protect, async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    // Ensure the reminder belongs to the requesting user
    if (reminder.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorised to delete this reminder' });
    }

    await reminder.deleteOne();
    res.json({ message: 'Reminder deleted', id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
