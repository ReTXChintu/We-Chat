const mongoose = require("mongoose");

exports.mongoDB = async () => {
  await mongoose
    .connect(
      "mongodb+srv://biswajitpanda552:2GQj83SlrnAVraGA@cluster0.le9p0fn.mongodb.net/sample_mflix",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    )
    .then(() => {
      console.log("database connection established");
    })
    .catch((e) => {
      console.log(e);
    });
};

exports.conn = mongoose.connection;
