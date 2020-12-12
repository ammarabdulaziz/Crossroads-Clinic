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
    let bookings = await doctorHelpers.getBookings(req.user._id)
    let user = req.user
    res.render('doctor/homepage', { bookings, user, home: true })
})

module.exports = router;