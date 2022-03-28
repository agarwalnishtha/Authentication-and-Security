//jshint esversion:6

require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema({
  email : String,
  password : String
});

userSchema.plugin(encrypt, {secret : process.env.SECRETCODE , encryptedFields: ['password']});

const User = mongoose.model("User", userSchema);

app.get("/",function(req,res){
  res.render("home");
});

app.get("/login",function(req,res){
  res.render("login");
});

app.get("/register",function(req,res){
  res.render("register");
});

app.post("/register", function(req,res){
  const newUser = new User({
    email : req.body.username,
    password : req.body.password
  });

  newUser.save(function(err){
    if(!err){
      res.render("secrets");
    }
    else{
      res.send(err);
    }
  });
});

app.post("/login", function(req,res){
  User.findOne({email : req.body.username}, function(err,foundUser){
    if(err){
      res.send(err);
    }
    else{
      if(foundUser){
        if(foundUser.password === req.body.password){
          res.render("secrets");
        }
        else{
          res.send("Incorrect password");
        }
      }
      else{
        res.send("User not found. Go to register.")
      }
    }
  });
});

app.listen(3000,function(){
  console.log("server started on port 3000");
});
