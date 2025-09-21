import express from "express";
import { protectRoute , isAdmin } from "../middleware/auth.middleware.js";
import {
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllRooms,
  deleteRoom,
  getPlatformStats,
} from "../controllers/admin.controller.js";

const router = express.Router();

router.use(protectRoute, isAdmin);

router.get("/users", getAllUsers);
router.patch("/users/:id/role", updateUserRole); 
router.delete("/users/:id", deleteUser); 

router.get("/rooms", getAllRooms); 
router.delete("/rooms/:id", deleteRoom); 

router.get("/stats", getPlatformStats); 

export default router;