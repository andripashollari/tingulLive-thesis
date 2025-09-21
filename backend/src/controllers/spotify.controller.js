import SpotifyWebApi from "spotify-web-api-node";
import Room from "../models/room.model.js";
import User from "../models/user.model.js";
import dotenv from "dotenv";
import { getSpotifyClientForUser } from "../lib/spotifyClient.js";
import { app, io } from "../lib/socket.js";

dotenv.config();

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI,
});

const setAccessToken = (token) => {
  spotifyApi.setAccessToken(token);
};

export const spotifyLogin = (req, res) => {
  const scopes = [
    "user-read-email",
    "user-read-private",
    "streaming",
    "user-modify-playback-state",
    "user-read-playback-state",
    "user-read-currently-playing",
  ];
  const state = req.user._id;
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);
  res.redirect(authorizeURL);
};

export const spotifyCallback = async (req, res) => {

    const error = req.query.error;
    const code = req.query.code;

    if (error) {
        console.error('Callback Error:', error);
        res.send(`Callback Error: ${error}`);
        return;
    }

    try {
    const data = await spotifyApi.authorizationCodeGrant(code);

    const accessToken = data.body["access_token"];
    const refreshToken = data.body["refresh_token"];
    const expiresIn = data.body["expires_in"];

    spotifyApi.setAccessToken(accessToken);
    spotifyApi.setRefreshToken(refreshToken);

    // save in cookies
    res.cookie("spotifyAccessToken", accessToken, {
      httpOnly: true,   // JS can't read cookie
      secure: false,    // true in production (HTTPS)
      maxAge: expiresIn * 1000, // ms
    });

    res.cookie("spotifyRefreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    //update user in DB
    await User.findByIdAndUpdate(req.user._id, {
      spotify: {
        accessToken,
        refreshToken,
        expiresAt: new Date(Date.now() + expiresIn * 1000),
      },
    });

    console.log("Spotify tokens saved in cookies");

    // redirect to frontend profile
    res.redirect("http://localhost:5173/profile?spotify=success");
  } catch (err) {
    console.error("Error getting Tokens:", err);
    res.status(500).send("Error getting tokens");
  }
};

// --- Search tracks
export const searchTracks = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    const spotifyApi = await getSpotifyClientForUser(req.user._id);
    const searchData = await spotifyApi.searchTracks(q, { limit: 5 });

    const tracks = searchData.body.tracks.items.map(track => ({
      id: track.id,
      name: track.name,
      artist: track.artists.map(a => a.name).join(", "),
      album: track.album.name,
      image: track.album.images[0]?.url,
      uri: track.uri,
    }));

    res.json(tracks);
  } catch (err) {
    console.error("Search Error:", err);
    res.status(500).json({ error: "Failed to search tracks" });
  }
};
// --- Play track
export const playTrack = async (req, res) => {
  try {
    const { uri, deviceId, roomId } = req.body;
    if (!uri) return res.status(400).json({ error: "Track URI required" });
    if (!deviceId) return res.status(400).json({ error: "Device ID required" });



    const spotifyApi = await getSpotifyClientForUser(req.user._id, req.cookies.spotifyAccessToken, req.cookies.spotifyRefreshToken);

    await spotifyApi.play({
      device_id: deviceId,     // ✅ target Web Playback SDK
      uris: [uri],
    });
    if (roomId) {
      io.to(roomId).emit("spotify:hostPlayback", {
        uri,
        isPaused: false,
      });
    }

    res.json({ message: "Playback started" });
  } catch (err) {
    console.error("Play Error:", err.body || err);
    res.status(500).json({ error: "Failed to start playback" });
  }
};

export const pauseTrack = async (req, res) => {
  try {
    const { deviceId, roomId } = req.body;
    if (!deviceId) return res.status(400).json({ error: "Device ID required" });

    const spotifyApi = await getSpotifyClientForUser(req.user._id, req.cookies.spotifyAccessToken, req.cookies.spotifyRefreshToken);

    await spotifyApi.pause({ device_id: deviceId });
    if (roomId) {
      io.to(roomId).emit("spotify:hostPlayback", {
        uri: null, // null means nothing is playing
        isPaused: true,
      });
    }

    res.json({ message: "Playback paused" });
  } catch (err) {
    console.error("Pause Error:", err.body || err);
    res.status(500).json({ error: "Failed to pause playback" });
  }
};

// --- Current playback state
export const getCurrentPlayback = async (req, res) => {
  try {
    const { roomId } = req.query;
    const spotifyApi = await getSpotifyClientForUser(req.user._id, req.cookies.spotifyAccessToken, req.cookies.spotifyRefreshToken);
    const playback = await spotifyApi.getMyCurrentPlaybackState();

    if (roomId) {
      io.to(roomId).emit("room:sync", playback.body);
    }

    res.status(200).json(playback.body);
  } catch (error) {
    console.error("Error getting playback state:", error);
    res.status(500).json({ error: "Failed to get playback state" });
  }
};



export const getSpotifyToken = (req, res) => {
  const accessToken = req.cookies.spotifyAccessToken;
  const refreshToken = req.cookies.spotifyRefreshToken;
  if(refreshToken){
    if (!accessToken) {
      return res.status(401).json({ error: "No access token available" });
    }
  }

  res.json({ accessToken });
};

export const refreshSpotifyToken = async (req, res) => {
  const refreshToken = req.cookies.spotifyRefreshToken;
  if (!refreshToken) {
    return res.status(401).json({ error: "No refresh token available" });
  }

  try {
    spotifyApi.setRefreshToken(refreshToken);
    const data = await spotifyApi.refreshAccessToken();

    const accessToken = data.body["access_token"];
    const expiresIn = data.body["expires_in"];

    // overwrite cookie
    res.cookie("spotifyAccessToken", accessToken, {
      httpOnly: false, // frontend needs it
      secure: false,
      maxAge: expiresIn * 1000,
    });

    console.log("Spotify access token refreshed");
    res.json({ accessToken });
  } catch (err) {
    console.error("Error refreshing token:", err);
    res.status(500).json({ error: "Failed to refresh token" });
  }
};