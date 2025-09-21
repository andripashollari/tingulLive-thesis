import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createRoom,
  joinRoom,
  getRooms,
  getRoomById,
  updateNowPlaying,
  leaveRoom,
  getRoomMembers,
} from "../controllers/room.controller.js";

const router = express.Router();

router.post("/create", protectRoute, createRoom);

router.post("/join/:id", protectRoute, joinRoom);

router.post("/leave/:id", protectRoute, leaveRoom);

router.get("/", protectRoute, getRooms);

router.get("/:id", protectRoute, getRoomById);

router.get("/:id/members", protectRoute, getRoomMembers);

router.put("/:id/now-playing", protectRoute, updateNowPlaying);

export default router;
