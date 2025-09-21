import { create } from "zustand";
import { toast } from "react-hot-toast";
import { StreamVideoClient } from "@stream-io/video-react-sdk";
import { useAuthStore } from "./useAuthStore";
import { axiosInstance } from "../lib/axios";

export const useRoomStore = create((set, get) => ({
  rooms: [],
  currentRoom: null,
  call: undefined,
  client: undefined,
  streamUser: null,
  isStreamLoading: false,
  members: [],

  setCall: (call) => set({ call }),

  // Initialize Stream client
  initStreamClient: async (user) => {
    console.log("initStreamClient called!"); // <- Add this
  try {

    const token = user?.serverToken;
    const username = user?.username;
    const name = user?.fullName;

    if (!token || !username || !name) {
      set({ isStreamLoading: false });
      return;
    }
    const myUser = { id: username, name: name };
    const myClient = new StreamVideoClient({
      apiKey: import.meta.env.VITE_STREAM_API_KEY,
      user: myUser,
      token,
    });

    console.log("Stream client created:", myClient);

    set({
      streamUser: myUser,
      client: myClient,
      isStreamLoading: false,
    });
  } catch (err) {
    console.error("Stream init error:", err);
    toast.error("Failed to initialize video client");
    set({ isStreamLoading: false });
  }
},

  createRoom: async (roomName, description, slug) => {
  try {
    console.log("Creating room with name:", roomName); 
    const response = await axiosInstance.post("/room/create", {
        name: roomName.name,        
        description: roomName.description,
        slug: roomName.slug,
        coverImage: "",   
        isOpen: true,  
    });

    console.log("Room created:", response.data); 

    const newRoom = response.data;    
    const roomID = newRoom._id; 

    set({ currentRoom: { 
        id: roomID, 
        title: newRoom.name, 
        description: newRoom.description,
        host: useAuthStore.getState().authUser.username || 'Unknown',
    }});

    return roomID; 
    } catch (err) {
    console.error(err);
    toast.error("Failed to create room");
    }
  },

  joinRoom: async (roomID, username) => {
  try {
    const { client, initStreamClient } = get();
    if (!client) await initStreamClient(useAuthStore.getState().authUser);

    const callInstance = client.call("audio_room", roomID);
    await callInstance.join({ create: false });

    const callInfo = await callInstance.get();

    set({
      call: callInstance,
      currentRoom: {
        id: roomID,
        title: callInfo.call.custom?.title || "Untitled Room",
        description: callInfo.call.custom?.description || "",
        host: callInfo.call.created_by?.id || "Unknown",
      },
    });
    console.log("Joined call successfully!");
  } catch (err) {
    console.error("Failed to join call", err);
    toast.error("Failed to join room: " + err.message);
  }
},
  
  getRooms: async () => {
    try {
      const { client } = get();
      if (!client) return;

      const callsQueryResponse = await client.queryCalls({
        filter_conditions: { ongoing: true },
        limit: 25,
        watch: true,
      });

      const rooms = await Promise.all(
        callsQueryResponse.calls.map(async (call) => {
          const callInfo = await call.get();
          return {
            id: callInfo.call.id,
            title: callInfo.call.custom?.title || "",
            description: callInfo.call.custom?.description || "",
            participantsLength: callInfo.members.length || 0,
            createdBy: callInfo.call.created_by.name || "",
          };
        })
      );

      set({ rooms });
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch rooms");
    }
  },

  leaveRoom: async (roomID) => {
    try {
      const { call } = get();
      if (call) await call.leave();

      await axiosInstance.post(`/room/leave/${roomID}`);
      set({ currentRoom: null, call: undefined, members: [] });
      toast.success("Left room");

      const socket = useAuthStore.getState().socket;
      if (socket) socket.emit("leaveRoom", roomID);
      get().pauseTrack(roomID); 
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || "Failed to leave room");
    }
  },

  getRoomMembers: async (id) => {
    try {
      const res = await axiosInstance.get(`/room/${id}/members`);
      set({ members: res.data });
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to fetch members");
    }
  },

  subscribeToRoom: (roomId) => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.emit("joinRoom", roomId);

    socket.on("roomUpdated", (room) => {
      set({ currentRoom: room });
    });

    socket.on("membersUpdated", (members) => {
      set({ members });
    });

    socket.on("playbackUpdated", (playback) => {
      set((state) => ({
        currentRoom: { ...state.currentRoom, nowPlaying: playback },
      }));
    });
  },

  unsubscribeFromRoom: (roomId) => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.emit("leaveRoom", roomId);
    socket.off("roomUpdated");
    socket.off("membersUpdated");
    socket.off("playbackUpdated");
  },
}));