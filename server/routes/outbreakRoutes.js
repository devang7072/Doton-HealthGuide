/**
 * outbreakRoutes.js — Crowdsourced outbreak reports
 * GET is public (anyone can see outbreaks)
 * POST requires login
 */
const express  = require('express');
const Outbreak = require('../models/Outbreak');
const protect  = require('../middleware/authMiddleware');

const router = express.Router();

// ── GET /api/outbreaks — get all outbreak reports (public) ────────
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.district)  filter.district  = req.query.district;
    if (req.query.severity)  filter.severity  = req.query.severity;
    if (req.query.verified)  filter.verified  = req.query.verified === 'true';

    const outbreaks = await Outbreak.find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('reportedBy', 'name role'); // show reporter name

    res.json(outbreaks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/outbreaks — submit a new outbreak report ────────────
router.post('/', protect, async (req, res) => {
  const { district, disease, severity, cases, description } = req.body;

  if (!district || !disease) {
    return res.status(400).json({ message: 'District and disease are required' });
  }

  try {
    const outbreak = await Outbreak.create({
      reportedBy : req.userId,
      district,
      disease,
      severity   : severity || 'med',
      cases      : parseInt(cases) || 0,
      description: description || '',
    });

    const populated = await outbreak.populate('reportedBy', 'name role');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PATCH /api/outbreaks/:id/verify — doctor/admin verification ───
router.patch('/:id/verify', protect, async (req, res) => {
  try {
    const outbreak = await Outbreak.findById(req.params.id);
    if (!outbreak) return res.status(404).json({ message: 'Outbreak not found' });

    // Only doctors/admins can verify
    const User = require('../models/User');
    const user = await User.findById(req.userId);
    if (!user || !['doctor', 'admin'].includes(user.role)) {
      return res.status(403).json({ message: 'Only doctors or admins can verify reports' });
    }

    outbreak.verified   = true;
    outbreak.verifiedBy = req.userId;
    await outbreak.save();

    res.json({ message: 'Outbreak verified', outbreak });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
