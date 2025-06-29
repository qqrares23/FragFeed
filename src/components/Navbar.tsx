import { FaPlus, FaUser, FaGamepad, FaBell, FaCrosshairs } from "react-icons/fa";
import { SignInButton, UserButton, useUser } from "@clerk/clerk-react";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { api } from "../../convex/_generated/api";
import CreatePanel from "./CreatePanel";
import GamingDropdown from "./GamingDropdown";
import NotificationDropdown from "./NotificationDropdown";
import SearchBar from "./SearchBar";

const Navbar = () => {
  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [showGamingDropdown, setShowGamingDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { user } = useUser();
  const navigate = useNavigate();
  
  const unreadCount = useQuery(api.notifications.getUnreadCount);

  const handleCreatePanel = () => {
    setShowCreatePanel(true);
    setShowGamingDropdown(false);
    setShowNotifications(false);
  };

  const handleGamingDropdown = () => {
    setShowGamingDropdown(true);
    setShowCreatePanel(false);
    setShowNotifications(false);
  };

  const handleNotifications = () => {
    setShowNotifications(true);
    setShowCreatePanel(false);
    setShowGamingDropdown(false);
  };

  const closeAllDropdowns = () => {
    setShowCreatePanel(false);
    setShowGamingDropdown(false);
    setShowNotifications(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-white/20 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-transform duration-200">
              <FaCrosshairs className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 via-secondary-600 to-primary-600 bg-clip-text text-transparent bg-[length:200%_100%] animate-[gradient_3s_ease-in-out_infinite] hidden sm:block">
              FragFeed
            </span>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-4">
            <SearchBar />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Gaming Hub */}
            <div className="relative">
              <button 
                onClick={handleGamingDropdown}
                className="btn btn-ghost p-2 relative group"
                title="Gaming Hub"
              >
                <FaGamepad className="w-5 h-5 text-primary-600 group-hover:text-primary-700" />
              </button>
              {showGamingDropdown && (
                <GamingDropdown
                  isOpen={showGamingDropdown}
                  onClose={closeAllDropdowns}
                />
              )}
            </div>

            <Unauthenticated>
              <SignInButton mode="modal">
                <button className="btn btn-primary">
                  Sign In
                </button>
              </SignInButton>
            </Unauthenticated>
            
            <Authenticated>
              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={handleNotifications}
                  className="btn btn-ghost p-2 relative"
                  title="Notifications"
                >
                  <FaBell className="w-5 h-5" />
                  {unreadCount && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <NotificationDropdown
                    isOpen={showNotifications}
                    onClose={closeAllDropdowns}
                  />
                )}
              </div>

              {/* Create */}
              <div className="relative">
                <button 
                  onClick={handleCreatePanel}
                  className="btn btn-ghost p-2"
                  title="Create"
                >
                  <FaPlus className="w-5 h-5" />
                </button>
                {showCreatePanel && (
                  <CreatePanel
                    isOpen={showCreatePanel}
                    onClose={closeAllDropdowns}
                  />
                )}
              </div>

              {/* Profile */}
              <button
                onClick={() => user?.username && navigate(`/u/${user.username}`)}
                className="btn btn-ghost p-2"
                title="Profile"
              >
                <FaUser className="w-5 h-5" />
              </button>

              <UserButton />
            </Authenticated>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;