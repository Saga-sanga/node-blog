const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const blogRoutes = require("./routes/blogRoutes");
const authRoutes = require("./routes/authRoutes");
require("dotenv").config();

const app = express();

const mongoPassword = process.env.MONGO_PASSWORD;
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

app.set("view engine", "ejs");

// Serves all the files in public dir
app.use(express.static("public"));
app.use(morgan("dev"));

// Encode url data to request body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Routes
app.get("/", (req, res) => {
  res.render("index", { title: "Home" });
});

app.get("/about", (req, res) => {
  res.render("about", { title: "About" });
});

app.use(authRoutes);
app.use("/blogs", blogRoutes);

app.use((req, res) => {
  res.status(404).render("404", { title: "404" });
});
