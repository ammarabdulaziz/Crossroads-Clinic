var express = require('express');
var router = express.Router();
const passport = require('passport');
const bcrypt = require('bcrypt');
const adminHelpers = require('../helpers/adminHelpers')
const patientHelpers = require('../helpers/patientHelpers')
const doctorHelpers = require('../helpers/doctorHelpers')
const isAdmin = require('../config/auth').isAdmin
const isPatient = require('../config/auth').isPatient
const isNotAuthenticated = require('../config/auth').isNotAuthenticated

// Login - Logout Routes


// Landing Page route
router.get('/', function (req, res, next) {
  let user = req.user || [];
  res.set('Content-Type', 'text/html');
  res.send(new Buffer('<h1>LANDING PAGE</h1> <style>h1{font-size:40px; text-align:center}</style>'));
  // res.render('index', { user });
});


// Login Routes
router.get('/login', isNotAuthenticated, function (req, res, next) {
  var errors = req.flash().error || [];
  if (req.query.error) {
    errors.push(req.query.error)
  }
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


// User Register routes
router.post('/register', (req, res) => {
  patientHelpers.doRegister(req.body).then((response) => {
    if (response.error) {
      var error = response.error
      res.redirect('/login?error=' + error)
    } else {
      req.login(response, function (err) {
        if (!err) {
          res.redirect('/');
        } else {
          var error = 'Something went wrong. Please login with the Credintials'
          res.redirect('/login?error=' + error)
        }
      })
    }
  })
});

router.get('/homepage', isPatient, (req, res) => {
  res.render('patient/homepage', { patient: true })
})

router.get('/edit-profile', (req, res) => {
  res.render('patient/edit-profile', { patient: true })
})

router.get('/book-appoinment', (req, res) => {
  res.render('patient/book-now', { patient: true })
})

module.exports = router;
