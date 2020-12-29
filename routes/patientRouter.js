var express = require('express');
var router = express.Router();
const passport = require('passport');
const fs = require('fs');
const ExcelJs = require('exceljs');
const tempfile = require('tempfile');
const adminHelpers = require('../helpers/adminHelpers')
const patientHelpers = require('../helpers/patientHelpers')
const doctorHelpers = require('../helpers/doctorHelpers')
const isPatient = require('../config/auth').isPatient
const isNotAuthenticated = require('../config/auth').isNotAuthenticated

// Login - Logout Routes


// Landing Page route
router.get('/', function (req, res, next) {
  let user = req.user || [];
  res.render('index', { layout: 'index', user, home: true });
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
  req.session.destroy();
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
  let consultations = await patientHelpers.getConsultations(req.user._id)
  // console.log(consultations)
  let user = req.user
  res.render('patient/homepage', { appointments, consultations, user, home: true })
})

router.get('/edit-profile', isPatient, (req, res) => {
  let user = req.user
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
  let error = []
  if (req.query.error) {
    error.push(req.query.error)
  }
  let doctors = await adminHelpers.getDoctors()
  let specialities = await adminHelpers.getSpecialities()
  let user = req.user;
  res.render('patient/doctors', { doctors, specialities, user, error })
})

router.get('/book-appointment', isPatient, async (req, res) => {
  if (!req.query.id) {
    res.redirect('/doctors')
  }
  let bookingDocId = req.query.id;
  let patientId = req.user._id;
  patientHelpers.checkBlocked(bookingDocId, patientId).then((response) => {
    if (!response.message) {
      user = req.user
      res.render('patient/book-now', { bookingDocId, user })
    } else {
      var error = response.message
      res.redirect('/doctors?error=' + error)
    }
  })
})

router.get('/get-session-availability', isPatient, (req, res) => {
  patientHelpers.getAvailability(req.query.date, req.query.docId).then((session) => {
    res.json({ status: true, session })
  })
})

router.post('/book-appointment', isPatient, (req, res) => {
  user = req.user
  patientHelpers.bookAppointment(req.body, req.user, req.query.docId).then((appointment) => {
    res.render('patient/confirm-booking', { appointment, user })
  })
})

router.get('/cancel-appointment', isPatient, (req, res) => {
  patientHelpers.cancelAppointment(req.query.id).then(() => {
    res.redirect('/homepage')
  })
})

router.get('/previous', isPatient, (req, res) => {
  doctorHelpers.getPreviousConsultations(req.query.id, req.user._id).then((response) => {
    res.json({ response })
  })
})

router.get('/get-consulted', isPatient, async (req, res) => {
  let response = await patientHelpers.getConsultations(req.user._id)
  res.json({ response })
})

router.get('/get-cancelled', isPatient, async (req, res) => {
  let appointments = await patientHelpers.getAppointments(req.user._id)
  let response = appointments.cancelled
  res.json({ response })
})

router.get('/get-requests', isPatient, async (req, res) => {
  let appointments = await patientHelpers.getAppointments(req.user._id)
  let response = appointments.requested
  console.log(response)
  res.json({ response })
})

router.get('/app-sheet', isPatient, async (req, res) => {
  let presc = await patientHelpers.getPrescriptionDetails(req.query.appId)
  presc[0].prescription = presc[0].prescription.toString()
  const workbook = new ExcelJs.Workbook();
  const worksheet = workbook.addWorksheet('Prescription');
  worksheet.columns = [
    { header: 'Patient Name', key: 'name', width: 25 },
    { header: 'Date', key: 'date', width: 20 },
    { header: 'Age', key: 'age', width: 8 },
    { header: 'Doctor Name', key: 'docName', width: 25 },
    { header: 'Speciality', key: 'speciality', width: 20 },
    { header: 'Prescription', key: 'prescription', width: 50 },
  ];
  worksheet.addRow(presc[0]);

  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true };
  });

  var tempFilePath = tempfile('.xlsx');
  workbook.xlsx.writeFile(tempFilePath).then(function () {
    console.log('file is written');
    res.sendFile(tempFilePath, function (err) {
      console.log('error downloading file: ' + err);
    });
  });
})

router.get('/previous-sheet', isPatient, async (req, res) => {
  let presc = await patientHelpers.exportData(req.user._id, req.query.docId)
  console.log(presc)

  const workbook = new ExcelJs.Workbook();
  const worksheet = workbook.addWorksheet('Prescription');
  worksheet.columns = [
    { header: 'Patient Name', key: 'name', width: 25 },
    { header: 'Date', key: 'date', width: 20 },
    { header: 'Age', key: 'age', width: 8 },
    { header: 'Doctor Name', key: 'docName', width: 25 },
    { header: 'Speciality', key: 'speciality', width: 20 },
    { header: 'Prescription', key: 'prescription', width: 50 },
  ];

  presc.forEach(element => {
    element.prescription = element.prescription.toString()
    worksheet.addRow(element);
  });

  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true };
  });

  var tempFilePath = tempfile('.xlsx');
  workbook.xlsx.writeFile(tempFilePath).then(function () {
    console.log('file is written');
    res.sendFile(tempFilePath, function (err) {
      console.log('error downloading file: ' + err);
    });
  });
})

module.exports = router;
