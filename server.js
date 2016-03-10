var express = require("express");
var logger = require("morgan");
var bodyParser = require("body-parser");
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcryptjs')
var appCtrl = require('./controllers/usercontroller');
var appModel = require('./models/user');
var db = require('mongoose');

var app = express();
// Configure Morgan
app.use(logger('dev'));

// Configure Database
db.connect('mongodb://localhost/financeapp/');

// Configure Body-Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configure Express Session
app.use(express.static(__dirname + '/'));
app.sessionMiddleware = session({
	secret: 'secret',
  	resave: false,
  	saveUninitialized: true,
})
app.use(app.sessionMiddleware)

// Configure Passport
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
    done(null, user.id);
});
passport.deserializeUser(function(id, done) {
    appModel.User.findById(id, function(err, user) {
        done(err, user);
    });
});

// Configure B-Crypt
passport.use(new LocalStrategy(
    function(username, password, done) {
        appModel.User.findOne({ username: username }, function (err, user) {
            if (err) { return done(err); }
            if (!user) {
                return done(null, false);
            }
            // If we got this far, then we know that the user exists. But did they put in the right password?
            bcrypt.compare(password, user.password, function(error, response){
                if (response === true){
                    return done(null,user)
                }
                else {
                    return done(null, false)
                }
            })
        });
    }
));

// Authentication
app.isAuthenticated = function(req, res, next){
    // If the current user is logged in...
    if(req.isAuthenticated()){
    // Middleware allows the execution chain to continue.
        return next();
    }
    // If not, redirect to login
    console.log('get outta here!')
    res.redirect('/');
}


app.isAuthenticatedAjax = function(req, res, next){
    // If the current user is logged in...
    if(req.isAuthenticated()){
    // Middleware allows the execution chain to continue.
        return next();
    }
    // If not, redirect to login
    res.send({error:'not logged in'});
}

app.post('/signup', appCtrl.registerUser);
app.post('/login', appCtrl.loginUser);

app.get('/', function(req, res){
    if (!req.session.count ) { req.session.count = 0}
    console.log(req.session.count++)
    console.log(req.user)
    res.sendFile('/templates/signup/login.html', {root: './public'})
})
app.get('/dashboard', app.isAuthenticated, function(req, res){
    res.sendFile('templates/ui/ui.html', {root: './public'})
})
app.get('/api/me', app.isAuthenticatedAjax, function(req, res){
    res.send({user:req.user})
})
app.get('/logout', function(req, res){
	req.logout();
	res.redirect('/');
});

var port = 1337;
app.listen(port, function() {
	console.log('Server running on port ' + port);
})