var express = require('express');
var router = express.Router();
const isAdmin = require('../config/auth').isAdmin
const isNotAuthenticated = require('../config/auth').isNotAuthenticated

/* GET home page. */
router.get('/', isAdmin, function (req, res, next) {
  res.render('admin/dashboard');
});


// -- Doctor routes --
router.get('/view-doctors', isAdmin, (req, res) => {
  res.render('admin/view-doctors')
})

router.get('/add-doctor', isAdmin, (req, res) => {
  res.render('admin/add-doctor')
})

router.get('/view-dcotor-profile', isAdmin, (req, res) => {
  res.render('admin/dcotor-profile')
})



// -- Patient routes --
router.get('/view-patients', isAdmin, (req, res) => {
  res.render('admin/view-patients')
})

router.get('/view-patient-profile', isAdmin, (req, res) => {
  res.render('admin/patient-profile')
})



// -- Appointments Routes --
router.get('/view-appointments', isAdmin, (req, res) => {
  res.render('admin/view-appointments')
})

module.exports = router;
