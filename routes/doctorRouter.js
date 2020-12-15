var express = require('express');
var router = express.Router();
const passport = require('passport');
const fs = require('fs');
const adminHelpers = require('../helpers/adminHelpers')
const patientHelpers = require('../helpers/patientHelpers')
const doctorHelpers = require('../helpers/doctorHelpers');
const { isDoctor } = require('../config/auth');
const isAdmin = require('../config/auth').isAdmin
const isNotAuthenticated = require('../config/auth').isNotAuthenticated

router.get('/', isDoctor, async (req, res) => {
    // Get todays date
    let dateNow = new Date();
    let date = dateNow.getDate();
    let month = dateNow.getMonth() + 1;
    let year = dateNow.getFullYear();
    let today = date + "/" + month + "/" + year;

    let bookings = await doctorHelpers.getBookings(req.user._id, today)
    let user = req.user

    res.render('doctor/homepage', { bookings, user, today, home: true })
})

router.get('/cancel-appointment', isDoctor, (req, res) => {
    patientHelpers.cancelAppointment(req.query.id).then(() => {
        res.redirect('/doctor')
    })
})

router.get('/approve-appointment', isDoctor, (req, res) => {
    doctorHelpers.approveAppointment(req.query.id).then(() => {
        res.redirect('/doctor')
    })
})

router.get('/consult', isDoctor, (req, res) => {
    let user = req.user;
    let body = req.query;
    res.render('doctor/consult', { body, user , home: true })
})

router.post('/consult', isDoctor, (req, res) => {
    doctorHelpers.consultPatient(req.body, req.query.patientId, req.query.appId, req.user).then(() => {
        res.redirect('/doctor')
    })
})

module.exports = router;