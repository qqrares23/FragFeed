import { FaPlus, FaUser, FaGamepad, FaBell, FaCrosshairs, FaBars, FaTimes, FaCog } from "react-icons/fa";
import { SignInButton, UserButton, useUser } from "@clerk/clerk-react";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { api } from "../../convex/_generated/api";
import CreatePanel from "./CreatePanel";
import GamingDropdown from "./GamingDropdown";
import NotificationDropdown from "./NotificationDropdown";
import SearchBar from "./SearchBar";

const Navbar = () => {
  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [showGamingDropdown, setShowGamingDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { user } = useUser();
  const navigate = useNavigate();
  
  const unreadCount = useQuery(api.notifications.getUnreadCount);

  // Close all dropdowns when screen size changes
  useEffect(() => {
    const handleResize = () => {
      setShowCreatePanel(false);
      setShowGamingDropdown(false);
      setShowNotifications(false);
      setShowMobileMenu(false);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleCreatePanel = () => {
    setShowCreatePanel(true);
    setShowGamingDropdown(false);
    setShowNotifications(false);
    setShowMobileMenu(false);
  };

  const handleGamingDropdown = () => {
    setShowGamingDropdown(true);
    setShowCreatePanel(false);
    setShowNotifications(false);
    setShowMobileMenu(false);
  };

  const handleNotifications = () => {
    setShowNotifications(true);
    setShowCreatePanel(false);
    setShowGamingDropdown(false);
    setShowMobileMenu(false);
  };

  const closeAllDropdowns = () => {
    setShowCreatePanel(false);
    setShowGamingDropdown(false);
    setShowNotifications(false);
    setShowMobileMenu(false);
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
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
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-transform duration-200">
              <FaCrosshairs className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
            </div>
            <span className="text-lg lg:text-xl font-bold bg-gradient-to-r from-primary-600 via-secondary-600 to-primary-600 bg-clip-text text-transparent bg-[length:200%_100%] animate-[gradient_3s_ease-in-out_infinite] hidden sm:block">
              FragFeed
            </span>
          </Link>

          {/* Search Bar - Hidden on mobile, shown in mobile menu */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-4">
            <SearchBar />
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            {/* Gaming Hub */}
            <div className="relative">
              <button 
                onClick={handleGamingDropdown}
                className={`p-3 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                  showGamingDropdown 
                    ? 'bg-primary-100 text-primary-700 shadow-md' 
                    : 'text-primary-600 hover:text-primary-700 hover:bg-primary-50'
                }`}
                title="Gaming Hub"
              >
                <FaGamepad className="w-5 h-5" />
              </button>
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
                  className={`p-3 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 relative ${
                    showNotifications 
                      ? 'bg-primary-100 text-primary-700 shadow-md' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  title="Notifications"
                >
                  <FaBell className="w-5 h-5" />
                  {unreadCount && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Create */}
              <div className="relative">
                <button 
                  onClick={handleCreatePanel}
                  className={`p-3 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                    showCreatePanel 
                      ? 'bg-primary-100 text-primary-700 shadow-md' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  title="Create"
                >
                  <FaPlus className="w-5 h-5" />
                </button>
              </div>

              {/* Settings */}
              <div className="relative">
                <button
                  className="p-3 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  title="Settings"
                >
                  <FaCog className="w-5 h-5" />
                </button>
              </div>

              {/* Profile */}
              <button
                onClick={() => user?.username && navigate(`/u/${user.username}`)}
                className="p-3 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                title="Profile"
              >
                <FaUser className="w-5 h-5" />
              </button>

              <UserButton />
            </Authenticated>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <Authenticated>
              <UserButton />
            </Authenticated>
            <button
              onClick={toggleMobileMenu}
              className="p-3 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              title="Menu"
            >
              {showMobileMenu ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-lg">
            <div className="px-4 py-4 space-y-4">
              {/* Mobile Search */}
              <div className="w-full">
                <SearchBar />
              </div>

              <Unauthenticated>
                <SignInButton mode="modal">
                  <button className="btn btn-primary w-full">
                    Sign In
                  </button>
                </SignInButton>
              </Unauthenticated>

              <Authenticated>
                <div className="grid grid-cols-2 gap-3">
                  {/* Gaming Hub */}
                  <button 
                    onClick={handleGamingDropdown}
                    className="btn btn-secondary flex items-center justify-center gap-2"
                  >
                    <FaGamepad className="w-4 h-4" />
                    Gaming
                  </button>

                  {/* Notifications */}
                  <button 
                    onClick={handleNotifications}
                    className="btn btn-secondary flex items-center justify-center gap-2 relative"
                  >
                    <FaBell className="w-4 h-4" />
                    Notifications
                    {unreadCount && unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Create */}
                  <button 
                    onClick={handleCreatePanel}
                    className="btn btn-primary flex items-center justify-center gap-2"
                  >
                    <FaPlus className="w-4 h-4" />
                    Create
                  </button>

                  {/* Settings */}
                  <button
                    className="btn btn-secondary flex items-center justify-center gap-2"
                  >
                    <FaCog className="w-4 h-4" />
                    Settings
                  </button>

                  {/* Profile */}
                  <button
                    onClick={() => {
                      if (user?.username) {
                        navigate(`/u/${user.username}`);
                        setShowMobileMenu(false);
                      }
                    }}
                    className="btn btn-secondary flex items-center justify-center gap-2 col-span-2"
                  >
                    <FaUser className="w-4 h-4" />
                    Profile
                  </button>
                </div>
              </Authenticated>
            </div>
          </div>
        )}
      </div>

      {/* Single set of dropdowns that work for both mobile and desktop */}
      {showGamingDropdown && (
        <GamingDropdown
          isOpen={showGamingDropdown}
          onClose={closeAllDropdowns}
        />
      )}
      {showNotifications && (
        <NotificationDropdown
          isOpen={showNotifications}
          onClose={closeAllDropdowns}
        />
      )}
      {showCreatePanel && (
        <CreatePanel
          isOpen={showCreatePanel}
          onClose={closeAllDropdowns}
        />
      )}
    </nav>
  );
};

export default Navbar;