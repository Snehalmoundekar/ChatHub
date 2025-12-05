const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const User = require("./models/User");


dotenv.config();

const app = express();
const server = http.createServer(app); // ✅ create HTTP server
const io = new Server(server, {
  cors: {
    origin: "https://snehalmoundekar.github.io/ChatHub", // frontend URL
    methods: ["GET", "POST"],
  },
});

app.use(express.json());
app.use(cors());
app.set("io", io);


// ✅ Serve uploaded images statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));




// ✅ Connect MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// ✅ Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));

// ✅ Socket.IO Logic
const Message = require("./models/Message"); // ✅ import your Message model

io.on("connection", (socket) => {
  // console.log("User connected:", socket.id);

  // 🔵 User comes online
  socket.on("userOnline", async (userId) => {
    socket.userId = userId;
    socket.join(userId);

    // Update DB
    await User.findByIdAndUpdate(userId, { isOnline: true });


    // Notify all clients
    io.emit("updateUserStatus", { userId, isOnline: true });
    // -------- NEW CODE TO FIX DOUBLE TICK --------
    const undelivered = await Message.find({
      receiver: userId,
      delivered: false
    });

    if (undelivered.length > 0) {
      await Message.updateMany(
        { receiver: userId, delivered: false },
        { $set: { delivered: true } }
      );

      undelivered.forEach(msg => {
        io.to(msg.sender).emit("messageDelivered", {
          ...msg.toObject(),
          delivered: true
        });
      });
    }

    //console.log("User online:", userId);
  });

  // ✅ Send Message
  socket.on("sendMessage", async ({ sender, receiver, text, image, video, doc, forwarded }) => {
    try {
      const newMessage = await Message.create({
        sender,
        receiver,
        text,
        image: image || "",
        video: video || "",
        doc: doc || "",
        forwarded: forwarded || false,
        delivered: false,
        seen: false,
      });

      io.to(sender).emit("messageSent", newMessage);

      const receiverSockets = Array.from(io.sockets.sockets.values()).filter(
        (s) => s.userId === receiver
      );

      if (receiverSockets.length > 0) {
        io.to(receiver).emit("receiveMessage", newMessage);

        await Message.findByIdAndUpdate(newMessage._id, { delivered: true });
        newMessage.delivered = true;
        io.to(sender).emit("messageDelivered", newMessage);
      }
      else {
        // Receiver offline — don't mark delivered yet
        // console.log(`Receiver ${receiverId} is offline, message not delivered.`);
      }
    } catch (err) {
      console.error("Error saving message:", err);
    }
  });


  // ✅ Mark messages as seen
  socket.on("markAsSeen", async ({ sender, receiver }) => {
    await Message.updateMany(
      { sender: receiver, receiver: sender, seen: false },
      { $set: { seen: true } }
    );

    io.to(receiver).emit("messageSeen", { sender, receiver });
  });



  socket.on("disconnect", async () => {
    if (socket.userId) {
      await User.findByIdAndUpdate(socket.userId, { isOnline: false });

      io.emit("updateUserStatus", {
        userId: socket.userId,
        isOnline: false
      });

      //console.log("User offline:", socket.userId);
    }
  });

});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
