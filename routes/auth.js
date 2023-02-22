const express = require('express');

const bcrypt = require('bcrypt');
const session = require('express-session');
const User = require('../models/user');

const router = express.Router();

router.use(express.urlencoded({ extended: true }));

router.use(session({
  secret: 'mysecret',
  resave: false,
  saveUninitialized: false
}));




router.post('/register', async (req, res) => {
  console.log("run")
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      email: req.body.email,
      password: hashedPassword
    });
    user.save(function(err,result){
      if (err){
          console.log(err);
      }
      else{
          console.log(result)
      }
  })
    res.status(201).json(hashedPassword)
  } catch (err) {
    res.status(500);
  }
});


router.post('/login', async (req, res) => {


  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).send('Invalid email or password');
    }
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res.status(400).send('Invalid email or password');
    }


    req.session.user = user;
    res.status(200).send("ok")
  } catch (err) {



    res.status(500).send(err);
  }
});


router.get('/dashboard', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  res.render('dashboard', { user: req.session.user });
});

router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.redirect('/dashboard');
    }
    res.clearCookie('connect.sid');
    res.redirect('/login');
  });
});


router.get('/user/email', async (req, res) => {
  // console.log(req.session.user)
  if (!req.session.user) {
    return res.status(401).send('Not logged in');
  }

  const user = await User.findById(req.session.user._id);
  if (!user) {
    return res.status(404).send('User not found');
  }

  res.send(user.email);
});


module.exports = router;