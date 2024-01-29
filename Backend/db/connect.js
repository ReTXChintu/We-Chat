const mongoose = require("mongoose");
require("dotenv").config();
const dbUrl = process.env.DATABASE_URL;

exports.mongoDB = async () => {
  await mongoose
    .connect(dbUrl)
    .then(() => {
      console.log("database connection established");
    })
    .catch((e) => {
      console.log(e);
    });
};

exports.conn = mongoose.connection;
