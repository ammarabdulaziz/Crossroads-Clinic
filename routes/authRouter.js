var express = require('express');
var router = express.Router();
const passport = require('passport');


router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

router.get('/google/callback', passport.authenticate('google', { failureFlash: true, failureRedirect: '/login' }),
    function (req, res, next) {
        if (req.user.patient) {
            res.redirect('/homepage');
        }
        else {
            res.redirect('/login');
        }
    });

router.get('/logout', (req, res) => {
    req.logout();
    req.redirect('/login')
})

router.get('/facebook', passport.authenticate('facebook'))

router.get('/facebook/callback', passport.authenticate('facebook', { failureFlash: true, failureRedirect: '/login' }),
    function (req, res, next) {
        if (req.user.patient) {
            res.redirect('/homepage');
        }
        else {
            res.redirect('/login');
        }
    });

module.exports = router;