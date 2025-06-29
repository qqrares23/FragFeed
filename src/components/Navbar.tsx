import { Plus, User, Gamepad2, Bell, Menu, X, Settings, Users } from "lucide-react";
import { FaCrosshairs } from "react-icons/fa";
import { SignInButton, UserButton, useUser } from "@clerk/clerk-react";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { api } from "../../convex/_generated/api";
import CreatePanel from "./CreatePanel";
import GamingDropdown from "./GamingDropdown";
import NotificationDropdown from "./NotificationDropdown";
import CommunityQuickPost from "./CommunityQuickPost";
import SearchBar from "./SearchBar";

const Navbar = () => {
  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [showGamingDropdown, setShowGamingDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCommunityQuickPost, setShowCommunityQuickPost] = useState(false);
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
      setShowCommunityQuickPost(false);
      setShowMobileMenu(false);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const closeAllDropdowns = () => {
    setShowCreatePanel(false);
    setShowGamingDropdown(false);
    setShowNotifications(false);
    setShowCommunityQuickPost(false);
    setShowMobileMenu(false);
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
    setShowCreatePanel(false);
    setShowGamingDropdown(false);
    setShowNotifications(false);
    setShowCommunityQuickPost(false);
  };

  const handleGamingClick = () => {
    closeAllDropdowns();
    setShowGamingDropdown(true);
  };

  const handleNotificationClick = () => {
    closeAllDropdowns();
    setShowNotifications(true);
  };

  const handleCommunityClick = () => {
    closeAllDropdowns();
    setShowCommunityQuickPost(true);
  };

  const handleCreateClick = () => {
    closeAllDropdowns();
    setShowCreatePanel(true);
  };

  const handleProfileClick = () => {
    closeAllDropdowns();
    if (user?.username) {
      navigate(`/u/${user.username}`);
    }
  };

  const handleMobileGamingClick = () => {
    setShowMobileMenu(false);
    setShowGamingDropdown(true);
  };

  const handleMobileCommunityClick = () => {
    setShowMobileMenu(false);
    setShowCommunityQuickPost(true);
  };

  const handleMobileNotificationClick = () => {
    setShowMobileMenu(false);
    setShowNotifications(true);
  };

  const handleMobileCreateClick = () => {
    setShowMobileMenu(false);
    setShowCreatePanel(true);
  };

  const handleMobileProfileClick = () => {
    setShowMobileMenu(false);
    if (user?.username) {
      navigate(`/u/${user.username}`);
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-lg border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group" onClick={closeAllDropdowns}>
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
              <button 
                className="btn btn-ghost p-2"
                onClick={handleGamingClick}
              >
                <Gamepad2 className="w-5 h-5" />
              </button>

              <Unauthenticated>
                <SignInButton mode="modal">
                  <button className="btn btn-primary">Sign In</button>
                </SignInButton>
              </Unauthenticated>
              
              <Authenticated>
                {/* Community Quick Post */}
                <button 
                  className="btn btn-ghost p-2"
                  onClick={handleCommunityClick}
                >
                  <Users className="w-5 h-5" />
                </button>

                {/* Notifications */}
                <div className="relative">
                  <button 
                    className="btn btn-ghost p-2"
                    onClick={handleNotificationClick}
                  >
                    <Bell className="w-5 h-5" />
                  </button>
                  {unreadCount && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>

                {/* Create */}
                <button 
                  className="btn btn-ghost p-2"
                  onClick={handleCreateClick}
                >
                  <Plus className="w-5 h-5" />
                </button>

                {/* Settings */}
                <button className="btn btn-ghost p-2">
                  <Settings className="w-5 h-5" />
                </button>

                {/* Profile */}
                <button
                  className="btn btn-ghost p-2"
                  onClick={handleProfileClick}
                >
                  <User className="w-5 h-5" />
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
                className="btn btn-ghost p-2"
                onClick={toggleMobileMenu}
              >
                {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
                    <button className="btn btn-primary w-full">Sign In</button>
                  </SignInButton>
                </Unauthenticated>

                <Authenticated>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Gaming Hub */}
                    <button 
                      className="btn btn-secondary flex items-center justify-center gap-2"
                      onClick={handleMobileGamingClick}
                    >
                      <Gamepad2 className="w-4 h-4" />
                      Gaming
                    </button>

                    {/* Community Quick Post */}
                    <button 
                      className="btn btn-secondary flex items-center justify-center gap-2"
                      onClick={handleMobileCommunityClick}
                    >
                      <Users className="w-4 h-4" />
                      Quick Post
                    </button>

                    {/* Notifications */}
                    <button 
                      className="btn btn-secondary flex items-center justify-center gap-2 relative"
                      onClick={handleMobileNotificationClick}
                    >
                      <Bell className="w-4 h-4" />
                      Notifications
                      {unreadCount && unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </button>

                    {/* Create */}
                    <button 
                      className="btn btn-primary flex items-center justify-center gap-2"
                      onClick={handleMobileCreateClick}
                    >
                      <Plus className="w-4 h-4" />
                      Create
                    </button>

                    {/* Settings */}
                    <button className="btn btn-secondary flex items-center justify-center gap-2">
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>

                    {/* Profile */}
                    <button
                      className="btn btn-secondary flex items-center justify-center gap-2"
                      onClick={handleMobileProfileClick}
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </button>
                  </div>
                </Authenticated>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Dropdown Components - Positioned absolutely */}
      <GamingDropdown
        isOpen={showGamingDropdown}
        onClose={closeAllDropdowns}
      />
      
      <NotificationDropdown
        isOpen={showNotifications}
        onClose={closeAllDropdowns}
      />
      
      <CommunityQuickPost
        isOpen={showCommunityQuickPost}
        onClose={closeAllDropdowns}
      />
      
      <CreatePanel
        isOpen={showCreatePanel}
        onClose={closeAllDropdowns}
      />
    </>
  );
};

export default Navbar;