const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const jsonwebtoken = require("jsonwebtoken");
const User = require("./models/user");

const blogRoutes = require("./routes/blogRoutes");

require("dotenv").config();
const mongoPassword = process.env.MONGO_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET;

const app = express();

const port = process.env.PORT || 3000;

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

// Third party middleware to log req information
app.use(morgan("dev"));

// Encode url data to request body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.render("index", { title: "Home" });
});

app.get("/about", (req, res) => {
  console.log(req.params, req.query);
  res.render("about", { title: "About" });
});

// Login and Sign up
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  console.log(req.body);

  // User validation
  // TODO: Query MongoDB for user and find match, if match found change state to logged in.
  // Maybe add encryption and crypto validation for password
  // Can't store password as plaintext in db, it's possibe to do it though
  User.findOne({ email })
    .then((user) => {
      console.log(user);
      if (email === user.email && password === user.password) {
        // Change state to logged in
        // Redirect to Blogs
        const token = jsonwebtoken.sign({ email }, JWT_SECRET, {
          expiresIn: "4h",
        });
        res.status(200).json({ token });
      } else {
        res.status(401).json({ message: "Invalid credentials" });
      }
    })
    .catch((err) => console.log(err));
});

app.get("/sign-up", (req, res) => {
  res.render("signup", { title: "Sign Up" });
});

app.post("/sign-up", (req, res) => {
  console.log(req.body);

  const user = new User(req.body);

  user
    .save()
    .then((result) => {
      console.log(result);
      res.json(req.body);
    })
    .catch((err) => {
      console.log(err);

      if (err.code === 11000) {
        res.status(409).json({ message: "Email already exists" });
      }
    });
  // TODO: Check if email is already in use, if not add to database, change state to logged in and redirect.
  // Create new model for users
});

// Blog routes
app.use("/blogs", blogRoutes);

app.use((req, res) => {
  res.status(404).render("404", { title: "404" });
});

// TODO:
// 1. Add categories and filter for content
// 2. Add author and date to blog
// 3. Improve style of blog
// 4. Add login and users
// 5. Manage sessions through cookies
