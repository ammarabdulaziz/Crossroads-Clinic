var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var dotenv = require('dotenv')
var hbs = require('express-handlebars');
var fileUpload = require('express-fileupload');
var db = require('./config/connection');
var passport = require('passport');
var session = require('express-session');
var flash = require('connect-flash')

var patientRouter = require('./routes/patientRouter');
var adminRouter = require('./routes/adminRouter');
var doctorRouter = require('./routes/doctorRouter');
var authRouter = require('./routes/authRouter');

var app = express();

// Passport Config
require('./config/passport')(passport);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// view engine setup
app.engine('hbs', hbs({
  extname: 'hbs',
  defaultLayout: 'layout',
  layoutsDir: __dirname + '/views/',
  partialsDir: __dirname + '/views/partials/'
}));

app.use(fileUpload());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Clear chache when not authenticated
app.use(function (req, res, next) {
  if (!req.isAuthenticated()) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
  }
  next();
});

var hbs = hbs.create({});

// register new function
hbs.handlebars.registerHelper("check", function (x, y, options) {
  if (x == y) {
    return options.fn(this);
  } else if( x != y){
    return options.inverse(this);
  } 
});

app.use(session({ secret: "key", cookie: { maxAge: 8*60*60*1000 } }));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Console authenticated user and its session
// app.use((req, res, next) => {
//   console.log('req.session: ', req.session)
//   console.log('req.user: ', req.user)
//   next()
// })

app.use(express.static(path.join(__dirname, 'public')));

//Call db connection
db.connect((err) => {
  if (err) console.log("Connection error" + err);
  else console.log("Database connected Successfully");
});

app.use('/', patientRouter);
app.use('/admin', adminRouter);
app.use('/doctor', doctorRouter);
app.use('/auth', authRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
