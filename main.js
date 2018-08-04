'use strict';

const express = require('express');
const app = express();
const mongo = require('mongodb').MongoClient;
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session');
const pug = require('pug');
const cors = require('cors');

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static('public'))
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

mongo.connect(process.env.MLAB_URI, (err, db)=> {
  if(err) {
    console.log('Database error: ' + err);
  }else {
    console.log('Successful database connection');
  }
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser((id, done) => {
    db.collection('users').findOne(
        {_id: new ObjectID(id)},
        (err, doc) => {
            done(null, doc);
        }
    );
  });

  passport.use(new LocalStrategy(
    function(username, password, done) {
      db.collection('users').findOne({ username: username }, function (err, user) {
        console.log('User '+ username +' attempted to log in.');
        if (err) { return done(err); }
        if (!user) { return done(null, false); }
        if (password !== user.password) { return done(null, false); }
        return done(null, user);
      });
    }
  ));

  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
  };

  app.route('/').get((req, res) => {
    res.sendFile(__dirname + 'index.html')
  });

  var farmerSchema = new mongoose.Schema({
    type: { type: String, default: "farmer"},
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    gender: String,
    age: Number,
    mobile: { type: Number, required: true},
    uid: Number,
    address: [{
      street: String,
      city: String,
      state: String
    }],
    productsForWholesale: { type: [{
      product: String,
      size: Number,
      amount:  Number,
    }], default: [] },
    productsForCustomers: { type: [{
      product: String,
      size: Number,
      amount:  Number,
    }], default: [] },
    history: { type: [{
      toUser: [{
        name: String,
        username: String
      }],
      product: String,
      size: Number,
      amount: Number,
      rating: Number
    }], default: [] }
  });
  
  var buyerSchema = new mongoose.Schema({
    type: { type: String, default: "buyer"},
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    gender: String,
    age: Number,
    mobile: { type: Number, required: true},
    uid: Number,
    address: [{
      street: String,
      city: String,
      state: String
    }],
    productsAsWholesale: { type: [{
      product: String,
      size: Number,
      amount:  Number,
    }], default: [] },
    productsFromFarmers: { type: [{
      product: String,
      size: Number,
      amount:  Number,
    }], default: [] },
    history: { type: [{
      toUser: [{
        name: String,
        username: String
      }],
      product: String,
      size: Number,
      amount: Number,
      rating: Number
    }], default: [] }
  });
  
  var Farmers = mongoose.model('Farmers', farmerSchema);
  var Buyers = mongoose.model('Buyers', buyerSchema);
  
  var createFarmer = function(farmer, res){
    Farmers.create(farmer, function(err, data){
      if(err) {
        res.send("An error occurred, please try again!");
      }
      else {
        res.sendFile(__dirname + '/login/fprofile.html');
      }
    });
  };
  
  var createBuyer = function(buyer, res){
    Buyers.create(buyer, function(err, data){
      if(err) {
        res.send("An error occurred, please try again!");
      }
      else {
        res.sendFile(__dirname + '/login/bprofile.html');
      }
    });
  };
  
  var addProductForWholesaleSelling = function(username, product, res) {
    Farmers.findOne({ username: username }, function(err, data) {
      if(err) {
        res.send("An error occurred, please try again!");
      }
      else {
        data.productsForWholesale.push(product);
        data.save((err, redata) => {
          if(err) {
            res.send("An error occurred, please try again");
          }
          else {
            res.redirect('/login/fprofile.html');
          }
        });
      }
    });
  };
  
  var addProductForCustomerSelling = function(username, product, res) {
    Farmers.findOne({ username: username }, function(err, data) {
      if(err) {
        res.send("An error occurred, please try again!");
      }
      else {
        data.productsForCustomers.push(product);
        data.save((err, redata) => {
          if(err) {
            res.send("An error occurred, please try again");
          }
          else {
            res.redirect('/login/fprofile.html');
          }
        });
      }
    });
  };
  
  var addProductForWholesaleBuying = function(username, product, res) {
    Buyers.findOne({ username: username }, function(err, data) {
      if(err) {
        res.send("An error occurred, please try again!");
      }
      else {
        data.productsAsWholesale.push(product);
        data.save((err, redata) => {
          if(err) {
            res.send("An error occurred, please try again");
          }
          else {
            res.redirect('/login/fprofile.html');
          }
        });
      }
    });
  };
  
  var addProductForDirectBuying = function(username, product, res) {
    Buyers.findOne({ username: username }, function(err, data) {
      if(err) {
        res.send("An error occurred, please try again!");
      }
      else {
        data.productsFromFarmers.push(product);
        data.save((err, redata) => {
          if(err) {
            res.send("An error occurred, please try again");
          }
          else {
            res.redirect('/login/fprofile.html');
          }
        });
      }
    });
  };
  
  app.post('/fsignup', function(username, req, res) {
    Farmers.findOne({ username: username }, (err, data)=>{
      if(err) {
        res.send("An error occurred, please try again");
      }
      else if(data) {
        res.send("username already taken");
      }
      else {
        createFarmer([{ 
          username: req.body.fusername, 
          password: req.body.fpassword, 
          name: req.body.fname, 
          mobile: req.body.fmobile
        }], res);
      }
    });
  },
    passport.authenticate('local', { failureRedirect: '/' }), (req, res) => {
      res.redirect('/login/fprofile.html');
    }
  );
  
  app.post('/bsignup', function(username, req, res) {
    Buyers.findOne({ username: username }, (err, data)=>{
      if(err) {
        res.send("An error occurred, please try again");
      }
      else if(data) {
        res.send("username already taken");
      }
      else {
        createBuyer([{ 
          username: req.body.busername, 
          password: req.body.bpassword, 
          name: req.body.bname, 
          mobile: req.body.bmobile
        }], res);
      }
    });
  },
    passport.authenticate('local', { failureRedirect: '/' }), (req, res) => {
      res.redirect('/login/bprofile.html');
    }
  );
  
  app.post('/flogin', function(req, res) {
    passport.use(new LocalStrategy(
      function(username, password) {
        db.collection('users').findOne({ username: username }, function (err, user) {
          console.log('User '+ username +' attempted to log in.');
          if (err) { return done(err); }
          if (!user) { return done(null, false); }
          if (password !== user.password) { return done(null, false); }
          return done(null, user);
        });
      }
    ));
  });
});

app.use((req, res, next) => {
  return next({status: 404, message: 'not found'});
});