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

socket.on("connection", (socket) => {});

app.post("/addUser", upload.single("photo"), async (req, res) => {
  try {
    const { name, email, phone, pass, photo } = req.body;
    const result = await cloudinary.uploader.upload(photo);

    const fileFormat = result.format;

    console.log(fileFormat);

    const user = new Users({
      name: name,
      email: email,
      phone: phone,
      password: pass,
      photo: `${result.public_id}.${fileFormat}`,
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

app.post("/createChat", async (req, res) => {
  const { user1, user2 } = req.body;

  try {
    const chat = await Chats.findOne({
      users: {
        $all: [user1, user2],
      },
    });

    if (chat) {
      // Use Promise.all to wait for both async operations to complete
      const [chatUser, latestMessage] = await Promise.all([
        Users.findById(user2),
        Messages.findById(chat.latestMessage),
      ]);

      // Convert chat document to a plain JavaScript object
      const chatObject = chat.toObject();

      // Add additional fields to the chat object
      chatObject.chatUser = chatUser;
      chatObject.latestMessage = latestMessage;

      return res.status(200).json(chatObject);
    }

    const newChat = new Chats({
      users: [user1, user2],
    });

    const savedNewChat = await newChat.save();

    const [chatUser, latestMessage] = await Promise.all([
      Users.findById(user2),
      chat.latestMessage ? Messages.findById(chat.latestMessage) : null,
    ]);

    // Convert chat document to a plain JavaScript object
    const chatObject = savedNewChat.toObject();

    // Add additional fields to the chat object
    chatObject.chatUser = chatUser;
    chatObject.latestMessage = latestMessage;

    res.status(200).json(chatObject);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
    console.log(error);
  }
});

app.post("/createGroupChat", async (req, res) => {
  const { groupName, users, groupAdmin } = req.body;
  try {
    const newChat = new Chats({
      users: users,
      isGroup: true,
      groupAdmin: groupAdmin,
      groupName: groupName,
    });

    const newGroupChat = await newChat.save();

    const chatUsers = [];
    await Promise.all(
      newGroupChat.users.map(async (user) => {
        if (user !== groupAdmin) chatUsers.push(await Users.findById(user));
      })
    );

    const newGroupChatObject = newGroupChat.toObject();
    newGroupChatObject.chatUsers = chatUsers;
    newGroupChatObject.latestMessage = null;

    res.status(200).json(newGroupChatObject);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error creating group" });
  }
});

app.post("/sendMessage", async (req, res) => {
  const { sender, chatId, messageText } = req.body;
  try {
    let chat = await Chats.findById(chatId);

    const message = new Messages({
      chat: chat._id,
      content: messageText,
      sender: sender,
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

app.get("/chats", async (req, res) => {
  const userId = req.headers.authorization;

  try {
    const chats = await Chats.find({ users: { $in: [userId] } });

    const updatedChats = await Promise.all(
      chats.map(async (chat) => {
        const chatUser =
          chat.users[0].toString() === userId
            ? await Users.findById(chat.users[1]).select(
                "-password -blocklist -reports"
              )
            : await Users.findById(chat.users[0]).select(
                "-password -blocklist -reports"
              );
        const latestMessage = await Messages.findById(chat.latestMessage);

        // Create a new object with the additional chatUser property
        return {
          ...chat.toObject(), // Convert Mongoose document to plain object
          chatUser,
          latestMessage,
        };
      })
    );

    const sortedChats = updatedChats.sort((a, b) => b.updatedAt - a.updatedAt);

    res.status(200).json(sortedChats);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/messages/:chatId", async (req, res) => {
  const chatId = req.params.chatId;
  try {
    // Search for messages related to the specified chatId
    const messages = await Messages.find({ chat: chatId });

    res.status(200).json(messages);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/searchUser/:query", async (req, res) => {
  try {
    const query = req.params.query;

    // Search for a user based on the provided query
    const users = await Users.find({
      $or: [
        { name: { $regex: query, $options: "i" } }, // Case-insensitive name search
        { email: { $regex: query, $options: "i" } }, // Case-insensitive email search
        { phone: { $regex: query, $options: "i" } }, // Case-insensitive phone search
      ],
    }).select("-password -blocklist -reports");

    res.status(200).json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
