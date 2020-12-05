var express = require('express');
var router = express.Router();
const adminHelpers = require('../helpers/adminHelpers')
const fs = require('fs');
const isAdmin = require('../config/auth').isAdmin
const isNotAuthenticated = require('../config/auth').isNotAuthenticated

/* GET home page. */
router.get('/', isAdmin, async function (req, res, next) {
  // Get doctor details
  let doctors = await adminHelpers.getDoctors();
  res.render('admin/dashboard', { doctors, admin: true });
});


// -- Doctor routes --
router.post('/add-dcotor', isAdmin, (req, res) => {
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

router.get('/profile', isAdmin, (req, res) => {
  adminHelpers.getDoctorDetails(req.query.id).then((response) => {
    // console.log('admin:::', response)
    res.json({ response })
  })
})



// -- Patient routes --
router.get('/view-patient-profile', (req, res) => {
  res.render('admin/patient-profile')
})


// -- Appointments Routes --

module.exports = router;
