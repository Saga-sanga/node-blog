const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const { OAuth2Client } = require("google-auth-library");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

// Verifying Google-Auth-Token
async function verify(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  const userid = payload["sub"];
  console.log({ payload });
  console.log("UserID: ", userid);

  return payload;
}

// Handle Error
function handleError(err, res) {
  console.log(err);
  res.status(401).json({
    error: err.message,
  });
}

// Auth Routes
const route_logout = (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
};

const route_login_get = (req, res) => {
  res.render("login", { title: "Login" });
};

const route_login_post = (req, res) => {
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
};

const route_oauth_google = async (req, res) => {
  // Checking Double-submit-cookie
  if (!req.cookies.g_csrf_token) {
    res.json("No CSRF token in Cookie.");
  }
  if (!req.body.g_csrf_token) {
    res.json("No CSRF token in post body.");
  }
  if (req.cookies.g_csrf_token !== req.body.g_csrf_token) {
    res.json("Failed to verify double submit cookie.");
  }

  // Check if user exists in database if not create new entry and change state to login
  const payload = await verify(req.body.credential).catch(console.error);

  const userInfo = {
    email: payload.email,
    firstname: payload.given_name,
    lastname: payload.family_name,
  }

  let user = await User.findOne({ email: userInfo.email });
  if (!user) {
    const newUser = new User(userInfo);
    user = await newUser.save().catch(err => handleError(err, res));
  }

  const token = createToken(user);
  res
    .status(201)
    .cookie("token", token, {
      expires: new Date(Date.now() + 4 * 3600000),
      httpOnly: true,
    })
    .redirect("/blogs");
};

const route_signup_get = (req, res) => {
  res.render("signup", { title: "Sign Up" });
};

const route_signup_post = (req, res) => {
  const {email, firstname, lastname, password} = req.body;
  const user = new User({email, firstname, lastname, password});

  if (!password) {
    res.status(400).json({error: { error: "Password is required" }});
  }

  if (password && email) {
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
        let message = {
          error: statusCode === 409 ? "Email already exists" : err._message,
        };
  
        if (err.errors?.email) {
          message.email = err.errors.email;
        }
  
        if (err.errors?.password) {
          message.password = err.errors.password;
        }
        // Check if err is due to duplicate email
        console.log(message);
        res.status(statusCode).json({
          error: message,
        });
      });
  }
};

module.exports = {
  route_logout,
  route_login_get,
  route_login_post,
  route_signup_get,
  route_signup_post,
  route_oauth_google,
};
