import { Plus, User, Gamepad2, Bell, Menu, X, Settings, Users, UserPlus } from "lucide-react";
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
import FollowingDropdown from "./FollowingDropdown";
import SearchBar from "./SearchBar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Navbar = () => {
  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [showGamingDropdown, setShowGamingDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCommunityQuickPost, setShowCommunityQuickPost] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { user } = useUser();
  const navigate = useNavigate();
  
  // Get notification count - only show badge if > 0
  const unreadNotifications = useQuery(api.notifications.getUnreadCount);
  const hasUnreadNotifications = unreadNotifications && unreadNotifications > 0;
  
  // Get following count - only show badge if > 0
  const currentUser = useQuery(api.users.current);
  const followingCount = useQuery(
    api.follows.getFollowingCount,
    currentUser?._id ? { userId: currentUser._id } : "skip"
  );
  const hasFollowing = followingCount && followingCount > 0;

  // Close all dropdowns when screen size changes
  useEffect(() => {
    const handleResize = () => {
      setShowCreatePanel(false);
      setShowGamingDropdown(false);
      setShowNotifications(false);
      setShowCommunityQuickPost(false);
      setShowFollowing(false);
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
    setShowFollowing(false);
    setShowMobileMenu(false);
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
    setShowCreatePanel(false);
    setShowGamingDropdown(false);
    setShowNotifications(false);
    setShowCommunityQuickPost(false);
    setShowFollowing(false);
  };

  const handleGamingClick = () => {
    closeAllDropdowns();
    setShowGamingDropdown(true);
  };

  const handleNotificationsClick = () => {
    closeAllDropdowns();
    setShowNotifications(true);
  };

  const handleCreateClick = () => {
    closeAllDropdowns();
    setShowCreatePanel(true);
  };

  const handleCommunityQuickPostClick = () => {
    closeAllDropdowns();
    setShowCommunityQuickPost(true);
  };

  const handleFollowingClick = () => {
    closeAllDropdowns();
    setShowFollowing(true);
  };

  const handleSettingsClick = () => {
    navigate('/settings');
    closeAllDropdowns();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 lg:gap-3 group">
            <div className="w-7 h-7 lg:w-10 lg:h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 ease-out group-hover:shadow-lg">
              <FaCrosshairs className="w-3 h-3 lg:w-5 lg:h-5 text-white transform group-hover:rotate-180 transition-transform duration-500 ease-in-out" />
            </div>
            <span className="text-base lg:text-xl font-bold bg-gradient-to-r from-primary-600 via-secondary-600 to-primary-600 bg-clip-text text-transparent hidden sm:block group-hover:scale-105 transition-transform duration-200">
              FragFeed
            </span>
          </Link>

          {/* Search Bar - Hidden on mobile, shown in mobile menu */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-4">
            <SearchBar />
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2 relative">
            {/* Gaming Hub */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleGamingClick}
              className={`transform hover:scale-110 hover:rotate-3 transition-all duration-200 ease-out hover:shadow-md ${
                showGamingDropdown ? "bg-slate-100 dark:bg-slate-800 scale-105" : ""
              }`}
            >
              <Gamepad2 className="w-4 h-4 lg:w-5 lg:h-5 transition-transform duration-200 hover:rotate-12" />
            </Button>

            <Unauthenticated>
              <SignInButton mode="modal">
                <Button className="transform hover:scale-105 hover:-translate-y-0.5 transition-all duration-200 ease-out hover:shadow-lg text-sm lg:text-base px-3 lg:px-4">
                  Sign In
                </Button>
              </SignInButton>
            </Unauthenticated>
            
            <Authenticated>
              {/* Following */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleFollowingClick}
                  className={`transform hover:scale-110 hover:rotate-3 transition-all duration-200 ease-out hover:shadow-md ${
                    showFollowing ? "bg-slate-100 dark:bg-slate-800 scale-105" : ""
                  }`}
                >
                  <UserPlus className="w-4 h-4 lg:w-5 lg:h-5 transition-transform duration-200 hover:rotate-12" />
                </Button>
                {hasFollowing && (
                  <Badge 
                    variant="secondary" 
                    className="absolute -top-1 -right-1 h-4 w-4 lg:h-5 lg:w-5 flex items-center justify-center p-0 text-xs bg-primary-100 text-primary-700"
                  >
                    {followingCount > 99 ? '99+' : followingCount}
                  </Badge>
                )}
              </div>

              {/* Community Quick Post */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCommunityQuickPostClick}
                className={`transform hover:scale-110 hover:rotate-3 transition-all duration-200 ease-out hover:shadow-md ${
                  showCommunityQuickPost ? "bg-slate-100 dark:bg-slate-800 scale-105" : ""
                }`}
              >
                <Users className="w-4 h-4 lg:w-5 lg:h-5 transition-transform duration-200 hover:rotate-12" />
              </Button>

              {/* Notifications */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNotificationsClick}
                  className={`transform hover:scale-110 hover:rotate-3 transition-all duration-200 ease-out hover:shadow-md ${
                    showNotifications ? "bg-slate-100 dark:bg-slate-800 scale-105" : ""
                  }`}
                >
                  <Bell className="w-4 h-4 lg:w-5 lg:h-5 transition-transform duration-200 hover:rotate-12" />
                </Button>
                {hasUnreadNotifications && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-4 w-4 lg:h-5 lg:w-5 flex items-center justify-center p-0 text-xs animate-pulse"
                  >
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </Badge>
                )}
              </div>

              {/* Create */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCreateClick}
                className={`transform hover:scale-110 hover:rotate-3 transition-all duration-200 ease-out hover:shadow-md ${
                  showCreatePanel ? "bg-slate-100 dark:bg-slate-800 scale-105" : ""
                }`}
              >
                <Plus className="w-4 h-4 lg:w-5 lg:h-5 transition-transform duration-200 hover:rotate-90" />
              </Button>

              {/* Settings */}
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleSettingsClick}
                className="transform hover:scale-110 hover:rotate-3 transition-all duration-200 ease-out hover:shadow-md"
              >
                <Settings className="w-4 h-4 lg:w-5 lg:h-5 transition-transform duration-200 hover:rotate-90" />
              </Button>

              {/* Profile */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => user?.username && navigate(`/u/${user.username}`)}
                className="transform hover:scale-110 hover:rotate-3 transition-all duration-200 ease-out hover:shadow-md"
              >
                <User className="w-4 h-4 lg:w-5 lg:h-5 transition-transform duration-200 hover:rotate-12" />
              </Button>

              <div className="transform hover:scale-105 transition-transform duration-200">
                <UserButton />
              </div>
            </Authenticated>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <Authenticated>
              <div className="transform hover:scale-105 transition-transform duration-200">
                <UserButton />
              </div>
            </Authenticated>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              className="transform hover:scale-110 hover:rotate-3 transition-all duration-200 ease-out hover:shadow-md"
            >
              {showMobileMenu ? (
                <X className="w-5 h-5 transition-transform duration-200 hover:rotate-90" />
              ) : (
                <Menu className="w-5 h-5 transition-transform duration-200 hover:rotate-12" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 animate-fade-in">
            <div className="px-4 py-4 space-y-4">
              {/* Mobile Search */}
              <div className="w-full animate-slide-up" style={{ animationDelay: '100ms' }}>
                <SearchBar />
              </div>

              <Unauthenticated>
                <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
                  <SignInButton mode="modal">
                    <Button className="w-full transform hover:scale-105 hover:-translate-y-0.5 transition-all duration-200 ease-out">
                      Sign In
                    </Button>
                  </SignInButton>
                </div>
              </Unauthenticated>

              <Authenticated>
                <div className="grid grid-cols-2 gap-3">
                  {/* Gaming Hub */}
                  <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
                    <Button 
                      variant="secondary" 
                      className="w-full flex items-center justify-center gap-2 transform hover:scale-105 hover:-translate-y-0.5 transition-all duration-200 ease-out text-sm"
                      onClick={handleGamingClick}
                    >
                      <Gamepad2 className="w-4 h-4 transition-transform duration-200 hover:rotate-12" />
                      Gaming
                    </Button>
                  </div>

                  {/* Following */}
                  <div className="animate-slide-up" style={{ animationDelay: '325ms' }}>
                    <Button 
                      variant="secondary" 
                      className="w-full flex items-center justify-center gap-2 relative transform hover:scale-105 hover:-translate-y-0.5 transition-all duration-200 ease-out text-sm"
                      onClick={handleFollowingClick}
                    >
                      <UserPlus className="w-4 h-4 transition-transform duration-200 hover:rotate-12" />
                      Following
                      {hasFollowing && (
                        <Badge 
                          variant="secondary" 
                          className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-xs bg-primary-100 text-primary-700"
                        >
                          {followingCount > 99 ? '99+' : followingCount}
                        </Badge>
                      )}
                    </Button>
                  </div>

                  {/* Community Quick Post */}
                  <div className="animate-slide-up" style={{ animationDelay: '350ms' }}>
                    <Button 
                      variant="secondary" 
                      className="w-full flex items-center justify-center gap-2 transform hover:scale-105 hover:-translate-y-0.5 transition-all duration-200 ease-out text-sm"
                      onClick={handleCommunityQuickPostClick}
                    >
                      <Users className="w-4 h-4 transition-transform duration-200 hover:rotate-12" />
                      Quick Post
                    </Button>
                  </div>

                  {/* Notifications */}
                  <div className="animate-slide-up" style={{ animationDelay: '400ms' }}>
                    <Button 
                      variant="secondary" 
                      className="w-full flex items-center justify-center gap-2 relative transform hover:scale-105 hover:-translate-y-0.5 transition-all duration-200 ease-out text-sm"
                      onClick={handleNotificationsClick}
                    >
                      <Bell className="w-4 h-4 transition-transform duration-200 hover:rotate-12" />
                      Notifications
                      {hasUnreadNotifications && (
                        <Badge 
                          variant="destructive" 
                          className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-xs animate-pulse"
                        >
                          {unreadNotifications > 9 ? '9+' : unreadNotifications}
                        </Badge>
                      )}
                    </Button>
                  </div>

                  {/* Create */}
                  <div className="animate-slide-up" style={{ animationDelay: '450ms' }}>
                    <Button 
                      className="w-full flex items-center justify-center gap-2 transform hover:scale-105 hover:-translate-y-0.5 transition-all duration-200 ease-out text-sm"
                      onClick={handleCreateClick}
                    >
                      <Plus className="w-4 h-4 transition-transform duration-200 hover:rotate-90" />
                      Create
                    </Button>
                  </div>

                  {/* Settings */}
                  <div className="animate-slide-up" style={{ animationDelay: '500ms' }}>
                    <Button 
                      variant="secondary" 
                      className="w-full flex items-center justify-center gap-2 transform hover:scale-105 hover:-translate-y-0.5 transition-all duration-200 ease-out text-sm"
                      onClick={handleSettingsClick}
                    >
                      <Settings className="w-4 h-4 transition-transform duration-200 hover:rotate-90" />
                      Settings
                    </Button>
                  </div>

                  {/* Profile */}
                  <div className="animate-slide-up col-span-2" style={{ animationDelay: '550ms' }}>
                    <Button
                      variant="secondary"
                      className="w-full flex items-center justify-center gap-2 transform hover:scale-105 hover:-translate-y-0.5 transition-all duration-200 ease-out text-sm"
                      onClick={() => {
                        if (user?.username) {
                          navigate(`/u/${user.username}`);
                          setShowMobileMenu(false);
                        }
                      }}
                    >
                      <User className="w-4 h-4 transition-transform duration-200 hover:rotate-12" />
                      Profile
                    </Button>
                  </div>
                </div>
              </Authenticated>
            </div>
          </div>
        )}
      </div>

      {/* Dropdown Components */}
      <GamingDropdown
        isOpen={showGamingDropdown}
        onClose={closeAllDropdowns}
      />
      
      <NotificationDropdown
        isOpen={showNotifications}
        onClose={closeAllDropdowns}
      />
      
      <CreatePanel
        isOpen={showCreatePanel}
        onClose={closeAllDropdowns}
      />
      
      <CommunityQuickPost
        isOpen={showCommunityQuickPost}
        onClose={closeAllDropdowns}
      />
      
      <FollowingDropdown
        isOpen={showFollowing}
        onClose={closeAllDropdowns}
      />
    </nav>
  );
};

export default Navbar;