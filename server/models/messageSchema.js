const mongoose = require("mongoose");

var messaggeSchema = new mongoose.Schema(
  {
    chat: {
      type: Object,
      ref: "chat",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

let message = mongoose.model("message", messaggeSchema);

module.exports = message;
