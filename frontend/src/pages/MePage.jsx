// pages/ProfilePage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "../store/useAuthStore";

export default function Me() {
  const { authUser } = useAuthStore(); // current logged-in user
  const [user, setUser] = useState(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authUser) {
      setLoading(false);
      return;
    }

    const fetchProfileData = async () => {
      try {
        const [userRes, followersRes, followingRes] = await Promise.all([
          axiosInstance.get(`/user/${authUser._id}`),
          axiosInstance.get(`/follow/${authUser._id}/followers`),
          axiosInstance.get(`/follow/${authUser._id}/following`),
        ]);

        setUser(userRes.data);
        setFollowersCount(followersRes.data.length);
        setFollowingCount(followingRes.data.length);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [authUser]);

  if (loading) return <p className="text-center mt-6">Duke pritur...</p>;
  if (!user) return <p className="text-center mt-6 text-red-500">Nuk u gjet asnjë profil.</p>;

  return (
    <>
    <div className="h-20"/>
    <div className="max-w-2xl mx-auto p-6">
      <div className="card card-compact bg-base-100 shadow-lg">
        <figure className="w-full h-64 bg-gray-100 flex items-center justify-center overflow-hidden">
          <img
            src={user.profilePic || "/avatar.png"}
            alt={user.username}
            className="w-32 h-32 object-cover rounded-full border-4 border-white -mt-16 shadow-lg"
          />
        </figure>
        <div className="card-body text-center mt-2">
          <h2 className="card-title justify-center">{user.username}</h2>
          <p className="text-gray-500">{user.fullName}</p>
          <p className="badge badge-outline mt-2 items-center justify-center">{user.role}</p>

          <div className="flex justify-center gap-6 mt-4">
            <div>
              <strong>{followersCount}</strong>
              <p className="text-gray-400 text-sm">Followers</p>
            </div>
            <div>
              <strong>{followingCount}</strong>
              <p className="text-gray-400 text-sm">Following</p>
            </div>
          </div>

          <button
            onClick={() => navigate("/profile")}
            className="btn btn-primary mt-4"
          >
            Cilësime
          </button>

          <div className="mt-4">
            <p><strong>Email:</strong> {user.email}</p>
            <p className="text-gray-400 text-sm mt-1">
              Krijuar më: {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
