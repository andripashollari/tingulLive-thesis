import express from "express";
import Follow from "../models/followers.model.js";
import User from "../models/user.model.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/:id/follow", protectRoute, async (req, res) => {
  try {
    const userToFollow = req.params.id;
    const currentUser = req.user._id;

    if (userToFollow === currentUser.toString()) {
      return res.status(400).json({ message: "Cannot follow yourself" });
    }

    const follow = new Follow({
      follower: currentUser,
      following: userToFollow,
    });

    await follow.save();
    res.json({ message: "Followed successfully" });
  } catch (err) {
    if (err.code === 11000) {
      // duplicate key error
      return res.status(400).json({ message: "Already following this user" });
    }
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/:id/unfollow", protectRoute, async (req, res) => {
  try {
    const userToUnfollow = req.params.id;
    const currentUser = req.user._id;

    const deleted = await Follow.findOneAndDelete({
      follower: currentUser,
      following: userToUnfollow,
    });

    if (!deleted) return res.status(400).json({ message: "Not following this user" });

    res.json({ message: "Unfollowed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id/followers", async (req, res) => {
  try {
    const followers = await Follow.find({ following: req.params.id })
      .populate("follower", "username email")
      .sort({ createdAt: -1 });

    res.json(followers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id/following", async (req, res) => {
  try {
    const following = await Follow.find({ follower: req.params.id })
      .populate("following", "username email")
      .sort({ createdAt: -1 });

    res.json(following);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
