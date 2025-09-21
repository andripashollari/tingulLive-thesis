// pages/RoomPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { StreamVideo, Call } from "@stream-io/video-react-sdk";
import { useAuthStore } from "../store/useAuthStore";
import { useRoomStore } from "../store/useRoomStore";
import CryptoJS from "crypto-js";
import { axiosInstance } from "../lib/axios";

const RoomPage = () => {
  const { authUser } = useAuthStore();
  const { client, call, initStreamClient, setCall } = useRoomStore();
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [newRoom, setNewRoom] = useState({ name: "", description: "" });

  // Initialize Stream client if not ready
  useEffect(() => {
    if (!client && authUser) {
      initStreamClient(authUser);
    }
  }, [authUser, client, initStreamClient]);

  const hashRoomName = (roomName) => {
    const hash = CryptoJS.SHA256(roomName).toString(CryptoJS.enc.Base64);
    return hash.replace(/[^a-zA-Z0-9_-]/g, "");
  };

  // Fetch ongoing calls
  const fetchRooms = async () => {
    if (!client) return;

    try {
      const response = await client.queryCalls({
        filter_conditions: { ongoing: true },
        limit: 25,
        watch: true,
      });

      const roomData = await Promise.all(
        response.calls.map(async (c) => {
          const callInfo = await c.get();
          return {
            id: callInfo.call.id,
            title: callInfo.call.custom?.title || "Untitled Room",
            description: callInfo.call.custom?.description || "",
            participantsLength: callInfo.members.length || 0,
            createdBy: callInfo.call.created_by.name || "Unknown",
          };
        })
      );

      setRooms(roomData);
    } catch (err) {
      console.error("Failed to fetch rooms:", err);
    }
  };

  useEffect(() => {
    if (client) fetchRooms();
  }, [client]);

  // Create a new room
  const handleCreateRoom = async () => {
    if (!client || !newRoom.name || !newRoom.description) return;
    const response = await axiosInstance.post("/room/create", {
            name: newRoom.name,         // matches backend
            description: newRoom.description,
            owner: authUser._id,
            coverImage: "",         // optional
            isOpen: true,           // optional
    });
    
    const roomID = response.data._id;
    const callInstance = client.call("audio_room", roomID);

    await callInstance.join({
      create: true,
      data: {
        // members: [],
        custom: {
          title: newRoom.name,
          description: newRoom.description,
        },
      },
    });

    setCall(callInstance);
    navigate(`/room/${roomID}`);
  };

  // Join an existing room
  const handleJoinRoom = async (roomID) => {
    if (!client) return;

    const callInstance = client.call("audio_room", roomID);
    await callInstance.join({ create: false });
    setCall(callInstance);
    navigate(`/room/${roomID}`);
  };

  if (!client) {
    return <div>Initializing video client...</div>;
  }

  return (
    <>
    <div className="h-16" />
    <StreamVideo client={client}>
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Dhoma të krijuara</h1>

        {authUser && (
          <div className="mb-8 p-4 bg-base-200 rounded shadow-md">
            <h2 className="text-xl font-semibold mb-2">Krijo një dhomë</h2>
            <input
              type="text"
              placeholder="Emri i dhomës"
              value={newRoom.name}
              onChange={(e) =>
                setNewRoom((prev) => ({ ...prev, name: e.target.value }))
              }
              className="input input-bordered w-full mb-2"
            />
            <input
              type="text"
              placeholder="Përshkrimi i dhomës"
              value={newRoom.description}
              onChange={(e) =>
                setNewRoom((prev) => ({ ...prev, description: e.target.value }))
              }
              className="input input-bordered w-full mb-2"
            />
            <button
              onClick={handleCreateRoom}
              className="btn btn-primary mt-2 w-full"
            >
              Krijo Dhomën
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {rooms.length === 0 &&
            [...Array(4)].map((_, i) => (
              <div
                key={i}
                className="card bg-base-200 shadow-md p-4 animate-pulse"
              >
                <h4 className="text-lg font-bold mb-1">Prit...</h4>
                <p className="text-gray-400">------</p>
              </div>
            ))}

          {rooms.map((room) => (
            <div
              key={room.id}
              className="card bg-base-100 shadow-md p-4 hover:cursor-pointer hover:bg-base-200 transition"
              onClick={() => handleJoinRoom(room.id)}
            >
              <h4 className="text-lg font-bold mb-1">{room.title}</h4>
              <p className="text-gray-500 mb-1">{room.description}</p>
              <p className="text-sm text-gray-400 mb-1">
                {room.participantsLength} përdorues
              </p>
              <p className="text-sm text-gray-400">Krijuar nga {room.createdBy}</p>
            </div>
          ))}
        </div>
      </div>
    </StreamVideo>
    </>
  );
};

export default RoomPage;
