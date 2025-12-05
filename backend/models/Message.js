const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: false, trim: true },
    image: { type: String, required: false },
    video: { type: String, required: false },
    doc: { type: String, required: false },
    location: { lat: Number, lng: Number, url: String },
    forwarded: { type: Boolean, default: false },
    delivered: { type: Boolean, default: false },
    seen: { type: Boolean, default: false },
    deletedFor: { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
