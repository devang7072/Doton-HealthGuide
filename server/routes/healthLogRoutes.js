/**
 * healthLogRoutes.js — Log and retrieve vitals/health metrics
 * All routes are protected (requires JWT)
 */
const express   = require('express');
const HealthLog = require('../models/HealthLog');
const protect   = require('../middleware/authMiddleware');

const router = express.Router();

const UNITS = {
  bp_systolic  : 'mmHg',
  bp_diastolic : 'mmHg',
  heart_rate   : 'bpm',
  blood_sugar  : 'mg/dL',
  weight       : 'kg',
  temperature  : '°C',
  oxygen_level : '%',
};

// ── GET /api/health-log — get user's health history ──────────────
// Optional query: ?metric=heart_rate&limit=30
router.get('/', protect, async (req, res) => {
  try {
    const filter = { userId: req.userId };
    if (req.query.metric) filter.metricType = req.query.metric;

    const limit = parseInt(req.query.limit) || 100;

    const logs = await HealthLog.find(filter)
      .sort({ loggedAt: -1 })
      .limit(limit);

    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/health-log — log a new vital reading ───────────────
router.post('/', protect, async (req, res) => {
  const { metricType, value, notes, loggedAt } = req.body;

  if (!metricType || value === undefined) {
    return res.status(400).json({ message: 'metricType and value are required' });
  }

  try {
    const log = await HealthLog.create({
      userId    : req.userId,
      metricType,
      value     : Number(value),
      unit      : UNITS[metricType] || '',
      notes     : notes || '',
      loggedAt  : loggedAt ? new Date(loggedAt) : new Date(),
    });
    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── DELETE /api/health-log/:id ────────────────────────────────────
router.delete('/:id', protect, async (req, res) => {
  try {
    const log = await HealthLog.findById(req.params.id);
    if (!log) return res.status(404).json({ message: 'Log entry not found' });

    if (log.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorised' });
    }

    await log.deleteOne();
    res.json({ message: 'Log entry deleted', id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
