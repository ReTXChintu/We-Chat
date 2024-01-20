const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const saltRounds = 10;

var userSchema = new mongoose.Schema(
  {
    password: {
      type: String,
      required: true,
    },
    photo: {
      type: String,
      // required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      //   required: true,
      unique: true,
    },
    isOnline: {
      type: Boolean,
    },
    lastSeen: {
      type: Date,
    },
    rCode: {
      type: String,
    },
    blocklist: [
      {
        type: String,
      },
    ],
    reports: [
      {
        type: String,
      },
    ],
    // otp: {
    //   type: Number,
    //   required: true,
    // },
    // expiry: {
    //   type: Number,
    //   required: true,
    // },
    // verified: {
    //   type: Boolean,
    //   required: true,
    // },
  },
  {
    timestamps: true,
  }
);

userSchema.pre(`save`, async function (next) {
  if (this.isModified(`password`)) {
    this.password = await bcrypt.hash(this.password, saltRounds);
    this.cPassword = await bcrypt.hash(this.password, saltRounds);
  }
  next();
});

let user = mongoose.model("user", userSchema);

module.exports = user;
