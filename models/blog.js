const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const blogSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    snippet: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

// The name we pass to the model is important because it gets pluralised and looks for the exact name in the MongoDB Collections
const Blog = mongoose.model("Blog", blogSchema);

module.exports = Blog;
