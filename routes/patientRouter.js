var express = require('express');
var router = express.Router();
const passport = require('passport');
const bcrypt = require('bcrypt');
const adminHelpers = require('../helpers/adminHelpers')
const patientHelpers = require('../helpers/patientHelpers')
const doctorHelpers = require('../helpers/doctorHelpers')
const isAdmin = require('../config/auth').isAdmin
const isNotAuthenticated = require('../config/auth').isNotAuthenticated

// Login - Logout Routes

router.get('/', function (req, res, next) {
  let user = req.user
  res.render('index', { user });
});

router.get('/login', isNotAuthenticated, function (req, res, next) {
  // let userData = {}
  // userData.email = "user";
  // userData.password = "user";
  // userData.patient = true;
  // adminHelpers.doRegister(userData).then((response) => {
  //   res.render('partials/login');
  // })
  // patientHelpers.doRegister(userData).then((response) => {
  //   res.render('partials/login');
  // })
  // doctorHelpers.doRegister(userData).then((response) => {
  //   res.render('partials/login');
  // })
  res.render('partials/login');
});

router.post('/login', passport.authenticate('local'),
  function (req, res) {
    if (!req.user) return res.status(404).json({ message: 'Something went wrong, please try again.' });

    else {
      if (req.user.admin) {
        res.redirect('/admin');
      }
      else if (req.user.doctor) {
        res.redirect('/doctor');
      }
      else if (req.user.patient) {
        res.redirect('/');
      }
      else {
        res.redirect('/login');
      }
    }
    res.redirect('/login');
  });

router.get('/logout', (req, res, next) => {
  req.logout();
  res.redirect('/login');
});

module.exports = router;
