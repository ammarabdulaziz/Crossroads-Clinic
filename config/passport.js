var db = require('./connection')
var collections = require('./collections')
var objectId = require('mongodb').ObjectID
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')


module.exports = function (passport) {
    passport.use(
        new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
            // Match user email in 3 different collections
            db.get().collection(collections.ADMIN_COLLECTION).findOne({ email: email }).then(user => {
                if (!user) {
                    db.get().collection(collections.PATIENTS_COLLECTION).findOne({ email: email }).then(user => {
                        if (!user) {
                            db.get().collection(collections.DOCTORS_COLLECTION).findOne({ email: email }).then((user) => {
                                if (!user) {
                                    console.log('That email is not registered')
                                    return done(null, false, { message: 'This email is not registered' });
                                } else { matchPassword(password, user) }
                            })
                        } else { matchPassword(password, user) }
                    })
                } else { matchPassword(password, user) }

            });
            
            // Match password function
            function matchPassword(password, user) {
                console.log('password', password)
                console.log('user.password', user.password)
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) throw err;
                    if (isMatch) {
                        console.log('Login Success')
                        return done(null, user);
                    } else {
                        console.log('Your Password is incorrect')
                        return done(null, false, { message: 'Your Password is incorrect' });
                    }
                });
            }
        })
    );

    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser((id, done) => {
        // Find user details from 3 different collections
        db.get().collection(collections.ADMIN_COLLECTION).findOne({ _id: objectId(id) }).then((user) => {
            if (!user) {
                db.get().collection(collections.PATIENTS_COLLECTION).findOne({ _id: objectId(id) }).then((user) => {
                    if (!user) {
                        db.get().collection(collections.DOCTORS_COLLECTION).findOne({ _id: objectId(id) }).then((user) => {
                            done(null, user)
                        })
                    } else { done(null, user) }
                })
            } else { done(null, user) }
        }).catch(err => done(err))
    });
}