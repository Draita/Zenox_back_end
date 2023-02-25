const express = require('express');
const router = express.Router();
const Message = require('../models/message');
const User = require('../models/user');

router.get('/dev/session', function (req, res) {
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
    req.session.user = user;
    // Return success message
    res.status(200).json({ success: true });
  });


module.exports = router;