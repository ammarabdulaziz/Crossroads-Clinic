var express = require('express');
var router = express.Router();
const passport = require('passport');
const fs = require('fs');
const adminHelpers = require('../helpers/adminHelpers')
const patientHelpers = require('../helpers/patientHelpers')
const doctorHelpers = require('../helpers/doctorHelpers')
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
      res.redirect('/homepage');
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

router.get('/homepage', isPatient, async (req, res) => {
  let appointments = await patientHelpers.getAppointments(req.user._id)
  let user = req.user
  res.render('patient/homepage', { appointments, user, home : true })
})

router.get('/edit-profile', isPatient, async (req, res) => {
  let user = req.user
  console.log('user',user)
  res.render('patient/edit-profile', { user })
})

router.post('/edit-profile', isPatient, (req, res) => {
  patientHelpers.editProfile(req.body, req.query.id).then(() => {
    if (req.body.image) {
      const path = './public/images/' + req.query.id + '.jpg'
      const imgdata = req.body.image;
      const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, '');
      fs.writeFileSync(path, base64Data, { encoding: 'base64' });
    }
    res.redirect('/homepage')
  })
})

router.get('/doctors', isPatient, async (req, res) => {
  let doctors = await adminHelpers.getDoctors()
  let specialities = await adminHelpers.getSpecialities()
  res.render('patient/doctors', { doctors, specialities, user: true })
})

router.get('/book-appointment', isPatient, async (req, res) => {
  if (!req.query.id) {
    res.redirect('/doctors')
  }
  let bookingDocId = req.query.id;
  res.render('patient/book-now', { bookingDocId, user: true })
})

router.post('/book-appointment', isPatient, (req, res) => {
  patientHelpers.bookAppointment(req.body, req.user._id, req.query.docId).then((appointment) => {
    res.render('patient/confirm-booking', { appointment, user: true })
  })
})

module.exports = router;
