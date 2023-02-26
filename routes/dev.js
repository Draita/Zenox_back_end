const express = require('express');
const router = express.Router();
const Message = require('../models/message');
const User = require('../models/user');
const jwt = require('jsonwebtoken');


router.get('/session', function (req, res) {
    res.send(req.session);
  });

  router.get('/sessionID', function (req, res) {
    res.send(req.sessionID);
  });

  router.get('/session/:data', function (req, res) {
    var data = req.params.data;
    req.session[data] = data;
    res.send(req.session);
  });

  router.get('/login', async (req, res) => {
    const user = await User.findOne({ email: "bob@gmail.com" });
      // Create a JWT token with the user ID and secret key
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {expiresIn: "2h"});
      // Set the token as a cookie in the user's browser
      res.cookie('token', token, { httpOnly: true });
      // Return success message

      user.token = token
      await user.save();

    // Return success message
    res.status(200).json({ success: true });
  });


module.exports = router;