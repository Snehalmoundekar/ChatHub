const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Message = require("../models/Message");
const multer = require("multer");
const path = require("path");

/* ---------------- Multer setup ---------------- */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

/* -------------------------------------------------------------
   ✅ Upload Image Message (Fix: senderId → sender, receiverId → receiver)
------------------------------------------------------------- */
// router.post("/upload-image", upload.single("image"), async (req, res) => {
//   try {
//     const { sender, receiver, text } = req.body;

//     if (!req.file && !text?.trim()) {
//       return res.status(400).json({ error: "Either text or image is required." });
//     }

//     const newMessage = await Message.create({
//       sender,
//       receiver,
//       text: text?.trim() || "",
//       image: req.file ? `/uploads/${req.file.filename}` : null,
//       delivered: false,
//       seen: false,
//     });

//     // ✅ Emit socket event here so receiver gets the message instantly
//     const receiverSockets = Array.from(
//       req.app.get("io").sockets.sockets.values()
//     ).filter((s) => s.userId === receiver);

//     if (receiverSockets.length > 0) {
//       req.app.get("io").to(receiver).emit("receiveMessage", newMessage);
//       await Message.findByIdAndUpdate(newMessage._id, { delivered: true });
//       newMessage.delivered = true;
//       req.app.get("io").to(sender).emit("messageDelivered", newMessage);
//     }

//     res.json(newMessage);
//   } catch (error) {
//     console.error("❌ Image upload error:", error);
//     res.status(500).json({ error: "Failed to upload message." });
//   }
// });

router.post("/upload-multiple-images", upload.array("images", 10), async (req, res) => {
  try {
    const { sender, receiver, text } = req.body;
    const files = req.files || [];

    if (files.length === 0 && !text?.trim()) {
      return res.status(400).json({ error: "Either images or text required." });
    }

    let savedMessages = [];

    // Save each image as separate message
    for (let i = 0; i < files.length; i++) {

      const file = files[i];

      const isLastImage = i === files.length - 1; // ✔️ last image check

      const msg = await Message.create({
        sender,
        receiver,
        text: isLastImage ? text?.trim() || "" : "",   // ✔️ only last image gets text
        image: `/uploads/${file.filename}`,
        delivered: false,
        seen: false,
      });

      savedMessages.push(msg);
    }

    // SOCKET EMIT
    const io = req.app.get("io");
    const receiverSockets = Array.from(io.sockets.sockets.values())
      .filter((s) => s.userId === receiver);

    if (receiverSockets.length > 0) {
      for (let msg of savedMessages) {
        io.to(receiver).emit("receiveMessage", msg);
        await Message.findByIdAndUpdate(msg._id, { delivered: true });
        msg.delivered = true;
        io.to(sender).emit("messageDelivered", msg);
      }
    }

    res.json(savedMessages);

  } catch (err) {
    console.error("Multiple image upload error", err);
    res.status(500).json({ error: "Failed to upload images." });
  }
});


/* -------------------------------------------------------------
   ✅ Get all users (excluding current user) + last message + profile image
------------------------------------------------------------- */
router.get("/users/:currentUserId", async (req, res) => {
  try {
    const { currentUserId } = req.params;

    const users = await User.find(
      { _id: { $ne: currentUserId } },
      "username email profileImage fullName isOnline"
    );

    const usersWithLastMessage = await Promise.all(
      users.map(async (user) => {

        /* 
        -------------------------------------------------
        1️⃣ Last VISIBLE message (after Clear Chat, this 
            becomes null for text)
        -------------------------------------------------
        */
        const lastVisibleMsg = await Message.findOne({
          $or: [
            { sender: currentUserId, receiver: user._id },
            { sender: user._id, receiver: currentUserId },
          ],
          deletedFor: { $ne: currentUserId }
        })
          .sort({ createdAt: -1 })
          .lean();

        /* 
        -------------------------------------------------
        2️⃣ Last ANY message (even if deleted)  
            → timestamp will always come from THIS  
        -------------------------------------------------
        */
        const lastAnyMsg = await Message.findOne({
          $or: [
            { sender: currentUserId, receiver: user._id },
            { sender: user._id, receiver: currentUserId },
          ]
        })
          .sort({ createdAt: -1 })
          .lean();

        const unreadCount = await Message.countDocuments({
          sender: user._id,
          receiver: currentUserId,
          seen: false,
          deletedFor: { $ne: currentUserId }
        });

        return {
          ...user.toObject(),

          // 3️⃣ Show text only if message is visible
          lastMessage: lastVisibleMsg
            ? lastVisibleMsg.text
              ? lastVisibleMsg.text
              : lastVisibleMsg.image
                ? "Image"
                : lastVisibleMsg.video
                  ? "Video"
                  : lastVisibleMsg.doc
                    ? "Document"
                    : ""
            : "",


          // 4️⃣ Timestamp ALWAYS comes from lastAnyMsg
          lastMessageTime: lastAnyMsg ? lastAnyMsg.createdAt : null,

          unreadCount,
        };
      })
    );

    // Sort by timestamp
    usersWithLastMessage.sort(
      (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
    );

    res.json(usersWithLastMessage);

  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: err.message });
  }
});


