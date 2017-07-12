var express       = require('express'),
    app           = express(),
    cookieParser  = require('cookie-parser'),
    bodyParser    = require('body-parser'),
    validator = require('express-validator'),
    cors          = require('cors'),
    path = require('path'),
    crypto = require('crypto'),
    flash = require('express-flash'),
    session = require('express-session'),
    logger        = require('morgan');

var users = require('./routes/users');
var passport = require('passport');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(validator());
app.use(cors());
app.use(cookieParser());
app.use(session({ secret: 'session secret key' }));
app.use(flash()); 

app.use(users);
app.use(passport.initialize())  
app.use(passport.session())  

module.exports = app;



// var express = require('express');
// var path = require('path');
// var favicon = require('serve-favicon');
// var logger = require('morgan');
// var cookieParser = require('cookie-parser');
// var bodyParser = require('body-parser');
// var cors = require('cors');
// var index = require('./routes/index');
// var users = require('./routes/users');
// var api = require('./routes/api');
// var session = require('express-session');
// var validator = require('express-validator');
// var app = express();
// var passport = require('passport');
// var flash = require('express-flash');


// // view engine setup 
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');


// app.use(express.static(path.join(__dirname, 'public')));
// app.use(cors());
// app.use(cookieParser());
// app.use(bodyParser());
// app.use(session({ secret: 'anything' }));
// app.use(flash()); 
// app.use(passport.initialize());
// app.use(passport.session());

// app.use('/', index);
// app.use(users);
// app.use('/api', api);

// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   var err = new Error('Not Found');
//   err.status = 404;
//   next(err);
// });

// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });




// module.exports = app;
