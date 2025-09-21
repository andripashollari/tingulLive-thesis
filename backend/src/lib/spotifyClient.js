// lib/spotifyClient.js
import SpotifyWebApi from "spotify-web-api-node";
import User from "../models/user.model.js";
import dotenv from "dotenv";

dotenv.config();

export const getSpotifyClientForUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user || !user.spotify?.refreshToken) {
    throw new Error("User has not connected Spotify");
  }

  const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.SPOTIFY_REDIRECT_URI,
  });

  // Always set refresh token
  spotifyApi.setAccessToken(user.spotify.accessToken);
  spotifyApi.setRefreshToken(user.spotify.refreshToken);

  let accessToken = user.spotify.accessToken;
  let expiresAt = user.spotify.expiresAt;

  // 🔄 Check if expired
  if (!accessToken || !expiresAt || expiresAt < new Date()) {
    console.log("Access token expired → refreshing...");

    const data = await spotifyApi.refreshAccessToken();
    accessToken = data.body["access_token"];
    const expiresIn = data.body["expires_in"];

    // Save new token + expiry in DB
    user.spotify.accessToken = accessToken;
    user.spotify.expiresAt = new Date(Date.now() + expiresIn * 1000);
    await user.save();
  }

  // Set latest access token
  spotifyApi.setAccessToken(accessToken);

  return spotifyApi;
};
