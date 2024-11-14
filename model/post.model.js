const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  caption: { type: String, defult: "" },
  image: { type: String, required: true },
  author: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
  likes: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
  comments: [{ type: mongoose.Schema.ObjectId, ref: "Comment" }],
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
