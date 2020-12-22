var express = require('express');
var router = express.Router();
const adminHelpers = require('../helpers/adminHelpers')
const fs = require('fs');
const isAdmin = require('../config/auth').isAdmin
const isNotAuthenticated = require('../config/auth').isNotAuthenticated

/* GET home page. */
router.get('/',  async function (req, res, next) {
  // Get doctor details
  let counts = await adminHelpers.getDashboardCounts();
  console.log('------', counts)
  let doctors = await adminHelpers.getDoctors();
  let specialities = await adminHelpers.getSpecialities();
  let patients = await adminHelpers.getPetients();
  res.render('admin/dashboard', { doctors, counts, specialities, patients, admin: true });
});


// -- Doctor routes --
router.post('/add-dcotor', isAdmin, (req, res) => {
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
  adminHelpers.getDoctorDetails(req.query.id).then((response) => {
    console.log(response)
    res.json({ response })
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


// -- Appointments Routes --

module.exports = router;
