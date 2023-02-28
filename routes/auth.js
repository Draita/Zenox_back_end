const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 10;
const User = require('../models/user');
const jwt = require('jsonwebtoken');
require("dotenv").config();

const authMiddleware = require('../middlewares/authMiddleware');
const { v4: uuidv4 } = require('uuid');


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
    user = new User({ username, email, password: hashedPassword, description, profilePicture, UUID: uuidv4() });
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
    // Create a JWT token with the user ID and secret key
    const token = jwt.sign({ userId: user.UUID }, process.env.JWT_SECRET, {expiresIn: "2h"});

    // Set the token as a cookie in the user's browser
    res.cookie('token', token);
    // Return success message


    user.token = token;
    await user.save();
    res.status(200).json({ success: true });
  } catch (err) {
    console.log(err)
    // Return error message
    res.status(500).send(err);
  }
});


router.get('/logout', authMiddleware, (req, res) => {``
  res.cookie('token', "0");
  res.status(200).json({ success: true });
});


// checklogin
router.get('/checklogin', authMiddleware, async (req, res) => {
  console.log(req.user.username)
  res.status(200).json(req.user.username);
});

module.exports = router;