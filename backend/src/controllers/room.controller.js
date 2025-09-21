import Room from "../models/room.model.js";
import { client } from "../lib/streamClient.js";
import slugify from "slugify";
import { io } from "../lib/socket.js";

export const createRoom = async (req, res) => {
  try {
    const { name, description, coverImage, isOpen } = req.body;

    const room = new Room({
      name,
      description,
      coverImage,
      isOpen,
      owner: req.user._id,
      members: [req.user._id],
    });

    await room.save();

    res.status(201).json(room);
  } catch (err) {
    console.error("Create Room Error:", err);
    res.status(400).json({ error: "Failed to create room" });
  }
};


export const joinRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await Room.findById(id);
    if (!room) return res.status(404).json({ error: "Room not found" });

    if (!room.members.includes(req.user._id)) {
      room.members.push(req.user._id);
      await room.save();
    }

    const channel = serverClient.channel("messaging", room.streamChannelId);
    await channel.addMembers([req.user._id.toString()]);

    res.status(200).json({ message: "Joined room", room });
  } catch (error) {
    console.error("Error joining room:", error);
    res.status(500).json({ error: "Failed to join room" });
  }
};

export const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find().populate("owner", "fullName username profilePic");
    res.status(200).json(rooms);
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).json({ error: "Failed to fetch rooms" });
  }
};

export const getRoomById = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await Room.findById(id).populate("owner", "fullName username profilePic");
    if (!room) return res.status(404).json({ error: "Room not found" });
    res.status(200).json(room);
  } catch (error) {
    console.error("Error fetching room:", error);
    res.status(500).json({ error: "Failed to fetch room" });
  }
};

export const updateNowPlaying = async (req, res) => {
  try {
    const { id } = req.params; // room id
    const { trackUri, trackName, artistName, position = 0, action = "play" } = req.body;

    if (!trackUri) return res.status(400).json({ error: "trackUri is required" });

    const room = await Room.findById(id);
    if (!room) return res.status(404).json({ error: "Room not found" });

    if (room.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: "Only room owner can control playback" });
    }

    room.nowPlaying = {
      trackUri,
      trackName: trackName || "",
      artistName: artistName || "",
      startedAt: new Date(),
    };
    await room.save();

    const channel = serverClient.channel("messaging", room.streamChannelId);
    const playbackAttachment = {
      type: "playback",
      title: trackName,
      artist: artistName,
      uri: trackUri,
      position,
      action, 
      startedAt: room.nowPlaying.startedAt,
      initiatedBy: req.user._id.toString(),
    };

    await channel.sendMessage({
      text: `${req.user.fullName} ${action === "play" ? "started" : action} ${trackName}`,
      user_id: req.user._id.toString(),
      attachments: [playbackAttachment],
    });

    io.to(room._id.toString()).emit("playback:update", {
      trackUri,
      trackName,
      artistName,
      position,
      action,
      startedAt: room.nowPlaying.startedAt,
      initiatedBy: req.user._id.toString(),
    });

    res.status(200).json({ message: "Now playing updated", nowPlaying: room.nowPlaying });
  } catch (error) {
    console.error("Error updating nowPlaying:", error);
    res.status(500).json({ error: "Failed to update now playing" });
  }
};

export const leaveRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await Room.findById(id);
    if (!room) return res.status(404).json({ error: "Room not found" });

    // Remove user from MongoDB members
    room.members = room.members.filter(
      (member) => member.toString() !== req.user._id.toString()
    );
    await room.save();

    // Remove from Stream channel
    const channel = serverClient.channel("messaging", room.streamChannelId);
    await channel.removeMembers([req.user._id.toString()]);

    

    res.status(200).json({ message: "Left room successfully" });
  } catch (error) {
    console.error("Error leaving room:", error);
    res.status(500).json({ error: "Failed to leave room" });
  }
};

export const getRoomMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await Room.findById(id).populate(
      "members",
      "fullName username profilePic"
    );
    if (!room) return res.status(404).json({ error: "Room not found" });

    res.status(200).json(room.members);
  } catch (error) {
    console.error("Error fetching room members:", error);
    res.status(500).json({ error: "Failed to fetch room members" });
  }
};