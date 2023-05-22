const jwt = require("jsonwebtoken");
const User = require("../models/user");

// JWT verification & authorization middleware
const requireAuth = (req, res, next) => {
  // TODO: Handle HTTPonly cookie
  const token = req.cookies.token;
  console.log("Token: ", token);

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
}

// Check if Current user is valid

module.exports = requireAuth;