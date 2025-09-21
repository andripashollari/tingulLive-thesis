import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../lib/axios"; // supozojmë që ke axiosInstance me baseURL të backend

const Redirect = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const err = params.get("error");

    if (err) {
      setError(err);
      setLoading(false);
      navigate("/profile");
    }

    if (code) {
      axiosInstance
        .get(`/spotify/callback?code=${encodeURIComponent(code)}`, {
          withCredentials: true, 
        })
        .then(() => {
          navigate("/profile?spotify=success");
        })
        .catch((err) => {
          console.error("Error sending code to backend:", err);
          setError("Failed to connect to Spotify.");
        })
        .finally(() => {
          setLoading(false);
          
        });
    } else {
      setError("No code found in URL.");
      setLoading(false);
    }
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="loader">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-red-500">
        <p>Error: {error}</p>
      </div>
    );
  }

  return null;
};

export default Redirect;