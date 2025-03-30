const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// Register User
router.post('/register', async (req, res) => {
  const { name, email, address, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, email, address, password });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Profile
router.get('/profile', protect, async (req, res) => {
  res.json(req.user);
});

// Update Profile
router.put('/profile', protect, async (req, res) => {
  const { name, address, bio, profilePicture } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = name || user.name;
    user.address = address || user.address;
    user.bio = bio || user.bio;
    user.profilePicture = profilePicture || user.profilePicture;
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
