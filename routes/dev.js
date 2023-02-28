const express = require('express');
const router = express.Router();
const Message = require('../models/message');
const User = require('../models/user');
const jwt = require('jsonwebtoken');


router.get('/setcookie', (req, res) => {
  res.cookie(`Cookie token name`,`encrypted cookie string Value`);
  res.send('Cookie have been saved successfully');
});


  // router.get('/login', async (req, res) => {
  //   const user = await User.findOne({ email: "bob@gmail.com" });
  //     // Create a JWT token with the user ID and secret key
  //     const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {expiresIn: "2h"});
  //     // Set the token as a cookie in the user's browser
  //     res.cookie('token', token, { httpOnly: true });
  //     // Return success message

  //     user.token = token
  //     await user.save();

  //   // Return success message
  //   res.status(200).json({ success: true });
  // });


module.exports = router;