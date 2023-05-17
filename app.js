const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const Blog = require("./models/blog");
const { result } = require("lodash");

require("dotenv").config();
const mongoPassword = process.env.MONGO_PASSWORD;

const app = express();

const port = 3000;

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
app.use(morgan("dev"));

// mongoose and mongo sandbox routes
app.get("/add-blog", (req, res) => {
  const blog = new Blog({
    title: "A new Blog",
    snippet: "A new blog that I have created",
    body: "A lot of text is not necressary for a blog. You can just write a few words and upload it and it will be a blog. Technically speaking. But now the problem is if the users would want to read your blog.",
  });

  blog
    .save()
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/all-blogs", (req, res) => {
  Blog.find()
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/single-blog", (req, res) => {
  Blog.findById("6464d74cf50fa7090397fc2a")
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      console.log(err);
    });
});

// Routes
app.get("/", (req, res) => {
  res.redirect("/blogs");
});

app.get("/about", (req, res) => {
  res.render("about", { title: "About" });
});

app.get("/blogs", (req, res) => {
  Blog.find()
    .sort({ createdAt: -1 })
    .then((result) => {
      res.render("index", { title: "All Blogs", blogs: result });
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/blogs/create", (req, res) => {
  res.render("create", { title: "New Blog" });
});

app.use((req, res) => {
  res.status(404).render("404", { title: "404" });
});
