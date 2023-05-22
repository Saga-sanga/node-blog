const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const blogRoutes = require("./routes/blogRoutes");
const signInAndUpRoutes = require("./routes/signInAndUpRoutes");

require("dotenv").config();
const mongoPassword = process.env.MONGO_PASSWORD;

const app = express();

const port = process.env.PORT || 3000;

let userState = { isLoggedIn: false };

// Mongodb connection string
const mongoURI = `mongodb+srv://saga_sanga:${mongoPassword}@node-blog.whqmtry.mongodb.net/Sanga-blog-tuts?retryWrites=true&w=majority`;
mongoose
  .connect(mongoURI)
  .then((result) => {
    console.log("Connected to MongoDB");
    // Let the server listen for connections only after its connected to MongoDB. Otherwise, it will throw an error.
    app.listen(port);
  })
  .catch((err) => console.log(err));

// Register view engine
app.set("view engine", "ejs");

// A middleware is any code that runs between a request and a response
// Middleware and static files

// Serves all the files in public dir
app.use(express.static("public"));

// Third party middleware to log request information
app.use(morgan("dev"));

// Encode url data to request body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// JWT verification & authorization middleware
// TODO: Add logic
app.use((req, res, next) => {
  // TODO: Handle HTTPonly cookie
  const token = req.cookies.token;
  console.log("Token: ", token);

  // if (token) {
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log("JWT ERR: ", err);
      // res.json(err);
    }
    console.log("Verify: ", decoded);
  });
  next();
  // } else {
  //   res.redirect("/");
  // }
});

// Routes
app.get("/", (req, res) => {
  res.render("index", { title: "Home",  userState });
});

app.get("/about", (req, res) => {
  res.render("about", { title: "About", userState });
});

// Login and Sign up Routes
app.use(signInAndUpRoutes);

// Blog routes
app.use("/blogs", blogRoutes);

app.use((req, res) => {
  res.status(404).render("404", { title: "404" });
});

module.exports = userState;
