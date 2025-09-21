import { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";
import {
  Users,
  UserPlus,
  MessageSquare,
  Activity,
  ChevronLeft,
  ChevronRight,
  Trash2
} from "lucide-react";
import toast from "react-hot-toast";

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [userPage, setUserPage] = useState(1);
  const [userLimit] = useState(10);
  const [userPagination, setUserPagination] = useState({ totalPages: 1 });

  const [roomPage, setRoomPage] = useState(1);
  const [roomLimit] = useState(10);
  const [roomPagination, setRoomPagination] = useState({ totalPages: 1 });

  // Fetch data
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const [statsRes, usersRes, roomsRes] = await Promise.all([
          axiosInstance.get("/admin/stats"),
          axiosInstance.get(`/admin/users?page=${userPage}&limit=${userLimit}`),
          axiosInstance.get(`/admin/rooms?page=${roomPage}&limit=${roomLimit}`)
        ]);
        setStats(statsRes.data);
        setUsers(usersRes.data.users);
        setUserPagination(usersRes.data.pagination);
        setRooms(roomsRes.data.rooms);
        setRoomPagination(roomsRes.data.pagination);
      } catch (err) {
        console.error("Failed to fetch admin data", err);
        toast.error("Failed to load admin data");
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [userPage, roomPage, userLimit, roomLimit]);

  // User pagination handlers
  const handleUserPrevPage = () => userPage > 1 && setUserPage(userPage - 1);
  const handleUserNextPage = () =>
    userPage < userPagination.totalPages && setUserPage(userPage + 1);

  // Room pagination handlers
  const handleRoomPrevPage = () => roomPage > 1 && setRoomPage(roomPage - 1);
  const handleRoomNextPage = () =>
    roomPage < roomPagination.totalPages && setRoomPage(roomPage + 1);

  // Delete user
  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await axiosInstance.delete(`/admin/user/${id}`);
      toast.success("User deleted successfully");
      // Refresh users after deletion
      setUsers(users.filter((u) => u._id !== id));
      setUserPagination((prev) => ({
        ...prev,
        totalUsers: prev.totalUsers - 1
      }));
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete user");
    }
  };

  if (loading)
    return <p className="text-center mt-6">Duke pritur...</p>;

  return (
    <>
      <div className="h-16" />
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold mb-4 text-center">Admin Dashboard</h1>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="stat bg-base-100 shadow rounded-xl">
              <div className="stat-figure text-primary">
                <Users className="w-8 h-8" />
              </div>
              <div className="stat-title">Përdorues</div>
              <div className="stat-value">{stats.totalUsers}</div>
            </div>

            <div className="stat bg-base-100 shadow rounded-xl">
              <div className="stat-figure text-success">
                <UserPlus className="w-8 h-8" />
              </div>
              <div className="stat-title">Përdorues të rinj (7d)</div>
              <div className="stat-value">{stats.newUsersLast7Days ?? 0}</div>
            </div>

            <div className="stat bg-base-100 shadow rounded-xl">
              <div className="stat-figure text-info">
                <MessageSquare className="w-8 h-8" />
              </div>
              <div className="stat-title">Dhoma totale</div>
              <div className="stat-value">{stats.totalRooms}</div>
            </div>

            <div className="stat bg-base-100 shadow rounded-xl">
              <div className="stat-figure text-warning">
                <Activity className="w-8 h-8" />
              </div>
              <div className="stat-title">Dhoma Aktive</div>
              <div className="stat-value">{stats.activeRooms ?? 0}</div>
            </div>
          </div>
        )}

        {/* Users table */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title mb-4">Përdoruesit</h2>
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Roli</th>
                    <th>Data</th>
                    <th>Fshi</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td>{u.username}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className="badge badge-outline">{u.role || "user"}</span>
                      </td>
                      <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-error flex items-center gap-1"
                          onClick={() => handleDeleteUser(u._id)}
                        >
                          <Trash2 className="w-4 h-4" /> Fshi
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* User Pagination */}
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="btn btn-sm btn-outline"
                onClick={handleUserPrevPage}
                disabled={userPage <= 1}
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Perpara
              </button>
              <span className="flex items-center gap-2">
                Faqe {userPage} / {userPagination.totalPages}
              </span>
              <button
                className="btn btn-sm btn-outline"
                onClick={handleUserNextPage}
                disabled={userPage >= userPagination.totalPages}
              >
                Pas <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>

        {/* Rooms table */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title mb-4">Dhomat</h2>
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Emri</th>
                    <th>Përshkrimi</th>
                    <th>Krijuesi</th>
                    <th>Data e krijimit</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((r) => (
                    <tr key={r._id}>
                      <td>{r.name}</td>
                      <td>{r.description}</td>
                      <td>{r.owner?.username || "N/A"}</td>
                      <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Room Pagination */}
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="btn btn-sm btn-outline"
                onClick={handleRoomPrevPage}
                disabled={roomPage <= 1}
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Perpara
              </button>
              <span className="flex items-center gap-2">
                Faqe {roomPage} / {roomPagination.totalPages}
              </span>
              <button
                className="btn btn-sm btn-outline"
                onClick={handleRoomNextPage}
                disabled={roomPage >= roomPagination.totalPages}
              >
                Pas <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
