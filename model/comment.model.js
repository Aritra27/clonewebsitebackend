const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  author: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
  post: { type: mongoose.Schema.ObjectId, ref: "Post", required: true },
});

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
