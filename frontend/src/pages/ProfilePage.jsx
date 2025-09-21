import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore.js';
import { Camera, Mail, User, Music } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { axiosInstance } from '../lib/axios.js';

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const [spotifyConnected, setSpotifyConnected] = useState(false);

  const location = useLocation();

  // Detect Spotify success param
  useEffect(() => {
    const checkSpotifyConnection = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const res = await axiosInstance.get("/spotify/token");

        if (params.get("spotify") === "success" || res.data?.accessToken) {
          setSpotifyConnected(true);
        }
      } catch (err) {
        setSpotifyConnected(false);
      }
    };

    checkSpotifyConnection();
  }, [location]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  const handleSpotifyLogin = () => {
    window.location.href = import.meta.env.MODE === "development" ? "http://localhost:5001/api/spotify/login" : "/api/spotify/login";
  };

  return (
    <>
    <div className="h-screen pt-20">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold ">Profili</h1>
            <p className="mt-2">Informacion mbi profilin</p>
          </div>

          {/* Avatar upload */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={selectedImg || authUser.profilePic || "/avatar.png"}
                alt="Profile"
                className="size-32 rounded-full object-cover border-4 "
              />
              <label
                htmlFor="avatar-upload"
                className={`
                  absolute bottom-0 right-0 
                  bg-base-content hover:scale-105
                  p-2 rounded-full cursor-pointer 
                  transition-all duration-200
                  ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
                `}
              >
                <Camera className="w-5 h-5 text-base-200" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <p className="text-sm text-zinc-400">
              {isUpdatingProfile ? "Duke pritur..." : "Klikoni ikonën e kamerës për të ndryshuar foton"}
            </p>
          </div>

          <div className="flex justify-center mt-4">
            {spotifyConnected ? (
              <div className="alert alert-success flex items-center gap-2 p-3 rounded-lg">
                <Music className="w-5 h-5" />
                <span>Jeni lidhur me Spotify</span>
              </div>
            ) : (
              <button
                onClick={handleSpotifyLogin}
                className="btn btn-success btn-sm"
              >
                Lidhu me Spotify
              </button>
            )}
          </div>

          <div className="space-y-6">
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                Emer Mbiemer
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.fullName}</p>
            </div>

            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser.email}</p>
            </div>
          </div>

          <div className="mt-6 bg-base-300 rounded-xl p-6">
            <h2 className="text-lg font-medium  mb-4">Informacion i Përgjithshëm</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                <span>Krijuar më</span>
                <span>{new Date(authUser.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Statusi i Llogarisë</span>
                <span className="text-green-500">Aktiv</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div className="h-38"/>
    </>
  );
};

export default ProfilePage;
