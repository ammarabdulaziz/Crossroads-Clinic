module.exports = {
    isAdmin: (req, res, next) => {
        if (req.isAuthenticated() && req.user.admin) {
            return next();
        }
        var error = 'Sorry, You are not authenticated. Please login to continue'
        res.redirect('/login?error=' + error)
    },

    isDoctor: (req, res, next) => {
        if (req.isAuthenticated() && req.user.doctor) {
            return next();
        }
        var error = 'Sorry, You are not authenticated. Please login to continue'
        res.redirect('/login?error=' + error)
    },

    isPatient: (req, res, next) => {
        if (req.isAuthenticated() && req.user.patient) {
            return next();
        }
        var error = 'Sorry, You are not authenticated. Please login to continue'
        res.redirect('/login?error=' + error)
    },

    isNotAuthenticated: (req, res, next) => {
        if (!req.isAuthenticated()) {
            return next();
        }
        else if (req.user.admin) {
            res.redirect('/admin')
        }
        else if (req.user.doctor) {
            res.redirect('/doctor')
        }
        else if (req.user.patient) {
            res.redirect('/')
        }
        else {
            var error = 'Sorry, You are not authenticated. Please login to continue'
            res.redirect('/login?error=' + error)
        }
    }
}