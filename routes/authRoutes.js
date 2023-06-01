const express = require("express");
const {
  route_logout,
  route_login_get,
  route_login_post,
  route_signup_get,
  route_signup_post,
  route_oauth_google
} = require("../controllers/authController");
require("dotenv").config();

const router = express.Router();

router.get("/logout", route_logout);
router.get("/login", route_login_get);
router.post("/login", route_login_post);

router.post("/login/auth/google", route_oauth_google);

router.get("/sign-up", route_signup_get);
router.post("/sign-up", route_signup_post);

module.exports = router;
