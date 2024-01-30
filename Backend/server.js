const express = require("express");
const app = express();
const http = require("https");
const connect = require("./db/connect");
const bodyParser = require("body-parser");
const Users = require("./models/userSchema");
const Chats = require("./models/chatSchema");
const Messages = require("./models/messageSchema");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const cors = require("cors");
const bcrypt = require("bcrypt");
const path = require("path");
const { Server } = require("socket.io");
require("dotenv").config();
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY;
const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET;
const frontendUrl = process.env.FRONTEND_URL;
const PORT = process.env.PORT;

const server = http.createServer(app);

app.use(cors());
const socket = new Server(server, {
  cors: {
    origin: frontendUrl,
    methods: ["GET", "POST"],
  },
});

connect.mongoDB();

app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));
// app.use(morgan('dev'));
cloudinary.config({
  cloud_name: cloudName,
  api_key: cloudinaryApiKey,
  api_secret: cloudinaryApiSecret,
});
// Configure Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// -------------------------Deployment----------------------------

const __dirname1 = path.resolve();
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "/public")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "public", "404.html"));
  });

} else {
  app.get("/", (req, res) => {
    res.send("Running on Development");
  });
}

// -------------------------Deployment----------------------------

const connectedUsers = []; // Assuming this is defined somewhere in your code

socket.on("connection", (socket) => {
  socket.on("userConnected", async (userId) => {
    socket.join(userId);
    if (!connectedUsers.includes(userId)) connectedUsers.push(userId);

    socket.broadcast.emit("connectedUsers", connectedUsers);

    socket.emit("connectedUsers", connectedUsers);
  });

  socket.on("joinRoom", (room) => {
    socket.join(room);
  });

  socket.on("newMessage", async (newMessage) => {
    // Your existing logic for new messages
    const chat = await Chats.findById(newMessage.chat);

    chat.users.forEach((user) => {
      if (user.toString() === newMessage.sender.toString()) return;

      socket.in(user.toString()).emit("newMessageReceived", newMessage);
    });
  });

  socket.on("typing", async ({ userId, chatId }) => {
    const chat = await Chats.findById(chatId);
    const typingUser = await Users.findById(userId);

    chat.users.forEach((user) => {
      if (user.toString() === userId) return;

      socket
        .in(user.toString())
        .emit("typing", { typingUser: typingUser, chatId: chatId });
    });
  });

  socket.on("stoppedTyping", async ({ userId, chatId }) => {
    const chat = await Chats.findById(chatId);
    const typingUser = await Users.findById(userId);

    chat.users.forEach((user) => {
      if (user.toString() === userId) return;

      socket
        .in(user.toString())
        .emit("stoppedTyping", { typingUser: typingUser, chatId: chatId });
    });
  });

  socket.on("disconnect", () => {
    // Remove the disconnected user from the connectedUsers array
    const disconnectedUserId = getUserIdFromSocket(socket);
    const index = connectedUsers.indexOf(disconnectedUserId);

    if (index !== -1) {
      connectedUsers.splice(index, 1);
      socket.broadcast.emit("connectedUsers", connectedUsers);
    }
  });
});

const getUserIdFromSocket = (socket) => {
  return socket.data.userId;
};

app.post(`/addUser`, upload.single("photo"), async (req, res) => {
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

app.post(`/login`, async (req, res) => {
  const { email, pass } = req.body;

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

app.post(`/createChat`, async (req, res) => {
  const { user1, user2 } = req.body;

  try {
    const chat = await Chats.findOne({
      users: {
        $size: 2,
        $all: [user1, user2],
      },
    });

    if (chat) {
      const [chatUser, latestMessage] = await Promise.all([
        Users.findById(user2),
        chat.latestMessage ? Messages.findById(chat.latestMessage) : null,
      ]);

      // Convert chat document to a plain JavaScript object
      const chatObject = chat.toObject();

      // Add additional fields to the chat object
      chatObject.chatUsers = [chatUser];
      chatObject.latestMessage = latestMessage;

      return res.status(200).json(chatObject);
    }

    const newChat = new Chats({
      users: [user1, user2],
    });

    const savedNewChat = await newChat.save();

    const chatUser = await Users.findById(user2); // Fix: Remove Promise()

    // Convert chat document to a plain JavaScript object
    const chatObject = savedNewChat.toObject();

    // Add additional fields to the chat object
    chatObject.chatUsers = [chatUser]; // Fix: Use an array directly
    chatObject.latestMessage = null;

    res.status(200).json(chatObject);
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post(`/createGroupChat`, async (req, res) => {
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

app.post(`/sendMessage`, async (req, res) => {
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

app.post(`/chats/:userId`, async (req, res) => {
  const userId = req.params.userId;
  try {
    const chats = await Chats.find({ users: { $in: [userId] } });

    const updatedChats = await Promise.all(
      chats.map(async (chat) => {
        let chatUsers = [];
        chat.users.forEach(async (user) => {
          if (user.toString() === userId) return;
          const chatUser = await Users.findById(user).select(
            "-password -blocklist -reports"
          );

          chatUsers.push(chatUser);
        });
        const latestMessage = chat.latestMessage
          ? await Messages.findById(chat.latestMessage)
          : null;

        // Create a new object with the additional chatUser property
        return {
          ...chat.toObject(), // Convert Mongoose document to plain object
          chatUsers,
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

app.post(`/chat/:chatId`, async (req, res) => {
  const chatId = req.params.chatId; // Use `params` to get chatId from URL
  const userId = req.headers.authorization;

  try {
    const chat = await Chats.findById(chatId); // Correct the model name to Chats

    const chatUsers = [];

    // Use a for...of loop to properly handle asynchronous operations
    for (const user of chat.users) {
      if (user.toString() === userId) continue;

      const chatUser = await Users.findById(user);

      if (chatUser) chatUsers.push(chatUser);
    }

    const latestMessage = await Messages.findById(chat.latestMessage);

    // Convert chat document to a plain JavaScript object
    const chatObj = chat.toObject();

    res.status(200).json({ ...chatObj, chatUsers, latestMessage });
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post(`/messages/:chatId`, async (req, res) => {
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

app.post(`/searchUser/:query`, async (req, res) => {
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

app.listen(PORT, () => {
  console.log("Server connected to port: ", PORT);
});
