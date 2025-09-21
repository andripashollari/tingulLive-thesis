import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";
import axios from "axios";
import { io } from "socket.io-client";
import { useRoomStore } from "./useRoomStore";

const BASE_URL = import.meta.env.MODE === "developemnt" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
    authUser:null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers: [],
    socket: null,
    spotifyToken: null,
    isConnectingSpotify: false,

    checkAuth: async () => {
        try{
            const res = await axiosInstance.get("/auth/check");
            set({ authUser: res.data});

            get().connectSocket();
        } catch (error) {
            console.log("Error in checkAuth: ", error)
            set ({ authUser: null });
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    signup: async (data) => {
        set({ isSigningUp: true});
        try {
            const res = await axiosInstance.post("/auth/signup", data);
            toast.success("Account created successfully!");
            set({ authUser: res.data });

            get().connectSocket();
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isSigningUp: false });
        }
    },
    
    login: async (data) => {
    set({ isLoggingIn: true });
    try {
        const res = await axiosInstance.post("/auth/login", data);
        console.log("Login response:", res.data); // Debug log
        set({ authUser: res.data });
        toast.success("Logged in successfully!");
        useRoomStore.getState().initStreamClient(res.data);
        // 1️⃣ Connect to socket
        get().connectSocket();

    } catch (error) {
        toast.error(error.response?.data?.message || "Login failed");
    } finally {
        set({ isLoggingIn: false });
    }
    },

    logout: async() => {
        try {
            await axiosInstance.post("/auth/logout");
            set({ authUser: null });
            toast.success("Logged out successfully");
            
            get().disconnectSocket();

        } catch (error) {
            toast.error("Something went wrong ", error.response.data.message);
        }
    },

    updateProfile: async(data) => {
        set({ isUpdatingProfile: true });
        try {
            const res = await axiosInstance.put("/auth/update-profile", data);
            set({ authUser: res.data });
            toast.success("Profile updated successfully");
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isUpdatingProfile: false });
        }
    },

    connectSocket: () => {
        const { authUser } = get();
        if(!authUser || get().socket?.connected) return;

        const socket = io(BASE_URL, {
            query: {
                userId: authUser._id,
            },
        });
        socket.connect();
        set({socket:socket});

        socket.on("getOnlineUsers", (userIds) => {
            set({ onlineUsers: userIds});
        });
    },

    disconnectSocket: () => {
        if(get().socket?.connected) get().socket.disconnect();
    },

    connectSpotify: async () => {
    set({ isConnectingSpotify: true });
    try {
      // redirect user to Spotify login
      window.location.href = `${BASE_URL}/api/spotify/login`;
    } catch (error) {
      toast.error("Failed to connect to Spotify");
      set({ isConnectingSpotify: false });
    }},

    handleSpotifyCallback: async (code) => {
        try {
        const res = await axiosInstance.get(`/spotify/callback?code=${code}`);
        set({ spotifyToken: res.data.access_token });
        toast.success("Spotify connected!");
        } catch (error) {
        toast.error("Spotify connection failed");
        } finally {
        set({ isConnectingSpotify: false });
        }
    },

    disconnectSpotify: async () => {
        try {
        set({ spotifyToken: null });
        toast.success("Spotify disconnected");
        } catch (error) {
        toast.error("Failed to disconnect Spotify");
        }
    },
}));