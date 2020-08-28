const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const db = require('../config/db');
const User = db.collection('users');
const Election = db.collection('elections');
const Party = db.collection('parties');
const auth = require('../lib/auth');
const indianCitiesDatabase = require('indian-cities-database');
var username;

router.get('/', (req, res, next) => {
  res.render('index', { title: 'Ballon' });
});

router.get('/login', (req, res, next) => {
  res.render('login', { title: 'Login' });
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login'
  })(req, res, next);
  username = req.body.username;
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
  var cities = indianCitiesDatabase.cities;
  var state;
  var elections = {};
  User.doc(username).get()
  .then(user => {
    var city = user.data()['address'].split(',')[user.data()['address'].split(',').length - 1].trim()
    cities.forEach((value, index, array) => { 
      if (value['city'] == city) {
        state = value['state']
      }
    })
  })
  Election.where('ongoing', '==', true).get()
  .then(electionSnapshot => {
    electionSnapshot.forEach(election => {
      elections[election.id] = election.data();
    })
    for (var key in elections) {
      if (elections[key]['state'] == state || elections[key]['area'] == 'India') {
        elections[key]['active'] = true;
        console.log(elections[key]['date']['_seconds'])
        var date = new Date(1000 * elections[key]['date'])
        elections[key]['date'] = date.toString('').split(' ')[2] + ' ' + date.toString('').split(' ')[1]
      } else {
        elections[key]['active'] = false;
        var date = new Date(1000 * elections[key]['date'])
        elections[key]['date'] = date.toString('').split(' ')[2] + ' ' + date.toString('').split(' ')[1]
      }
    }
    console.log(state);
    console.log(elections);
    res.render('dashboard', {elections: elections, title: 'Dashboard'});
  })
})

router.post('/election', auth.checkAuth, (req, res) => {
  
})

module.exports = router;
