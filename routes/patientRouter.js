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
  let user = req.user || [];
  res.render('index', { user });
});

router.get('/login', isNotAuthenticated, function (req, res, next) {
  const errors = req.flash().error || [];
  res.render('login', { layout: 'login', errors });
});

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }),
  function (req, res, next) {
    if (req.user.admin) {
      res.redirect('/admin');
    }
    else if (req.user.doctor) {
      res.redirect('/doctor');
    }
    else if (req.user.patient) {
      res.redirect('/');
    }
  });

router.get('/logout', (req, res, next) => {
  req.logout();
  res.redirect('/login');
});

module.exports = router;
