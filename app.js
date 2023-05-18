const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const blogRoutes = require("./routes/blogRoutes");

require("dotenv").config();
const mongoPassword = process.env.MONGO_PASSWORD;

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
  res.redirect("/blogs");
});

app.get("/about", (req, res) => {
  res.render("about", { title: "About" });
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