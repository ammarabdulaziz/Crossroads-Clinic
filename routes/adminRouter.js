var express = require('express');
var router = express.Router();
const adminHelpers = require('../helpers/adminHelpers')
const fs = require('fs');
const isAdmin = require('../config/auth').isAdmin
const isNotAuthenticated = require('../config/auth').isNotAuthenticated

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('admin/dashboard');
});


// -- Doctor routes --
router.post('/add-dcotor', (req, res) => {
  // console.log('req.body:',req.body)
  // image = req.body.image

  adminHelpers.addDoctor(req.body).then((id) => {
    const path = './public/images/' + id + '.jpg'
    const imgdata = req.body.image;
    const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, '');
    fs.writeFileSync(path, base64Data, { encoding: 'base64' });
    res.redirect('/admin/')
  })
})

router.get('/view-dcotor-profile', (req, res) => {
  res.render('admin/dcotor-profile')
})



// -- Patient routes --
router.get('/view-patient-profile', (req, res) => {
  res.render('admin/patient-profile')
})


// -- Appointments Routes --

module.exports = router;
