import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import {
  LogOut,
  MessageSquare,
  Home,
  Users,
  User,
  Settings,
  Menu,
  X,
  Info,
  PlaySquare,
  Search,
} from "lucide-react";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header
      className="border-b border-base-300 fixed w-full top-0 z-40 
      backdrop-blur-lg bg-base-100/80"
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left: Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 hover:opacity-80 transition-all"
        >
          <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <img
            src="/tL_circle_white.png"
            alt="tingulLive Logo"
            className="w-5 h-5 sm:w-28 sm:h-28 object-contain"
          />
          </div>
          <h1 className="text-lg font-bold">tingulLive</h1>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden sm:flex items-center gap-6">
          <Link
            to="/"
            className="hover:text-primary transition-colors flex items-center gap-1"
          >
            <Home className="w-4 h-4" />
            <span>Kreu</span>
          </Link>

          <Link
            to="/rooms"
            className="hover:text-primary transition-colors flex items-center gap-1"
          >
            <Users className="w-4 h-4" />
            <span>Dhomat</span>
          </Link>

          <Link
            to="/search"
            className="hover:text-primary transition-colors flex items-center gap-1"
          >
            <Search className="w-4 h-4" />
            <span>Kërko</span>
          </Link>

          <Link
            to="/chats"
            className="hover:text-primary transition-colors flex items-center gap-1"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Mesazhet</span>
          </Link>

          <Link
            to="/about"
            className="hover:text-primary transition-colors flex items-center gap-1"
          >
            <Info className="w-4 h-4" />
            <span>Rreth Nesh</span>
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            to="/settings"
            className="btn btn-sm btn-ghost gap-2"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </Link>

          {authUser ? (
            <>
              <Link
                to="/me"
                className="rounded-lg overflow-hidden w-9 h-9 flex items-center justify-center border border-base-300"
              >
                {authUser.avatar ? (
                  <img
                    src={authUser.avatar}
                    alt="User Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-5 h-5" />
                )}
              </Link>

              <button className="btn btn-sm gap-2" onClick={logout}>
                <LogOut className="size-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-sm btn-primary">
              Login
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button
            className="sm:hidden btn btn-ghost btn-sm"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      {isOpen && (
        <div className="sm:hidden bg-base-100 border-t border-base-300 px-4 py-3 space-y-3">
          <Link
            to="/"
            className="flex items-center gap-2 hover:text-primary"
            onClick={() => setIsOpen(false)}
          >
            <Home className="w-4 h-4" />
            Kreu
          </Link>
          <Link
            to="/rooms"
            className="flex items-center gap-2 hover:text-primary"
            onClick={() => setIsOpen(false)}
          >
            <Users className="w-4 h-4" />
            Dhomat
          </Link>
          <Link
            to="/search"
            className="flex items-center gap-2 hover:text-primary"
            onClick={() => setIsOpen(false)}
          >
            <Search className="w-4 h-4" />
            Kërko
          </Link>
          <Link
            to="/chat"
            className="flex items-center gap-2 hover:text-primary"
            onClick={() => setIsOpen(false)}
          >
            <MessageSquare className="w-4 h-4" />
            Mesazhet
          </Link>
          <Link
            to="/about"
            className="flex items-center gap-2 hover:text-primary"
            onClick={() => setIsOpen(false)}
          >
            <Info className="w-4 h-4" />
            Rreth Nesh
          </Link>
        </div>
      )}
    </header>
  );
};

export default Navbar;
