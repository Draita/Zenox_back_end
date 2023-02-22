const express = require('express');
const bcrypt = require('bcrypt');
const session = require('express-session');
const User = require('./models/user');

const router = express.Router();

router.use(express.urlencoded({ extended: true }));
router.use(session({
  secret: 'mysecret',
  resave: false,
  saveUninitialized: false
}));

router.get('/', (req, res) => {
  res.render('index');
});

router.get('/register', (req, res) => {
  res.render('register');
});

router.post('/register', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      email: req.body.email,
      password: hashedPassword
    });
    await user.save();
    res.redirect('/');
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get('/login', (req, res) => {
  res.render('login');
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
    res.redirect('/dashboard');
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

module.exports = router;