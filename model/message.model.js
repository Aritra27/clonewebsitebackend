const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.ObjectId, ref: "User" },
  receiverId: { type: mongoose.Schema.ObjectId, ref: "User" },
  message: { type: String, required: true },
});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
