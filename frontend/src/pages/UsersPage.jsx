import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "../store/useAuthStore"; // assuming you have this

export default function UserPage() {
  const { id } = useParams();
  const { authUser } = useAuthStore(); // currently logged-in user
  const [user, setUser] = useState(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch user info
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get(`/user/${id}`);
        setUser(res.data);
      } catch (err) {
        console.error(err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  // Fetch followers / following counts
  useEffect(() => {
    const fetchFollowData = async () => {
      try {
        const [followersRes, followingRes] = await Promise.all([
          axiosInstance.get(`/follow/${id}/followers`),
          axiosInstance.get(`/follow/${id}/following`)
        ]);
        setFollowersCount(followersRes.data.length);
        setFollowingCount(followingRes.data.length);

        // check if current user follows this user
        if (authUser) {
          setIsFollowing(
            followersRes.data.some(f => f.follower._id === authUser._id)
          );
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchFollowData();
  }, [id, authUser]);

  const handleFollowToggle = async () => {
    if (!authUser) return alert("You must be logged in to follow users.");

    try {
      if (isFollowing) {
        await axiosInstance.post(`/follow/${id}/unfollow`);
        setFollowersCount(prev => prev - 1);
      } else {
        await axiosInstance.post(`/follow/${id}/follow`);
        setFollowersCount(prev => prev + 1);
      }
      setIsFollowing(!isFollowing);
    } catch (err) {
      console.error(err);
      alert("Failed to update follow status.");
    }
  };

  if (loading) return <p className="text-center mt-6">Duke pritur...</p>;
  if (!user) return <p className="text-center mt-6 text-red-500">Përdoruesi nuk u gjet!</p>;

  return (
    <>
    <div className="h-18" />
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
            <div className="mt-2 flex justify-center">
                <p>{user.role}</p>
            </div>


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

          {authUser && authUser._id !== id && (
            <button
              onClick={handleFollowToggle}
              className={`btn mt-4 ${isFollowing ? "btn-outline" : "btn-primary"}`}
            >
              {isFollowing ? "Unfollow" : "Follow"}
            </button>
          )}

          <div className="mt-4">
            <p><strong>Email:</strong> {user.email}</p>
            <p className="text-gray-400 text-sm mt-1">
              Joined: {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