/* -------------------------------------------------------------
   ✅ Get chat messages between two users (Fix param names)
------------------------------------------------------------- */
router.get("/:sender/:receiver", async (req, res) => {
  try {
    const { sender, receiver } = req.params; // ✅ changed param names

    const messages = await Message.find({
      $or: [
        { sender, receiver },
        { sender: receiver, receiver: sender },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

/* -------------------------------------------------------------
   ✅ Clear chat messages 
------------------------------------------------------------- */
router.delete("/clear/:senderId/:receiverId", async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;

    // Instead of deleting messages, mark them deleted for this user
    await Message.updateMany(
      {
        $or: [
          { sender: senderId, receiver: receiverId },
          { sender: receiverId, receiver: senderId },
        ],
      },
      { $addToSet: { deletedFor: senderId } } // 👈 add senderId to deletedFor array
    );

    res.status(200).json({ message: "Chat cleared for this user only" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to clear chat" });
  }
});

/* -------------------------------------------------------------
   ✅ Upload video Message 
------------------------------------------------------------- */
router.post("/upload-video", upload.single("video"), async (req, res) => {
  try {
    const { sender, receiver, text } = req.body;

    if (!req.file && !text?.trim()) {
      return res.status(400).json({ error: "Either text or video is required." });
    }

    const newMessage = await Message.create({
      sender,
      receiver,
      text: text?.trim() || "",
      video: req.file ? `/uploads/${req.file.filename}` : null,
      delivered: false,
      seen: false,
    });

    // ✅ Emit socket event here so receiver gets the message instantly
    const receiverSockets = Array.from(
      req.app.get("io").sockets.sockets.values()
    ).filter((s) => s.userId === receiver);

    if (receiverSockets.length > 0) {
      req.app.get("io").to(receiver).emit("receiveMessage", newMessage);
      await Message.findByIdAndUpdate(newMessage._id, { delivered: true });
      newMessage.delivered = true;
      req.app.get("io").to(sender).emit("messageDelivered", newMessage);
    }

    res.json(newMessage);
  } catch (error) {
    console.error("❌ video upload error:", error);
    res.status(500).json({ error: "Failed to upload message." });
  }
});

router.post("/upload-multiple-videos", upload.array("videos", 5), async (req, res) => {
  try {
    const { sender, receiver, text } = req.body;
    const files = req.files || [];

    if (files.length === 0 && !text?.trim()) {
      return res.status(400).json({ error: "Either video or text required." });
    }

    let savedMessages = [];

    // Save each image as separate message
    for (let i = 0; i < files.length; i++) {

      const file = files[i];

      const isLastVideo = i === files.length - 1; // ✔️ last video check

      const msg = await Message.create({
        sender,
        receiver,
        text: isLastVideo ? text?.trim() || "" : "",   // ✔️ only last video gets text
        video: `/uploads/${file.filename}`,
        delivered: false,
        seen: false,
      });

      savedMessages.push(msg);
    }

    // SOCKET EMIT
    const io = req.app.get("io");
    const receiverSockets = Array.from(io.sockets.sockets.values())
      .filter((s) => s.userId === receiver);

    if (receiverSockets.length > 0) {
      for (let msg of savedMessages) {
        io.to(receiver).emit("receiveMessage", msg);
        await Message.findByIdAndUpdate(msg._id, { delivered: true });
        msg.delivered = true;
        io.to(sender).emit("messageDelivered", msg);
      }
    }

    res.json(savedMessages);

  } catch (err) {
    console.error("Multiple videos upload error", err);
    res.status(500).json({ error: "Failed to upload images." });
  }
});



/* -------------------------------------------------------------
   ✅ Upload doc 
------------------------------------------------------------- */
router.post("/upload-doc", upload.single("doc"), async (req, res) => {
  try {
    const { sender, receiver, text } = req.body;

    if (!req.file && !text?.trim()) {
      return res.status(400).json({ error: "Either text or doc is required." });
    }

    const newMessage = await Message.create({
      sender,
      receiver,
      text: text?.trim() || "",
      doc: req.file ? `/uploads/${req.file.filename}` : null,
      delivered: false,
      seen: false,
    });

    // ✅ Emit socket event here so receiver gets the message instantly
    const receiverSockets = Array.from(
      req.app.get("io").sockets.sockets.values()
    ).filter((s) => s.userId === receiver);

    if (receiverSockets.length > 0) {
      req.app.get("io").to(receiver).emit("receiveMessage", newMessage);
      await Message.findByIdAndUpdate(newMessage._id, { delivered: true });
      newMessage.delivered = true;
      req.app.get("io").to(sender).emit("messageDelivered", newMessage);
    }

    res.json(newMessage);
  } catch (error) {
    console.error("❌ doc upload error:", error);
    res.status(500).json({ error: "Failed to upload message." });
  }
});

router.post("/send-location", async (req, res) => {
  try {
    const { sender, receiver, latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: "Location coordinates required." });
    }

    const googleUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

    const newMessage = await Message.create({
      sender,
      receiver,
      text: googleUrl,
      location: {
        lat: latitude,
        lng: longitude,
        url: googleUrl
      },
      delivered: false,
      seen: false
    });

    // Emit to receiver
    const receiverSockets = Array.from(
      req.app.get("io").sockets.sockets.values()
    ).filter((s) => s.userId === receiver);

    if (receiverSockets.length > 0) {
      req.app.get("io").to(receiver).emit("receiveMessage", newMessage);
      await Message.findByIdAndUpdate(newMessage._id, { delivered: true });
      newMessage.delivered = true;
      req.app.get("io")
        .to(sender)
        .emit("messageDelivered", newMessage);
    }

    res.json(newMessage);
  } catch (error) {
    console.error("❌ Location send error:", error);
    res.status(500).json({ error: "Failed to send location." });
  }
});

/* -------------------------------------------------------------
   ✅ Delete single message (Soft Delete)
------------------------------------------------------------- */
router.delete("/delete/:messageId/:userId", async (req, res) => {
  try {
    const { messageId, userId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Add userId to deletedFor array (soft delete)
    await Message.findByIdAndUpdate(messageId, {
      $addToSet: { deletedFor: userId }
    });

    // Notify the user that message was deleted (socket)
    req.app.get("io").to(userId).emit("messageDeleted", {
      messageId,
      userId,
    });

    res.json({ success: true, message: "Message deleted for this user." });

  } catch (error) {
    console.error("❌ Delete message error:", error);
    res.status(500).json({ error: "Failed to delete message." });
  }
});

router.delete("/delete-everyone/:messageId", async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ error: "Message not found" });

    const updated = await Message.findByIdAndUpdate(
      messageId,
      {
        text: "This message was deleted",
        image: null,
        video: null,
        doc: null,
        docName: null,
        fileUrl: null,
        fileSize: null,
        location: null,
        isDeletedForEveryone: true,
      },
      { new: true }
    );

    req.app.get("io")
      .to(message.sender.toString())
      .to(message.receiver.toString())
      .emit("messageDeletedForEveryone", {
        messageId,
        updatedMessage: updated,
      });

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete for everyone" });
  }
});





module.exports = router;
