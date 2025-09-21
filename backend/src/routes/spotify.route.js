import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { spotifyLogin, spotifyCallback, playTrack, getCurrentPlayback, searchTracks, getSpotifyToken, refreshSpotifyToken, pauseTrack } from "../controllers/spotify.controller.js";

const router = express.Router();

router.get("/login", protectRoute, spotifyLogin);
router.get("/callback", protectRoute, spotifyCallback);

router.post("/play", protectRoute, playTrack);
router.post("/pause", protectRoute, pauseTrack);

router.get("/me/player", protectRoute, getCurrentPlayback);
router.get("/search", protectRoute, searchTracks);

router.get("/token", protectRoute, getSpotifyToken);
router.get("/refresh", protectRoute, refreshSpotifyToken);

export default router;
