const mongoose = require("mongoose");

var chatSchema = new mongoose.Schema(
  {
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "message",
    },
    isGroup: {
      type: Boolean,
      default: false,
    },
    groupAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    groupName: {
      type: String,
    },
    groupIcon: {
      type: String,
      default: "zyypxtz4hw43gi8hcf9o.jpg",
    },
  },
  {
    timestamps: true,
  }
);

let chat = mongoose.model("chat", chatSchema);

module.exports = chat;
