var express = require('express');
var router = express.Router();
const adminHelpers = require('../helpers/adminHelpers')
const fs = require('fs');
const isAdmin = require('../config/auth').isAdmin
const isNotAuthenticated = require('../config/auth').isNotAuthenticated

/* GET home page. */
router.get('/', async function (req, res, next) {
  // Get doctor details
  let doctors = await adminHelpers.getDoctors();
  res.render('admin/dashboard', { doctors });
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

router.get('/edit-doctor', (req, res) => {
  adminHelpers.getDoctorDetails(req.query.id).then((response) => {
    res.json({ response })
  })
})

router.post('/edit-doctor', (req, res) => {
  adminHelpers.editDoctor(req.query.id, req.body).then((response) => {
    if (req.body.image) {
      const path = './public/images/' + req.query.id + '.jpg'
      const imgdata = req.body.image;
      const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, '');
      fs.writeFileSync(path, base64Data, { encoding: 'base64' });
    }
    console.log("------------------updated");
    res.redirect('/admin/')
  })
})

router.post('/delete-doctor', (req, res) => {
  // console.log("Api Call", req.body.id);
  adminHelpers.deleteDoctor(req.body.id).then(() => {
    res.json({ status: true })
  })
})



// -- Patient routes --
router.get('/view-patient-profile', (req, res) => {
  res.render('admin/patient-profile')
})


// -- Appointments Routes --

module.exports = router;
