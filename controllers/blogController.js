const Blog = require("../models/blog");

const blog_index = (req, res) => {
  Blog.find()
    .sort({ createdAt: -1 })
    .then((result) => {
      res.render("blogs/index", { title: "All Blogs", blogs: result });
    })
    .catch((err) => {
      console.log(err);
    });
};

const blog_details = (req, res) => {
  const id = req.params.id;

  Blog.findById(id)
    .then((result) => {
      console.log(result._id);
      res.render("blogs/details", { blog: result, title: result.title });
    })
    .catch((err) => {
      console.log(err);
      res.render("404", { title: "Blog not found" });
    });
};

const blog_create_get = (req, res) => {
  res.render("blogs/create", { title: "New Blog" });
};

const blog_create_post = (req, res) => {
  const blog = new Blog(req.body);

  blog
    .save()
    .then((result) => {
      res.redirect("/blogs");
    })
    .catch((err) => console.log(err));
};

const blog_delete = (req, res) => {
  const id = req.params.id;

  // Cannot redirect from server because of Delete/PUT method therefore respond with a json payload
  Blog.findByIdAndDelete(id)
    .then((result) => {
      res.json({ redirect: "/blogs" });
    })
    .catch((err) => console.log(err));
};

const blog_edit_get = (req, res) => {
  const id = req.params.id;
  Blog.findById(id)
    .then((result) => {
      res.render("blogs/edit", { blog: result, title: "Edit Blog" });
    })
    .catch((err) => console.log(err));
};

const blog_edit_put = (req, res) => {
  const id = req.params.id;

  console.log("In PUT: ", req.body);

  Blog.findByIdAndUpdate(id, req.body, {
    runValidators: true,
    new: true,
  })
    .then((result) => {
      res.json({ redirect: `/blogs/${id}` });
    })
    .catch((err) => console.log(err));
};

module.exports = {
  blog_index,
  blog_details,
  blog_create_get,
  blog_create_post,
  blog_delete,
  blog_edit_get,
  blog_edit_put,
};
