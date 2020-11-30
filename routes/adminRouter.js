var express = require('express');
var router = express.Router();
const isAdmin = require('../config/auth').isAdmin
const isNotAuthenticated = require('../config/auth').isNotAuthenticated

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('admin/dashboard');
});


// -- Doctor routes --
router.get('/view-dcotor-profile',  (req, res) => {
  res.render('admin/dcotor-profile')
})



// -- Patient routes --
router.get('/view-patient-profile',  (req, res) => {
  res.render('admin/patient-profile')
})


// -- Appointments Routes --

module.exports = router;
