var User = require('../models/user');
var bcrypt = require('bcryptjs');
var passport = require('passport');

var registerUser = function(req, res) {
	bcrypt.genSalt(11, function(error, salt){
        bcrypt.hash(req.body.password, salt, function(hashError, hash){
            var newUser = new User.User({
                username: req.body.username,
                password: hash,
                accounts: req.body.accounts,
                transactions: req.body.transactions,
                access_token: req.body.access_token
            });
            newUser.save(function(saveErr, user){
                if ( saveErr ) { res.send({ err:saveErr }) }
                else {
                    req.login(user, function(loginErr){
                        if ( loginErr ) { res.send({ err:loginErr }) }
                        else { res.send({success: 'success'}) }
                    })
                }
            })

        })
    })
}

var loginUser = function(req, res, next) {
	passport.authenticate('local', function(err, user, info) {
        if (err) { return next(err); }
        if (!user) { return res.send({error : 'something went wrong :('}); }
        req.logIn(user, function(err) {
            if (err) { return next(err); }
            return res.send({success:'success'});
        });
    })(req, res, next);
}

module.exports = {
	registerUser: registerUser,
	loginUser: loginUser
}