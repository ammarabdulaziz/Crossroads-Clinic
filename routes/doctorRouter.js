var express = require('express');
var router = express.Router();
const passport = require('passport');
const fs = require('fs');
const adminHelpers = require('../helpers/adminHelpers')
const patientHelpers = require('../helpers/patientHelpers')
const doctorHelpers = require('../helpers/doctorHelpers');
const { isDoctor } = require('../config/auth');
const isAdmin = require('../config/auth').isAdmin
const isNotAuthenticated = require('../config/auth').isNotAuthenticated;
const { ok } = require('assert');

router.get('/', isDoctor, async (req, res) => {
    // Get todays date
    let dateNow = new Date();
    let date = dateNow.getDate();
    let month = dateNow.getMonth() + 1;
    let year = dateNow.getFullYear();
    let today = date + "/" + month + "/" + year;
    req.session.today = today;

    let bookings = await doctorHelpers.getBookings(req.user._id, today)
    let myPatients = await doctorHelpers.getMyPatients(req.user._id)
    let user = req.user

    res.render('doctor/homepage', { bookings, user, myPatients, today, home: true })
})

router.get('/edit-profile', isDoctor, (req, res) => {
    let user = req.user
    res.render('doctor/edit-profile', { user })
})

router.post('/edit-profile', isDoctor, (req, res) => {
    doctorHelpers.editProfile(req.body, req.query.id).then(() => {
        if (req.body.image) {
            const path = './public/images/' + req.query.id + '.jpg'
            const imgdata = req.body.image;
            const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, '');
            fs.writeFileSync(path, base64Data, { encoding: 'base64' });
        }
        res.redirect('/homepage')
    })
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
    res.render('doctor/consult', { body, user, home: true })
})

router.post('/consult', isDoctor, (req, res) => {
    req.body.date = req.session.today
    doctorHelpers.consultPatient(req.body, req.query.patientId, req.query.appId, req.user).then(() => {
        res.redirect('/doctor')
    })
})

router.get('/block-patient', isDoctor, (req, res) => {
    let docId = req.user._id
    doctorHelpers.blockPatient(docId, req.query.patientId, req.query.appId).then(() => {
        res.redirect('/doctor')
    })
})

router.get('/unblock-patient', isDoctor, (req, res) => {
    let docId = req.user._id
    doctorHelpers.unBlockPatient(docId, req.query.patientId, req.query.appId).then(() => {
        res.redirect('/doctor')
    })
})

router.get('/previous', isDoctor, (req, res) => {
    doctorHelpers.getPreviousConsultations(req.user._id, req.query.id).then((response) => {
        res.json({ response })
    })
})

module.exports = router;