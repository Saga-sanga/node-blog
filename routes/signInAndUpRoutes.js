const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/user");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;
const saltRounds = 10;

const router = express.Router();

router.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  console.log(req.body);

  // User validation
  User.findOne({ email })
    .then((user) => {
      console.log("Login", user);
      if (email === user.email) {
        // Hash password using bcrypt
        bcrypt.compare(password, user.password, (err, result) => {
          if (err) {
            console.log(err);
            res.status(401).json({ message: err.message });
          }

          if (result) {
            // Change state to logged in (use Sessions)
            // Redirect to Blogs
            const token = jwt.sign(
              {
                sub: user._id,
                email,
                iat: new Date().getTime() / 1000,
              },
              JWT_SECRET,
              { expiresIn: "4h" }
            );
            res
              .status(200)
              .cookie("token", token, {
                expires: new Date(Date.now() + 4 * 3600000),
                httpOnly: true,
              })
              .json({
                message: "Successfully logged in",
                redirect: "/blogs",
                ...result,
              });
          } else {
            // Return 401 if password is incorrect
            res.status(401).json({ message: "Invalid credentials" });
          }
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: err.message });
    });
});

router.get("/sign-up", (req, res) => {
  res.render("signup", { title: "Sign Up" });
});

router.post("/sign-up", (req, res) => {
  const userData = { ...req.body };
  console.log(userData);

  // Hash password using bcrypt
  bcrypt.hash(userData.password, saltRounds, (err, hash) => {
    if (err) {
      console.log(err);
      res.status(500).json({ message: "Internal server error" });
    }

    userData.password = hash;
    console.log(userData);

    const user = new User(userData);

    user
      .save()
      .then((result) => {
        console.log(result);

        // Create a new JWT token and redirect to Blogs
        const token = jwt.sign(
          {
            sub: result._id,
            email: result.email,
            iat: new Date().getTime() / 1000,
          },
          JWT_SECRET,
          { expiresIn: "4h" }
        );
        res
          .status(201)
          .cookie("token", token, {
            expires: new Date(Date.now() + 4 * 3600000),
            httpOnly: true,
          })
          .json({
            message: "Successfully logged in",
            redirect: "/blogs",
            ...result,
          });
      })
      .catch((err) => {
        console.log(err);
        // Check if err is due to duplicate email
        const statusCode = err.code === 11000 ? 409 : 500;
        res
          .status(statusCode)
          .json({ message: err.message || "Internal server error" });
      });
  });

  // TODO: Change state to logged in and redirect.
  // Create new model for users
});

module.exports = router;
