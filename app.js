//jshint esversion:6

require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require("passport-local-mongoose");
// const bcrypt = require('bcrypt');
// const saltRounds = 10;
//const md5 = require('md5');
//const encrypt = require("mongoose-encryption");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

app.use(session({
  secret : process.env.SECRETCODE,
  resave : false,
  saveUninitialized :false
}));

app.use(passport.initialize());

app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);

//userSchema.plugin(encrypt, {secret : process.env.SECRETCODE , encryptedFields: ['password']});

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req, res) {
  res.render("home");
});

app.get("/login", function(req, res) {
  res.render("login");
});

app.get("/register", function(req, res) {
  res.render("register");
});

app.get("/secrets", function(req,res){
  if(req.isAuthenticated()){
    res.render("secrets");
  }
  else{
    res.redirect("/login");
  }
});

app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});
//whenever you restart your server the cookie gets deleted and the session gets restarted i.e. you no longer are logged in

app.post("/register", function(req, res) {

  User.register({username : req.body.username}, req.body.password, function(err,user){
    if(err){
      console.log(err);
      res.redirect("/register");
    }
    else{
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets")
      });
    }
  });

  // const hash = bcrypt.hashSync(req.body.password, saltRounds);
  //
  // const newUser = new User({
  //   email: req.body.username,
  //   password: hash
  // });
  //
  // newUser.save(function(err) {
  //   if (!err) {
  //     res.render("secrets");
  //   } else {
  //     res.send(err);
  //   }
  // });
});

app.post("/login", function(req, res) {

  const user = new User({
    username : req.body.username,
    password : req.body.password
  });

  req.login(user, function(err){
    if(err){
      console.log(err);
    }
    else{
      passport.authenticate("local")(req,res,function(){
        res.redirect("/secrets");
      });
    }
  });

  // User.findOne({email: req.body.username}, function(err, foundUser) {
  //   if (err) {
  //     res.send(err);
  //   } else {
  //     if (foundUser) {
  //       bcrypt.compare(req.body.password, foundUser.password, function(err, result) {
  //           if(result === true){
  //             res.render("secrets");
  //           }
  //           else {
  //             res.send("Incorrect password");
  //           }
  //         });
  //       }
  //       else {
  //         res.send("User not found. Go to register.")
  //     }
  //   }
  // });
});

app.listen(3000, function() {
  console.log("server started on port 3000");
});
