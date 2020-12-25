var db = require('./connection')
var collections = require('./collections')
var objectId = require('mongodb').ObjectID
const LocalStrategy = require('passport-local').Strategy
var GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const bcrypt = require('bcrypt')


module.exports = function (passport) {
    passport.use(
        new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
            // Match user email in 3 different collections
            db.get().collection(collections.ADMIN_COLLECTION).findOne({ email: email }).then((user) => {
                if (!user) {
                    db.get().collection(collections.PATIENTS_COLLECTION).findOne({ email: email }).then((user) => {
                        if (!user) {
                            db.get().collection(collections.DOCTORS_COLLECTION).findOne({ email: email }).then((user) => {
                                if (!user) {
                                    console.log('That email is not registered')
                                    return done(null, false, { message: 'This email is not registered' });
                                    // Match passwords if user exists
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

    // Google Strategy
    passport.use(new GoogleStrategy({
        clientID: '342345441039-borvs3jfm5rps6pin8d179qiv9otme0k.apps.googleusercontent.com',
        clientSecret: '2Nk5M0B7roDZhXlS36wXAUMO',
        callbackURL: "/auth/google/callback"
    },
        async function (accessToken, refreshToken, profile, done) {
            // profile contains user details
            let newUser = {
                googleId: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value,
                status: 'active',
                patient: true
            }

            try {
                let user = await db.get().collection(collections.PATIENTS_COLLECTION).findOne({ googleId: profile.id })
                if (user) {
                    done(null, user)
                } else {
                    // Register new user if user not found
                    db.get().collection(collections.PATIENTS_COLLECTION).insertOne(newUser).then((user) => {
                        done(null, user.ops[0])
                    })
                }
            } catch (err) {
                console.error(err)
                return done(null, false, { message: 'Somethin went wrong. Please try again.' });
            }
        }
    ));

    // Facebook Strategy
    passport.use(new FacebookStrategy({
        clientID: "822674468301210",
        clientSecret: "467eaf2ee931843aa6204f9cb95413d2",
        callbackURL: "http://localhost:3000/auth/facebook/callback",
        profileFields: ['id', 'displayName', 'name', 'gender', 'picture.type(large)', 'email']
    },
        async function (accessToken, refreshToken, profile, done) {
            // profile contains user details
            let newUser = {
                facebookId: profile.id,
                name: profile.displayName,
                status: 'active',
                patient: true
            }

            try {
                let user = await db.get().collection(collections.PATIENTS_COLLECTION).findOne({ facebookId: profile.id })
                if (user) {
                    done(null, user)
                } else {
                    // Register new user if user not found
                    db.get().collection(collections.PATIENTS_COLLECTION).insertOne(newUser).then((user) => {
                        done(null, user.ops[0])
                    })
                }
            } catch (err) {
                console.error(err)
                return done(null, false, { message: 'Somethin went wrong. Please try again.' });
            }
        }
    ));



    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser((id, done) => {
        // Find user details from 3 different collections and deserialize
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