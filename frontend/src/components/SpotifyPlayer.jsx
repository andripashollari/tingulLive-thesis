import { useEffect, useState, useCallback } from "react";
import { Play, Search, Loader2, Pause } from "lucide-react";
import { axiosInstance } from "../lib/axios"; // import your axios

const SpotifyPlayer = ({ accessToken }) => {
  const [player, setPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState(null);

  const [query, setQuery] = useState("");
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [playingUri, setPlayingUri] = useState(null);
  const [isPaused, setIsPaused] = useState(true);

  // --- Load Spotify SDK
  useEffect(() => {
    if (!accessToken) axiosInstance.get("/spotify/refresh");

    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const spotifyPlayer = new window.Spotify.Player({
        name: "tingulLive Player",
        getOAuthToken: (cb) => cb(accessToken),
        volume: 0.5,
      });

      spotifyPlayer.addListener("ready", ({ device_id }) => {
        console.log("Spotify Player Ready with Device ID", device_id);
        setDeviceId(device_id);
      });

      spotifyPlayer.addListener("not_ready", ({ device_id }) => {
        console.log("Device ID has gone offline", device_id);
      });

      spotifyPlayer.addListener("initialization_error", ({ message }) =>
        console.error("Init error:", message)
      );
      spotifyPlayer.addListener("authentication_error", ({ message }) =>
        console.error("Auth error:", message)
      );
      spotifyPlayer.addListener("account_error", ({ message }) =>
        console.error("Account error:", message)
      );
      spotifyPlayer.addListener("playback_error", ({ message }) =>
        console.error("Playback error:", message)
      );

      spotifyPlayer.connect();
      setPlayer(spotifyPlayer);
    };

    return () => {
      if (player) player.disconnect();
      document.body.removeChild(script);
    };
  }, [accessToken]);

  // --- Search tracks
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      setLoading(true);
      const res = await axiosInstance.get(
        `/spotify/search?q=${encodeURIComponent(query)}`
      );
      setTracks(res.data || []);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- Play track
  const playTrack = useCallback(
    async (uri) => {
      if (!uri || !deviceId) {
        console.error("No URI or deviceId available");
        return;
      }
      setPlayingUri(uri);

      try {
        await axiosInstance.post("/spotify/play", {
          uri,
          deviceId,
        });
      } catch (err) {
        console.error("Play error:", err.response?.data || err.message);
      }
    },
    [deviceId]
  );

  const togglePlayPause = async (uri) => {
  if (!deviceId || !uri) return;

  try {
    if (isPaused) {
      // Play
      await playTrack(uri);
    } else {
      // Pause
      await axiosInstance.post("/spotify/pause", { deviceId });
    }
    setIsPaused(!isPaused);
  } catch (err) {
    console.error("Toggle play/pause error:", err);
  }
};

  return (
    <div className="spotify-player card bg-base-200 p-6 shadow-md mb-6">
      <h4 className="text-lg font-semibold mb-4">Spotify Player</h4>

      {!accessToken ? (
        <p className="text-sm text-error">
          Ju lutem lidheni llogarinë tuaj të Spotify në Cilësimet e Përdoruesit.
        </p>
      ) : (
        <>
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex items-center gap-2 mb-4">
            <input
              type="text"
              placeholder="Search for a song..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input input-bordered w-full"
            />
            <button
              type="submit"
              className="btn btn-primary flex items-center gap-2"
            >
              <Search className="w-4 h-4" /> Kërko
            </button>
          </form>

          {loading && (
            <div className="flex justify-center items-center py-6">
              <Loader2 className="animate-spin w-6 h-6 text-primary" />
            </div>
          )}

          {!loading && tracks.length > 0 && (
            <ul className="space-y-3">
              {tracks.map((track) => (
                <li
                  key={track.id}
                  className="flex items-center justify-between bg-base-100 p-3 rounded-lg shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={track.image}
                      alt={track.name}
                      className="w-12 h-12 rounded-md shadow"
                    />
                    <div>
                      <p className="font-medium">{track.name}</p>
                      <p className="text-sm text-gray-500">{track.artist}</p>
                    </div>
                  </div>
                  <button
                      onClick={() => togglePlayPause(track.uri)}
                      className="btn btn-sm flex items-center gap-1"
                    >
                      {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                      {isPaused ? "Luaj" : "Ndalo"}
                    </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
};

export default SpotifyPlayer;
