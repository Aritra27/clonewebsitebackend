const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema({
  participents: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
  message: [{ type: mongoose.Schema.ObjectId, ref: "Message" }],
});

const Conversation = mongoose.model("Conversation", conversationSchema);

module.exports = Conversation;
