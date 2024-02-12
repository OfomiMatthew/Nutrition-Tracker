const express = require("express");
const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("./models/userModel");

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
            res.status(201).send({ data: data, message: "User Registered" });
          } catch (err) {
            res.status(500).send(err.message);
          }
        }
      });
    }
  });
});

app.post("/login/", async (req, res) => {
  let userCred = req.body;
  try {
    let userData = await userModel.findOne({ email: userCred.email });
    if (userData !== null) {
      bcryptjs.compare(userCred.password, userData.password, (err, result) => {
        if (result === true) {
          jwt.sign({ email: userCred.email }, "mattKey", (err, token) => {
            if (!err) {
              res.send({ message: "Login Success" , token: token});
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
  } catch (e) {
    console.log(err);
    res.status(500).send(err.message);
  }
});

app.listen(4000, () => {
  console.log("server running");
});
