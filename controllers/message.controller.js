const Conversation = require("../model/conversation.model");
const Message = require("../model/message.model");
const { getReceiverSocketId, io } = require("../socket/socket");

const sendMessage = async (req, res) => {
  try {
    const senderId = req.id;
    const receiverId = req.params.id;
    const message = req.body.textMessage;
    console.log("its message" + message);
    let conversation = await Conversation.findOne({
      participents: { $all: [senderId, receiverId] },
    });
    //establish conversation

    if (!conversation) {
      conversation = await Conversation.create({
        participents: [senderId, receiverId],
      });
    }
    const newMessage = await Message.create({
      senderId,
      receiverId,
      message,
    });
    if (newMessage) conversation.message.push(newMessage._id);
    await Promise.all([conversation.save(), newMessage.save()]);

    //implement socket for real time data transfer
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }
    return res.status(200).json({
      success: true,
      newMessage,
    });
  } catch (error) {
    console.log(error);
  }
};
const getMessage = async (req, res) => {
  try {
    const senderId = req.id;
    const receiverId = req.params.id;
    const conversation = await Conversation.findOne({
      participents: { $all: [senderId, receiverId] },
    }).populate("message");

    if (!conversation)
      return res.status(200).json({ success: true, messages: [] });

    return res
      .status(200)
      .json({ success: true, messages: conversation.message });
  } catch (error) {
    console.log(error);
  }
};

module.exports = { sendMessage, getMessage };
