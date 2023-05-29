const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/user");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;

const router = express.Router();

// Create token
function createToken(user) {
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
});

router.get("/login", (req, res) => {
  res.render("login", { title: "Login" });
});

router.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  console.log(req.body);

  // User validation
  User.findOne({ email })
    .then((user) => {
      if (email === user.email) {
        bcrypt.compare(password, user.password, (err, result) => {
          if (err) {
            console.log(err);
            res.status(401).json({ error: err.message });
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
                firstname: user.firstname,
              });
          } else {
            // Return 401 if password is incorrect
            res.status(401).json({ error: "Password is incorrect" });
          }
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(401).json({ error: "Email not found" });
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
      const statusCode = err.code === 11000 ? 409 : 500;
      let message = { error: statusCode === 409 ? "Email already exists" : err._message };

      if (err.errors?.email) {
        message.email = err.errors.email;
      }

      if (err.errors?.password) {
        message.password = err.errors.password;
      }
      // Check if err is due to duplicate email
      console.log(message)
      res
        .status(statusCode)
        .json({
          error: message,
        });
    });

  // TODO: Change state to logged in and redirect.
});

module.exports = router;
