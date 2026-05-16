const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../../models/User');

// GET /auth/login
router.get('/login', (req, res) => {
  res.render('auth/login', { title: 'Login' });
});

// GET /auth/register
router.get('/register', (req, res) => {
  res.render('auth/register', { title: 'Register' });
});

// POST /auth/register — Lab 3: validates all fields + min password length
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  // Server-side validation
  if (!name || !email || !password) {
    req.flash('error', 'All fields are required');
    return res.redirect('/auth/register');
  }
  if (password.length < 6) {
    req.flash('error', 'Password must be at least 6 characters long');
    return res.redirect('/auth/register');
  }

  try {
    let user = await User.findOne({ email });
    if (user) {
      req.flash('error', 'An account with that email already exists');
      return res.redirect('/auth/register');
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ name, email, password: hashedPassword });
    await user.save();

    req.flash('success', 'Registration successful! Please log in.');
    res.redirect('/auth/login');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// POST /auth/login — Lab 3: personalised welcome flash
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      req.flash('error', 'Invalid username or password');
      return res.redirect('/auth/login');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      req.session.user = {
        _id:   user._id,
        name:  user.name,
        email: user.email,
        role:  user.role
      };
      // Lab 3: "Welcome back, [Name]!"
      req.flash('success', `Welcome back, ${user.name}!`);
      res.redirect('/');
    } else {
      req.flash('error', 'Invalid username or password');
      res.redirect('/auth/login');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// GET /auth/logout — Lab 3: "You have successfully logged out"
router.get('/logout', (req, res) => {
  // Set flash before clearing user so message survives
  req.flash('success', 'You have successfully logged out');
  req.session.user = null;
  res.redirect('/');
});

module.exports = router;
