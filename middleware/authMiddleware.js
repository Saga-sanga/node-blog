const jwt = require("jsonwebtoken");
const User = require("../models/user");
require("dotenv").config();

// JWT verification & authorization middleware
const requireAuth = (req, res, next) => {
  const token = req.cookies.token;
  console.log("Token: ", token);

  // Check if token is valid otherwise redirect to login
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.log("JWT ERR: ", err);
        res.json(err).redirect("/login");
      } else {
        console.log("Verify: ", decoded);
        next();
      }
    });
  } else {
    res.redirect("/login");
  }
};

// Check if Current user is valid
const checkUser = (req, res, next) => {
  const token = req.cookies.token;

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        console.log("JWT ERR: ", err);
        res.locals.user = null;
        next();
      } else {
        const user = await User.findById(decoded.sub);
        res.locals.user = user;
        next();
      }
    });
  } else {
    res.locals.user = null;
    next();
  }
};

module.exports = { requireAuth, checkUser };
