import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isOpen: { type: Boolean, default: false },
    description: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    nowPlaying: {
      trackUri: { type: String },
      trackName: { type: String }, 
      artistName: { type: String },
      startedAt: { type: Date },
    },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

  },
  { timestamps: true }
);

const Room = mongoose.model("Room", roomSchema);
export default Room;
