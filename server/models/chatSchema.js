const mongoose = require("mongoose");

var chatSchema = new mongoose.Schema(
  {
    users: [
      {
        type: Object,
        ref: "user",
      },
    ],
    latestMessage: {
      type: Object,
      ref: "message",
    },
    isGroup: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

let chat = mongoose.model("chat", chatSchema);

module.exports = chat;
