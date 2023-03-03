const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 10;
const User = require('../models/user');
const jwt = require('jsonwebtoken');
require("dotenv").config();

const authMiddleware = require('../middlewares/authMiddleware');
const { v4: uuidv4 } = require('uuid');


router.get('/get-mail', authMiddleware, async (req, res) => {
  return res.status(200).json({ email: req.user.email });
});


router.post('/check-email', async (req, res) => {
  const { email } = req.body;


  try {
    const user = await User.findOne({ email });
    var loggedIn = false;
    if (req.cookies.token == user.token){
      loggedIn = true;
    }
    if (user) {
      return res.status(200).json({ exists: true, username: user.username, loggedIn });
    } else {
      return res.status(200).json({ exists: false });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while checking email' });
  }
});



router.post('/check-username', async (req, res) => {
  const { username } = req.body;

  try {
    const user = await User.findOne({ username });
    console.log(user)
    if (user) {
      return res.status(200).json({ exists: true });
    } else {
      return res.status(200).json({ exists: false });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while checking the username' });
  }
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
    const token = jwt.sign({ UUID: uuidv4() }, process.env.JWT_SECRET);


    user = new User({ username, email, password: hashedPassword, description, profilePicture, token });
    // Save user to database
    await user.save();

    // automatically login user after register
    res.cookie('token', token, {
      secure: true,
      httpOnly: true,
      sameSite: "none"
    })
    res.status(201).json({ msg: 'User registered successfully' ,username: user.username});
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

    const token = user.token
    // Set the token as a cookie in the user's browser

    res.cookie('token', token, {
      secure: true,
      httpOnly: true,
      sameSite: "none"
    })
    // Return success message
    res.status(200).json({ success: true , username: user.username});
  } catch (err) {
    console.log(err)
    // Return error message
    res.status(500).send(err);
  }
});



router.get('/logout', authMiddleware, (req, res) => {
  res.clearCookie('token',{
    secure: true,
    httpOnly: true,
    sameSite: "none",
  });
  res.cookie('test1', '0')
  res.status(200).json({ success: true });
});


// checklogin
router.get('/checklogin', authMiddleware, async (req, res) => {
  res.status(200).json(req.user.username);
});

module.exports = router;