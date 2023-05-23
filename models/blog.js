const mongoose = require("mongoose");
const User = require("./user");
const Schema = mongoose.Schema;

const blogSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
    },
    snippet: {
      type: String,
      required: [true, "Snippet is required"],
    },
    body: {
      type: String,
      required: [true, "Body is required"],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User,
    },
  },
  { timestamps: true }
);

// The name we pass to the model is important because it gets pluralised and looks for the exact name in the MongoDB Collections
const Blog = mongoose.model("blog", blogSchema);

module.exports = Blog;
