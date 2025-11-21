const express = require('express');
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');

const router = express.Router();

// Only allow these fields for updating
const allowedFields = ['username', 'email', 'role', 'bio', 'profileUrl'];
const allowedRoles = ['Student', 'Mentor', 'Admin', 'Guest'];

const toSafeUser = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email || '',
  role: user.role,
  bio: user.bio,
  profileUrl: user.profileUrl,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});

router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(toSafeUser(user));
  } catch (err) {
    console.error('GET /api/user/profile error:', err);
    res.status(500).json({ error: 'Unable to load profile' });
  }
});

router.put('/profile', auth, async (req, res) => {
  try {
    const updates = {};

    // add valid incoming fields
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        const value = req.body[field];
        updates[field] = typeof value === 'string' ? value.trim() : value;
      }
    });

    if (!Object.keys(updates).length) {
      return res.status(400).json({ error: 'No valid fields provided' });
    }

    // Basic validation
    if (updates.email && !/^\S+@\S+\.\S+$/.test(updates.email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (updates.username && updates.username.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters' });
    }

    if (updates.role && !allowedRoles.includes(updates.role)) {
      return res.status(400).json({ error: 'Invalid role selection' });
    }

    // Find user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Apply updates
    Object.assign(user, updates);
    await user.save();

    res.json(toSafeUser(user));
  } catch (err) {
    console.error('PUT /api/user/profile error:', err);
    res.status(400).json({ error: 'Unable to update profile' });
  }
});

module.exports = router;

