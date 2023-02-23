const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');
const User = require('../models/user');




router.get('/dev/session', function (req,res){
  res.send(req.session)
});

router.get('/dev/session/:data', function (req,res){
  var data = req.params.data

  req.session[data] = data;
  res.send(req.session)
});


router.post('/register', async (req, res) => {
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  const user = new User({
    email: req.body.email,
    password: hashedPassword
  });
  try {
    await user.save();
    console.log(user);
    res.status(201).json(hashedPassword);
  } catch (err) {
    console.log(err);
    res.status(500);
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

    // Log the authenticated user
    console.log(req.session.user)

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

router.get('/checklogin', function(req, res) {
  if (req.session.user) {
    res.status(200).send({ isLoggedIn: true });
  } else {
    res.status(401).send({ isLoggedIn: false });
  }
});
erer

module.exports = router;