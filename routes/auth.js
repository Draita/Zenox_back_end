const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 10;
const User = require('../models/user');

router.get('/dev/session', function (req, res) {
  res.send(req.session);
});

router.get('/dev/sessionID', function (req, res) {
  res.send(req.sessionID);
});

router.get('/dev/session/:data', function (req, res) {
  var data = req.params.data;
  req.session[data] = data;
  res.send(req.session);
});

// Register a new user
router.post('/register', async (req, res) => {
  const { username, email, password, description, profilePicture } = req.body;
  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    // Create new user with hashed password
    user = new User({ username, email, password: hashedPassword, description, profilePicture });
    // Save user to database
    await user.save();
    res.status(201).json({ msg: 'User registered successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.post('/login', async (req, res) => {
  try {
    // Check if user exists in the database
    const user = await User.findOne({ email: req.body.email });
    // Return error if user does not exist
    if (!user) {
      return res.status(400).send('Invalid email or password');
    }
    // Check if password matches hashed password in the database
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res.status(400).send('Invalid email or password');
    }
    // Set session user to the authenticated user
    req.session.user = user;
    // Return success message
    res.status(200).json({ success: true });
  } catch (err) {
    // Return error message
    res.status(500).send(err);
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).send(err);
    res.clearCookie('connect.sid').end();
  });
});

router.get('/user/email', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).send('Not logged in');
  }
  const user = await User.findById(req.session.user._id);
  if (!user) {
    return res.status(404).send('User not found');
  }
  res.send(user.email);
});

router.get('/checklogin', function (req, res) {
  if (req.session.user) {
    res.status(200).send(req.session.user.username);
  }
  res.status(401).send('Not logged in');
});



module.exports = router;
