var express = require('express');
var router = express.Router();
const passport = require('passport');
const patientHelpers = require('../helpers/patientHelpers')
const config = require('../config/config')
const client = require('twilio')(config.accountSID, config.authToken)


// Google Routes
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



// Facebook Routes
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



// OTP Routes
router.get('/get-countdown', (req, res) => {
    if (req.session.timer !== undefined) {
        res.json({ status: true })
    }
})


// Login Endpoint
router.get('/send-otp', async (req, res) => {
    let timeSecond = 30;

    // Display time Fn defenition
    function displayTime(second) {
        const min = Math.floor(second / 60);
        const sec = Math.floor(second % 60);
        req.session.timer = `${min < 10 ? "0" : ""}${min}:${sec < 10 ? "0" : ""}${sec}`;
    }

    displayTime(timeSecond); // Display time Fn declaration
    const countDown = setInterval(() => {
        timeSecond--;
        displayTime(timeSecond);
        console.log(req.session.timer);

        // End Timer
        if (timeSecond == 0 || timeSecond < 1) {
            clearInterval(countDown);
            // Destroy timer session if authentication completed
            if (!req.user) {
                req.session.destroy();
            }
        }
    }, 1000);

    // Send OTP Fn
    let user = await patientHelpers.checkPhone(req.query.phone)
    if (user !== null && user !== '') {
        client.verify.services(config.serviceID).verifications.create({
            to: `+91${req.query.phone}`,
            channel: req.query.channel === 'call' ? 'call' : 'sms'
        }).then(data => {
            res.json({ status: true })
        })
    } else {
        var error = 'Your Phone Number does not exists. Register to conitnue'
        return res.status(200).send({ result: 'redirect', url: '/login?error=' + error })
    }

    var timer = req.session.timer;
    res.json({ status: true, timer })
})

// Verify Endpoint
router.get('/verify-otp', async (req, res) => {
    let user = await patientHelpers.checkPhone(req.query.phone)
    if (user !== null && user !== '' && (req.query.code).length === 4) {
        client.verify.services(config.serviceID).verificationChecks.create({
            to: `+91${req.query.phone}`,
            code: req.query.code
        }).then(data => {
            if (data.status === "approved") {
                req.login(user, function (err) {
                    if (!err) {
                        console.log("Authenticated")
                        return res.status(200).send({ result: 'redirect', url: '/homepage' })
                    } else {
                        var error = 'Something went wrong. Please login with the Credintials'
                        res.redirect('/login?error=' + error)
                    }
                })
            } else {
                res.json({ status: true })
            }
        })
    } else {
        res.json({ status: true })
    }
})

module.exports = router;