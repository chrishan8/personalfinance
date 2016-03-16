var express = require("express");
var logger = require("morgan");
var bodyParser = require("body-parser");
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcryptjs')
var appCtrl = require('./controllers/usercontroller');
var User = require('./models/user');
var plaid = require('plaid');
var db = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;

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
    User.User.findById(id, function(err, user) {
        done(err, user);
    });
});

// Configure B-Crypt
passport.use(new LocalStrategy(
    function(username, password, done) {
        User.User.findOne({ username: username }, function (err, user) {
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

// Configure Plaid
var plaidClient = new plaid.Client(process.env.PLAID_CLIENT_ID, process.env.PLAID_SECRET, plaid.environments.tartan);

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
//Possible bug in plaidaccounts route
app.get('/plaidaccounts', function(req, res, next) {
  var date = new Date();
  var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  var currentDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  firstDay = firstDay.toLocaleDateString("en-US");
  currentDate = currentDate.toLocaleDateString("en-US");
  var public_token = req.query.public_token;
  var userid = req.query.id;
  plaidClient.exchangeToken(public_token, function(err, tokenResponse) {
    if (err != null) {
    	console.log(err);
      res.json({error: 'Unable to exchange public_token'});
    } else {
      // The exchange was successful - this access_token can now be used to
      // safely pull account and routing numbers or transaction data for the
      // user from the Plaid API using your private client_id and secret.
      console.log(tokenResponse);
      var access_token = tokenResponse.access_token;
      plaidClient.getConnectUser(access_token, {gte: firstDay,}, function(err, connectResponse) {
        if (err != null) {
          res.json({err: 'Unable to pull transactions from the Plaid API'});
        } else {
          console.log(connectResponse);
          var accounts = connectResponse.accounts;
          var transactions = connectResponse.transactions;
          User.User.findByIdAndUpdate(userid, {$set: {accounts: accounts, transactions: transactions, access_token: access_token, last_updated: currentDate}}, function(err, docs) {
            res.send({message: 'user financial data saved if docs shown', data: docs});
          })
        }
      });
    }
  });
});

app.get('/api/updateAccounts', function(req, res, next) {
  var date = new Date();
  var currentDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  var userid = req.query.id;
  var access_token = req.query.access_token;
  currentDate = currentDate.toLocaleDateString("en-US");
  console.log(currentDate);
  var last_updated;
  User.User.findById(userid, function (err, User) {
    last_updated = User.last_updated;
  })
  .then(function() {
    if (currentDate !== last_updated) {
      plaidClient.getConnectUser(access_token, {gte: last_updated, lte: currentDate}, function(err, connectResponse) {
        if (err != null) {
          res.json({err: 'Unable to pull transactions from the Plaid API'});
        } else {
          var accounts = connectResponse.accounts;
          var transactions = connectResponse.transactions;
          User.User.findByIdAndUpdate(userid, {$set: {accounts: accounts, transactions: transactions, last_updated: currentDate}}, function(err, docs) {
            res.send({message: 'user financial data saved if docs shown', data: docs});
          })
        }
      });
    } else {
      res.send('Account is already up to date');
    }
  })
}) 

app.post('/api/categorizetransaction', function(req, res) {
  if (req.body[0].slateAccount === 'Fixed Expenses') {
    User.User.findByIdAndUpdate(req.body[1].id, {$push: {"slateAccounts.fixed_expenses.transactions": req.body[0]}}, function(err, doc) {
      console.log(err);
    })
    User.User.findByIdAndUpdate(req.body[1].id, {$pull: {"transactions": {_id: req.body[0]._id}}}, function(err, doc) {
      console.log(err);
    })
    res.send('transaction categorized');
  }
  else if (req.body[0].slateAccount === 'Investment') {
    User.User.findByIdAndUpdate(req.body[1].id, {$push: {"slateAccounts.investment.transactions": req.body[0]}}, function(err, doc) {
      console.log(err);
    })
    User.User.findByIdAndUpdate(req.body[1].id, {$pull: {"transactions": {_id: req.body[0]._id}}}, function(err, doc) {
      console.log(err);
    })
    res.send('transaction categorized');
  }
  else if (req.body[0].slateAccount === 'Short-Term Savings') {
    User.User.findByIdAndUpdate(req.body[1].id, {$push: {"slateAccounts.short_term_savings.transactions": req.body[0]}}, function(err, doc) {
      console.log(err);
    })
    User.User.findByIdAndUpdate(req.body[1].id, {$pull: {"transactions": {_id: req.body[0]._id}}}, function(err, doc) {
      console.log(err);
    })
    res.send('transaction categorized');
  }
  else if (req.body[0].slateAccount === 'Personal Development') {
    User.User.findByIdAndUpdate(req.body[1].id, {$push: {"slateAccounts.personal_development.transactions": req.body[0]}}, function(err, doc) {
      console.log(err);
    })
    User.User.findByIdAndUpdate(req.body[1].id, {$pull: {"transactions": {_id: req.body[0]._id}}}, function(err, doc) {
      console.log(err);
    })
    res.send('transaction categorized');
  }
  else if (req.body[0].slateAccount === 'Personal Spending') {
    User.User.findByIdAndUpdate(req.body[1].id, {$push: {"slateAccounts.personal_spending.transactions": req.body[0]}}, function(err, doc) {
      console.log(err);
    })
    User.User.findByIdAndUpdate(req.body[1].id, {$pull: {"transactions": {_id: req.body[0]._id}}}, function(err, doc) {
      console.log(err);
    })
    res.send('transaction categorized');
  }
  else if (req.body[0].slateAccount === 'Retirement') {
    User.User.findByIdAndUpdate(req.body[1].id, {$push: {"slateAccounts.retirement.transactions": req.body[0]}}, function(err, doc) {
      console.log(err);
    })
    User.User.findByIdAndUpdate(req.body[1].id, {$pull: {"transactions": {_id: req.body[0]._id}}}, function(err, doc) {
      console.log(err);
    })
    res.send('transaction categorized');
  }
  else {
    res.send({err: 'error categorizing'});
  }
})

app.post('/api/categorizespending', function(req, res) {
  User.User.findOne({_id : new ObjectId(req.body[1].id)},function(err,foundUser) {
    for (var i = 0; i < foundUser.slateAccounts.personal_spending.transactions.length; i++) {
      if (foundUser.slateAccounts.personal_spending.transactions[i]._id === req.body[0]._id) {
        foundUser.slateAccounts.personal_spending.transactions[i].category[0] = req.body[0].category[0]
        foundUser.markModified('slateAccounts')
        foundUser.save(function (err,savedUser) {
          res.send(savedUser)
        })
      }
    }
  })
})

app.post('/api/fundbudget', function(req, res) {
  User.User.findByIdAndUpdate(req.body[1].id, {$set: {
    "slateAccounts.fixed_expenses.budget" : req.body[0].fixed,
    "slateAccounts.investment.budget" : req.body[0].invest,
    "slateAccounts.short_term_savings.budget" : req.body[0].short,
    "slateAccounts.personal_development.budget" : req.body[0].develop,
    "slateAccounts.personal_spending.budget" : req.body[0].spend,
    "slateAccounts.retirement.budget" : req.body[0].retire
  }}, function(err, doc) {
    res.send('budget saved');
  })
})

app.post('/signup', appCtrl.registerUser);
app.post('/login', appCtrl.loginUser);

app.get('/', function(req, res){
    if (!req.session.count ) { req.session.count = 0}
    console.log(req.session.count++)
    console.log(req.user)
    res.sendFile('/templates/login/home.html', {root: './public'})
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