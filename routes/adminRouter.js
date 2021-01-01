require('dotenv').config();
var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');
const adminHelpers = require('../helpers/adminHelpers')
const doctorHelpers = require('../helpers/doctorHelpers')
var objectId = require('mongodb').ObjectID
const fs = require('fs');
const isAdmin = require('../config/auth').isAdmin
const isNotAuthenticated = require('../config/auth').isNotAuthenticated

router.get('/', isAdmin, async function (req, res, next) {
  let appointments = await adminHelpers.getAllAppointments();
  let counts = await adminHelpers.getDashboardCounts();
  let doctors = await adminHelpers.getDoctors();
  let specialities = await adminHelpers.getSpecialities();
  let patients = await adminHelpers.getPetients();
  res.render('admin/dashboard', { appointments, doctors, counts, specialities, patients, admin: true });
});


// -- Doctor routes --
router.post('/add-dcotor', isAdmin, (req, res) => {
  let stringPassword = req.body.password
  adminHelpers.addDoctor(req.body).then((response) => {
    // Add image
    const path = './public/images/' + response._id + '.jpg'
    const imgdata = req.body.image;
    const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, '');
    fs.writeFileSync(path, base64Data, { encoding: 'base64' });

    // Send Username and Password to mail
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL, 
        pass: process.env.PASSWORD
      }
    });

    let mailOptions = {
      from: process.env.EMAIL,
      to: `${response.email}`,
      subject: `Welcome to Crossroads Clinic`,
      text: `Welcome to Crossroads Clinic, Dr. ${response.firstname} ${response.lastname}
      Here are your login credentials :
      Your Username = ${response.email}
      Your Password = ${stringPassword}`
    };

    transporter.sendMail(mailOptions, (err, data) => {
      if (err) {
        console.log('Error occurs: ', err);
      }
      console.log('Email Sent');
    });
    res.redirect('/admin/')

  })
})

router.get('/edit-doctor', isAdmin, (req, res) => {
  adminHelpers.getDoctorDetails(req.query.id).then((response) => {
    res.json({ response })
  })
})

router.post('/edit-doctor', isAdmin, (req, res) => {
  adminHelpers.editDoctor(req.query.id, req.body).then((response) => {
    if (req.body.image) {
      const path = './public/images/' + req.query.id + '.jpg'
      const imgdata = req.body.image;
      const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, '');
      fs.writeFileSync(path, base64Data, { encoding: 'base64' });
    }
    res.redirect('/admin/')
  })
})

router.post('/delete-doctor', isAdmin, (req, res) => {
  adminHelpers.deleteDoctor(req.body.id).then(() => {
    res.json({ status: true })
  })
})

router.post('/block-doctor', isAdmin, (req, res) => {

  adminHelpers.blockDoctor(req.body.id).then(() => {
    res.json({ status: true })
  })
})

router.post('/unblock-doctor', isAdmin, (req, res) => {
  adminHelpers.unblockDoctor(req.body.id).then(() => {
    res.json({ status: true })
  })
})

router.get('/profile', isAdmin, (req, res) => {
  adminHelpers.getDoctorDetails(req.query.id).then(async (response) => {
    let docId = objectId(req.query.id)
    // Doctor grapgh data report
    let count = 0;
    let myPatients = await doctorHelpers.getMyPatients(docId)
    myPatients.forEach(patient => { count++ })
    console.log(myPatients)
    response.count = count;
    let approved = 0, requests = 0, consulted = 0, cancelled = 0;
    let bookings = response.bookings;
    response.report = []
    bookings.forEach(booking => {
      if (booking.status === 'approved') { approved++ }
      if (booking.status === 'consulted') { consulted++ }
      if (booking.status === 'cancelled') { cancelled++ }
      if (booking.status === 'requested') { requests++ }
    });
    response.report.push(consulted, approved, requests, cancelled)
    console.log(response.report)
    res.json({ response })
  })
})

router.get('/date-report', isAdmin, async (req, res) => {
  // Get date wise report
  console.log('ajax call' + req.query.date)
  console.log('ajax call' + req.query.docId)
  adminHelpers.getDateReport(req.query.docId, req.query.date).then((percentage) => {
    let data = []
    let totalApps = 100 - percentage;
    data.push(percentage, totalApps)
    res.json({ data })
  })
})

// -- Patient Routes --
router.post('/delete-patient', isAdmin, (req, res) => {
  adminHelpers.deletePatient(req.body.id).then(() => {
    res.json({ status: true })
  })
})

router.post('/block-patient', isAdmin, (req, res) => {
  adminHelpers.blockPatient(req.body.id).then(() => {
    res.json({ status: true })
  })
})

router.post('/unblock-patient', isAdmin, (req, res) => {

  adminHelpers.unblockPatient(req.body.id).then(() => {
    res.json({ status: true })
  })
})


// -- Speciality routes --
router.post('/add-speciality', isAdmin, (req, res) => {
  adminHelpers.addSpeciality(req.body).then(() => {
    res.redirect('/admin')
  })
})

router.post('/edit-speciality', isAdmin, (req, res) => {
  adminHelpers.ediSpeciality(req.query.id, req.body).then((response) => {
    res.redirect('/admin')
  })
})

router.post('/delete-speciality', isAdmin, (req, res) => {
  adminHelpers.deleteSpeciality(req.body.id).then(() => {
    res.json({ status: true })
  })
})


module.exports = router;
