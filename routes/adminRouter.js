var express = require('express');
var router = express.Router();
const isAdmin = require('../config/auth').isAdmin
const isNotAuthenticated = require('../config/auth').isNotAuthenticated

/* GET home page. */
router.get('/', isAdmin, function(req, res, next) {
  res.render('admin/dashboard');
});

module.exports = router;
