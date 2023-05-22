const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/user");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;

const router = express.Router();

// Create token method
const createToken = (user) => {
  return jwt.sign(
    {
      sub: user._id,
      email: user.email,
      iat: parseInt(new Date().getTime() / 1000),
    },
    JWT_SECRET,
    { expiresIn: "4h" }
  );
}

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
})

router.get("/login", (req, res) => {
  res.render("login", { title: "Login" });
})

router.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  console.log(req.body);

  // User validation
  User.findOne({ email })
    .then((user) => {
      console.log("Login", user);
      
      if (email === user.email) {
        bcrypt.compare(password, user.password, (err, result) => {
          if (err) {
            console.log(err);
            res.status(401).json({ message: err.message });
          }

          // Create a JWT token, set cookie in response header and Redirect to Blogs
          if (result) {
            const token = createToken(user);

            res
              .status(200)
              .cookie("token", token, {
                expires: new Date(Date.now() + 4 * 3600000),
                httpOnly: true,
              })
              .json({
                message: "Successfully logged in",
                redirect: "/blogs",
                firstname: user.firstname
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
  const user = new User(req.body);

  user
    .save()
    .then((result) => {
      // Create a new JWT token and redirect to Blogs
      const token = createToken(result);

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

  // TODO: Change state to logged in and redirect.
});

module.exports = router;
