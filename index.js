const express = require("express");
const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("./models/userModel");
const foodModel = require("./models/foodModel");
const trackingModel = require("./models/trackingModel");
const verifyToken = require("./verifyToken");
require('dotenv').config()


// database connection
mongoose
  .connect(
    "mongodb+srv://ofomimatthew7:jerryhope1994@nutri-tracker-cluster.0lx0arv.mongodb.net/nutrition-tracker-db"
  )
  .then(() => {
    console.log("Connection successful");
  })
  .catch((err) => {
    console.log(err);
  });

const app = express();

app.use(express.json());

// registering user
app.post("/register/", (req, res) => {
  let user = req.body;
  bcryptjs.genSalt(10, (err, salt) => {
    if (!err) {
      bcryptjs.hash(user.password, salt, async (err, hash) => {
        if (!err) {
          user.password = hash;
          try {
            let data = userModel.create(user);
            res.status(201).send({message: "User Registered" });
          } catch (err) {
            res.status(500).send(err.message);
          }
        }
      });
    }
  });
});

// login endpoint
app.post("/login/", async (req, res) => {
  let userCred = req.body;
  try {
    let userData = await userModel.findOne({ email: userCred.email });
    if (userData !== null) {
      bcryptjs.compare(userCred.password, userData.password, (err, result) => {
        if (result === true) {
          jwt.sign({ email: userCred.email },process.env.SECRET_KEY, (err, token) => {
            if (!err) {
              res.send({ message: "Login Success", token: token });
            } else {
              res.status(401).send("issue occured creating token");
            }
          });
        } else {
          res.status(403).send({ message: "Incorrect password" });
        }
      });
    } else {
      res.status(404).send({ message: "User not found!" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message);
  }
});

// endpoint for creating new food

app.post("/foods/", async (req, res) => {
  const food = req.body;
  try {
    const data = await foodModel.create(food);
    res.status(201).send({ data: data, message: "Food created" });
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

// endpoint for getting all foods

app.get("/foods/", verifyToken, async (req, res) => {
  try {
    let data = await foodModel.find();
    res.send(data);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// endpoint for getting a single food
app.get("/foods/:name", verifyToken, async (req, res) => {
  try {
    // The $regex is used to search for any matching not exact match per se
    let foods = await foodModel.find({
      name: { $regex: req.params.name, $options: "i" },
    });
    if (foods.length !== 0) {
      res.send({ data: foods });
    } else {
      res.status(404).send({ message: "No food found" });
    }
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// endpoint tracking foods eaten by users
app.post("/track/", verifyToken, async (req, res) => {
  let trackData = req.body;
  try {
    let foodData = await trackingModel.create(trackData);
    res.status(201).send({ message: "Food added", data: foodData });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Some Problem adding food" });
  }
});

// endpoint for getting food eaten by a user

app.get("/track/:userid/:date",verifyToken, async (req, res) => {
  let userId = req.params.userid;
  let dateEaten = req.params.date
  try {
    let foods = await trackingModel.find({ userID: userId,eatenDate:dateEaten }).populate('userID').populate('foodID');
    res.send(foods);
    
  } catch (err) {
    console.log("no user found");
    res.status(500).send("No user found");
  }
});

app.listen(4000, () => {
  console.log("server running");
});
