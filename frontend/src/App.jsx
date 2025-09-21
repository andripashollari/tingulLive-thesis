import React, { useEffect } from 'react'
import Navbar from "./components/Navbar";
import ChatPage from "./pages/ChatPage.jsx";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import { Routes, Route, Navigate} from "react-router-dom";
import { useAuthStore } from './store/useAuthStore.js';
import { useThemeStore } from './store/useThemeStore.js';
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";
import LandingPage from './pages/LandingPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import Footer from './components/Footer.jsx';
import RoomsPage from './pages/RoomPage.jsx';
import RoomIdPage from './pages/RoomIdPage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import UserPage from './pages/UsersPage.jsx';
import MePage from './pages/MePage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import Redirect from './pages/Redirect.jsx';

const App = () => {

  const { authUser, checkAuth, isCheckingAuth, onlineUsers } = useAuthStore();
  const { theme } = useThemeStore();
  useEffect(() => {
    checkAuth(); //in development it runs twice.
  }, [checkAuth]);

  console.log({ authUser });
  if(isCheckingAuth && !authUser) return (
    <div className="flex flex-col items-center justify-center h-screen gap-8">
    {/* Logo from public folder */}
    <img
      src="/tL_circle_white.png"
      alt="TingulLive Logo"
      className="w-20 h-20 sm:w-28 sm:h-28 object-contain"
    />

    {/* Loader */}
    <Loader className="size-10 animate-spin text-primary" />
  </div>
  )

  return (
    <div data-theme={theme}>

    <Navbar />
    
    <Routes>
      <Route path="/rooms" element={<RoomsPage/>} />
      <Route path="/" element={<LandingPage />}/>
      <Route path="/chats" element={ authUser ? <ChatPage /> : <Navigate to="/" />} />
      <Route path="/signup" element={ !authUser ? <SignUpPage /> : <Navigate to="/" />} />
      <Route path="/login" element={ !authUser ? <LoginPage /> : <Navigate to="/" />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/profile" element={ authUser ? <ProfilePage />: <Navigate to="/" />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/room/:id" element={ authUser ? <RoomIdPage /> : <Navigate to="/" />} />
      <Route path="/search" element={ authUser ? <SearchPage /> : <Navigate to="/" />} />
      <Route path="/user/:id" element={ authUser ? <UserPage />: <Navigate to="/" />} />
      <Route path="/me" element={ authUser ? <MePage />: <Navigate to="/" />} />
      <Route
        path="/admin"
        element={
          isCheckingAuth ? (
            // Loader while checking
            <div className="flex flex-col items-center justify-center h-screen gap-8">
              <img
                src="/tL_circle_white.png"
                alt="TingulLive Logo"
                className="w-20 h-20 sm:w-28 sm:h-28 object-contain"
              />
              <Loader className="size-10 animate-spin text-primary" />
            </div>
          ) : authUser?.role === "admin" ? (
            <AdminPage />
          ) : (
            <Navigate to="/" />
          )
        }
      />
      <Route path="/testtesttesttesttest" element={ authUser ? <Redirect /> : <Navigate to="/" />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
    <Toaster
      position="top-center"
      reverseOrder={false}
    />

    <Footer />
    </div>
  )
}

export default App