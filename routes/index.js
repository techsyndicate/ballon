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
  res.render('login', { title: 'Login', layout: false, username: username });
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login'
  })(req, res, next);
  username = req.body.username;
});

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
  console.log('Logged out');
});

router.get('/dashboard', auth.checkAuth, (req, res) => {
  const cities = indianCitiesDatabase.cities;
  let state;
  let elections = {};
  let vote = {};
  User.doc(username).get()
  .then(user => {
    const city = user.data()['address'].split(',')[user.data()['address'].split(',').length - 1].trim()
    vote = user.data()['vote']
    cities.forEach((value, index, array) => { 
      if (value['city'] == city) {
        state = value['state'];
      }
    });
  });
  Election.where('ongoing', '==', true).get()
  .then(electionSnapshot => {
    electionSnapshot.forEach(election => {
      elections[election.id] = election.data();
    })
    for (var key in elections) {
      voteKeys = Object.keys(vote)
      console.log(voteKeys)
      if ((elections[key]['state'] == state || elections[key]['area'] == 'India') && !(voteKeys.includes(elections[key]['id']))) {
        elections[key]['active'] = true;
        var date = new Date(1000 * elections[key]['date'])
        elections[key]['date'] = date.toString('').split(' ')[2] + ' ' + date.toString('').split(' ')[1]
      } else {
        elections[key]['active'] = false;
        var date = new Date(1000 * elections[key]['date'])
        elections[key]['date'] = date.toString('').split(' ')[2] + ' ' + date.toString('').split(' ')[1]
      }
    }
    res.render('dashboard', {elections: elections, title: 'Dashboard', username: username});
  })
})

router.get('/election', (req, res) => {
  const electionId = req.query.id;
  const election = Election.doc(electionId);
  let parties = [];
  let checkVote;
  let votedFor;

  const user = User.doc(username).get()
    .then((user) => {
      checkVote = user.data()['voted'];
      votedFor = user.data()['votedFor'];
    });

  Party.where('candidate_locations', 'array-contains', electionId).get()
    .then(partySnapshot => {
      partySnapshot.forEach(party => {
        parties.push(party.data());
      });
      res.render('election', { parties: parties, title: `${electionId} Elections`, checkVote: checkVote, votedFor: votedFor, id: electionId, username: username });
    }).catch(err => console.log(err));
});

router.post('/election', (req, res) => {
  const party = req.body.party;
  const electionId = req.body.electionId;
  var vote = {};
  User.doc(username).get()
  .then(user => {
    vote = user.data()['vote']
    vote[electionId] = party
    User.doc(username).update({
      vote: vote
    });
    res.redirect('/dashboard')
  })
});
module.exports = router;
