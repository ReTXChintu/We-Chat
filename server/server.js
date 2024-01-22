const express = require("express");
const app = express();
const http = require("http");
const connect = require("./db/connect");
const bodyParser = require("body-parser");
const Users = require("./models/userSchema");
const Chats = require("./models/chatSchema");
const Messages = require("./models/messageSchema");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const cors = require("cors");
const bcrypt = require("bcrypt");
require("dotenv").config();
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY;
const cloudinaryAptSecret = process.env.CLOUDINARY_API_SECRET;

const server = app.listen(8000, () => {
  console.log("Server connected to port 8000");
});

const socket = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.SOCKET_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

connect.mongoDB();

app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));
app.use(cors());
cloudinary.config({
  cloud_name: cloudName,
  api_key: cloudinaryApiKey,
  api_secret: cloudinaryAptSecret,
});
// Configure Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

socket.on("connection", (socket) => {
  socket.on("userConnected", async (userId) => {
    const chats = await Chats.find({ users: { $in: [userId] } });

    socket.emit("gotChats", chats);
  });

  socket.on("sendMessage", async ({sender, chatId, message}) => {
    console.log(chatId);
    const chat = await Chats.findById(chatId);

    console.log(chat);

    const newMessage = new Messages({
      chat: chat,
      sender: sender,
      content: message,
      status: "sent",
    });

    const savedMessage = await newMessage.save();

    chat.latestMessage = savedMessage;

    const savedChat = await chat.save();

    const newSavedMessage = await Messages.findByIdAndUpdate(
      savedMessage._id,
      { $set: { chat: savedChat } },
      { new: true }
    );

    socket.emit("newMessage", newSavedMessage);
  });
});

app.post("/addUser", upload.single("photo"), async (req, res) => {
  try {
    const { name, email, phone, pass, photo } = req.body;
    const result = await cloudinary.uploader.upload(photo);

    const user = new Users({
      name: name,
      email: email,
      phone: phone,
      password: pass,
      photo: result.public_id,
    });

    await user.save();

    res.status(200).json({ message: "User Created Successfully" });
  } catch (error) {
    console.log(error);
  }
});

app.post("/login", async (req, res) => {
  const { email, pass } = req.body;
  console.log("calling");

  try {
    const user = await Users.findOne({ email: email });

    if (!user) {
      return res.status(400).json("Incorrect Credentials");
    }

    // Wrap bcrypt.compare in a Promise
    const passwordMatch = await new Promise((resolve, reject) => {
      bcrypt.compare(pass, user.password, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    if (!passwordMatch) {
      return res.status(400).json("Incorrect Credentials");
    }

    // const expirationTime = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60;

    // const token = jwt.sign({ id: user.id }, JWT_SECRET, {
    //   expiresIn: expirationTime,
    // });

    const userWithoutPassword = { ...user.toObject() };
    delete userWithoutPassword.password;

    res.status(200).json({ user: userWithoutPassword });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/sendMessage", async (req, res) => {
  const { sender, receiver, messageText } = req.body;
  const senderUser = await Users.findById(sender);

  try {
    let chat = await Chats.findOne({
      $or: [{ users: [sender, receiver] }, { users: [receiver, sender] }],
    });

    if (!chat) {
      const newChat = new Chats({
        users: [sender, receiver],
        isGroup: false,
      });

      chat = await newChat.save();
    }

    const message = new Messages({
      chat: chat._id,
      content: messageText,
      sender: sender,
      receiver: receiver,
      status: "sent",
    });

    const newMessage = await message.save();

    chat.latestMessage = newMessage._id;

    await chat.save();

    res.status(200).json(newMessage);
  } catch (error) {
    console.log(error);
  }
});

app.post("/searchUser", (req, res) => {});
