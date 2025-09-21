// pages/RoomIdPage.jsx
import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  StreamVideo,
  StreamCall,
  StreamTheme,
  useCallStateHooks,
  useRequestPermission,
  OwnCapability,
  Avatar,
  SpeakerLayout,
} from "@stream-io/video-react-sdk";
import { useAuthStore } from "../store/useAuthStore";
import { useRoomStore } from "../store/useRoomStore";
import SpotifyPlayer from "../components/SpotifyPlayer";
import { axiosInstance } from "../lib/axios";

const RoomIdPage = () => {
  const { roomID } = useParams();
  const navigate = useNavigate();
  const { authUser } = useAuthStore();
  const { call, leaveRoom, joinRoom, currentRoom } = useRoomStore();

  const [permissionRequests, setPermissionRequests] = useState([]);

  useEffect(() => {
    if (!call && authUser?.username) {
      joinRoom(roomID, authUser.username);
    }
  }, [roomID, call, authUser, joinRoom]);

  const handleLeave = async () => {
    if (call) await leaveRoom(roomID);
    navigate("/rooms");
  };

  if (!call) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <span className="loading loading-spinner loading-lg"></span>
        <p className="mt-4">Duke u bashkuar...</p>
      </div>
    );
  }

  return (
    <>
    <div className="h-16"/>
    <StreamVideo client={call.client}>
      <StreamCall call={call}>
        <StreamTheme>
          <RoomUI
            call={call}
            authUser={authUser}
            handleLeave={handleLeave}
            permissionRequests={permissionRequests}
            setPermissionRequests={setPermissionRequests}
            currentRoom={currentRoom}
            roomID={roomID}
          />
        </StreamTheme>
      </StreamCall>
    </StreamVideo>
    </>
  );
};

const RoomUI = ({
  call,
  authUser,
  handleLeave,
  permissionRequests,
  setPermissionRequests,
  currentRoom,
  roomID,
}) => {
  const {
    useCallCustomData,
    useParticipants,
    useCallCreatedBy,
    useMicrophoneState,
    useIsCallLive,
  } = useCallStateHooks();
  const { hasPermission, requestPermission } = useRequestPermission(
    OwnCapability.SEND_AUDIO
  );

  const custom = useCallCustomData();
  const participants = useParticipants();
  const createdBy = useCallCreatedBy();
  const { microphone, isMute } = useMicrophoneState();
  const isLive = useIsCallLive();

  const [spotifyToken, setSpotifyToken] = useState(null);

  useEffect(() => {
    const fetchSpotifyToken = async () => {
      try {
        const res = await axiosInstance.get("/spotify/token", {
          withCredentials: true,
        });
        if (res.data?.accessToken) setSpotifyToken(res.data.accessToken);
        else await refreshSpotifyToken();
      } catch (err) {
        console.error("Error fetching Spotify token:", err);
      }
    };

    const refreshSpotifyToken = async () => {
      try {
        const res = await axiosInstance.get("/spotify/refresh", {
          withCredentials: true,
        });
        if (res.data?.accessToken) setSpotifyToken(res.data.accessToken);
      } catch (err) {
        console.error("Error refreshing Spotify token:", err);
      }
    };

    fetchSpotifyToken();
    const interval = setInterval(refreshSpotifyToken, 50 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Permission requests
  useEffect(() => {
    return call.on("call.permission_request", (event) => {
      setPermissionRequests((reqs) => [...reqs, event]);
    });
  }, [call, setPermissionRequests]);

  const handlePermissionRequest = useCallback(
    async (request, accept) => {
      try {
        if (accept)
          await call.grantPermissions(request.user.id, request.permissions);
        else
          await call.revokePermissions(request.user.id, request.permissions);
        setPermissionRequests((reqs) =>
          reqs.filter((req) => req !== request)
        );
      } catch (err) {
        console.error("Permission handling failed", err);
      }
    },
    [call, setPermissionRequests]
  );

  const isHost = authUser?.username === createdBy?.id;

  return (
    <div className="room-page p-6 max-w-6xl mx-auto">
      
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-bold">
          {custom?.title ?? currentRoom?.title ?? "<Room Title>"}
        </h2>
        <p className="text-gray-500 mt-1">
          {custom?.description ?? currentRoom?.description ?? "<Description>"}
        </p>
        <p className="text-sm text-gray-400 mt-2">
          {participants.length} pjesëmarrës
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {participants.map((p) => (
          <div
            key={p.sessionId}
            className="card bg-base-200 shadow-md p-4 flex flex-col items-center"
          >
            <Avatar imageSrc={p.image} />
            <span className="mt-2 font-medium">{p.name}</span>
            {p.isSpeaking && (
              <span className="text-green-500 mt-1">Duke folur</span>
            )}
          </div>
        ))}
      </div>

      {/* Permission Requests */}
      {isHost && permissionRequests.length > 0 && (
        <div className="card bg-base-100 shadow-md p-4 mb-6">
          <h4 className="text-lg font-semibold mb-2">Kërkesë për të folur</h4>
          {permissionRequests.map((request) => (
            <div
              key={request.user.id}
              className="flex items-center justify-between gap-2 mb-2"
            >
              <span className="text-gray-700">
                {request.user.name} kërkon leje për të folur
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePermissionRequest(request, true)}
                  className="btn btn-success btn-sm"
                >
                  Ne rregull
                </button>
                <button
                  onClick={() => handlePermissionRequest(request, false)}
                  className="btn btn-error btn-sm"
                >
                  Refuzo
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {spotifyToken ? (
        <SpotifyPlayer
          accessToken={spotifyToken}
          trackUri="spotify:track:YOUR_TRACK_ID"
        />
      ) : (
        <p className="text-center text-sm text-gray-400 mb-4">
          Lidhu me Spotify për të përdorur playerin 
        </p>
      )}

      {/* Request Mic Permission */}
      {!isHost && (
        <div className="mb-6 text-center">
          <button onClick={requestPermission} className="btn btn-primary">
            Kerko leje për të folur
          </button>
        </div>
      )}

      {hasPermission && (
        <div className="flex flex-wrap gap-4 justify-center mb-6">
          <button
            onClick={async () =>
              isMute ? await microphone.enable() : await microphone.disable()
            }
            className={`btn ${isMute ? "btn-warning" : "btn-outline"}`}
          >
            {isMute ? "Unmute" : "Mute"}
          </button>
          <button
            onClick={async () =>
              isLive ? await call.stopLive() : await call.goLive()
            }
            className={`btn ${isLive ? "btn-error" : "btn-success"}`}
          >
            {isLive ? "Stop Live" : "Go Live"}
          </button>
        </div>
      )}

      {/* Leave Room */}
      <div className="text-center">
        <button onClick={handleLeave} className="btn btn-error btn-lg">
          Largohu
        </button>
      </div>
    </div>
  );
};

export default RoomIdPage;
