import express from "express";
import User from "../models/user.model.js";

const router = express.Router();

router.get("/search", async (req, res) => {
    const { username } = req.query;

    if (!username) {
        return res.status(400).json({ message: "Username query is required" });
    }

    try {
        const users = await User.find({
            username: { $regex: username, $options: "i" } // case-insensitive search
        }).select("username fullName profilePic role"); // only return these fields

        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findById(id).select(
            "username fullName email profilePic role spotify createdAt updatedAt"
        );

        if (!user) return res.status(404).json({ message: "User not found" });

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});


export default router;