const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const db = require('../config/db');
const User = db.collection('users');
const auth = require('../lib/auth');

router.get('/', (req, res, next) => {
  res.render('index', { title: 'Express' });
});

router.get('/login', (req, res, next) => {
  res.render('login');
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login'
  })(req, res, next);
});

// router.get('/register', (req, res) => {
//   res.render('register');
// });

// router.post('/register', (req, res, next) => {
// });

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
  console.log('Logged out');
});

router.get('/dashboard', auth.checkAuth, (req, res) => {
  res.render('dashboard');
})

module.exports = router;
