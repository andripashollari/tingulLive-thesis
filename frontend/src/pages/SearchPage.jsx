// pages/SearchPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { axiosInstance } from "../lib/axios";

export default function SearchPage() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        try {
            const res = await axiosInstance.get(`/user/search?username=${query}`);
            setResults(res.data);
        } catch (err) {
            console.error(err);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
        <div className="h-18"/>
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Kërko përdoruesit</h1>
            <div className="h-5" />

            <form onSubmit={handleSearch} className="flex items-center gap-2 mb-6 w-full">
                    <input
                        type="text"
                        placeholder="Kërko për një përdorues..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="input input-bordered w-full"
                    />
                    <button
                        type="submit"
                        className="btn btn-primary"
                    >
                        <Search size={20} /> Search
                    </button>
            </form>

            {loading && (
                <div className="text-center text-gray-500">Duke kërkuar...</div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
  {results.map((user) => (
    <div
      key={user._id}
      className="card card-compact bg-base-100 shadow cursor-pointer hover:shadow-lg transition"
      onClick={() => navigate(`/user/${user._id}`)}
    >
      <figure className="flex items-center justify-center w-full h-48 bg-gray-100 overflow-hidden">
        {user.profilePic ? (
          <img
            src={user.profilePic}
            alt={user.username}
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src="/avatar.png"
            alt="avatar"
            className="w-16 h-16 object-contain"
          />
        )}
      </figure>
      <div className="card-body">
        <h2 className="card-title">{user.username}</h2>
        <p className="text-gray-500">{user.fullName}</p>
        <p className="badge badge-outline mt-2">{user.role}</p>
      </div>
    </div>
  ))}
</div>


            {!loading && results.length === 0 && query && (
                <p className="text-gray-500 mt-4 text-center">Nuk u gjet asnjë përdorues</p>
            )}
        </div>
        </>
    );
}
