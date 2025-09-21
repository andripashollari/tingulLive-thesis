import { Link } from "react-router-dom";
import { Github, Twitter, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-base-200 text-base-content mt-16">
        <div className="container mx-auto px-4 py-10 flex flex-col sm:flex-row justify-between items-center gap-6">
            {/* Left: Logo + Links */}
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <img
                src="/logo.png"
                alt="TingulLive Logo"
                className="w-20 h-20 object-contain"
            />
            <div className="flex flex-col sm:flex-row gap-6">
                <Link to="/about" className="hover:text-primary transition">
                About
                </Link>
                <Link to="/thankYou" className="hover:text-primary transition">
                Falenderimet
                </Link>
            </div>
            </div>

            {/* Social Icons */}
            <div className="flex gap-4">
            <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition"
            >
                <Github className="w-5 h-5" />
            </a>
            <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition"
            >
                <Twitter className="w-5 h-5" />
            </a>
            <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition"
            >
                <Instagram className="w-5 h-5" />
            </a>
            </div>
        </div>

        {/* Copyright */}
        <div className="bg-base-300 text-base-content/70 py-4 text-center text-sm">
            &copy; 2025 TingulLive. All rights reserved.
        </div>
        </footer>
  );
}
