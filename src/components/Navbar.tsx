import { Plus, User, Gamepad2, Bell, Target, Menu, X, Users } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-white/20 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-transform duration-200">
              <Target className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
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
          <div className="hidden md:flex items-center gap-2 relative">
            {/* Gaming Hub */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleGamingClick}
              className={showGamingDropdown ? "bg-slate-100" : ""}
            >
              <Gamepad2 className="w-5 h-5" />
            </Button>

            <Unauthenticated>
              <SignInButton mode="modal">
                <Button>Sign In</Button>
              </SignInButton>
            </Unauthenticated>
            
            <Authenticated>
              {/* Community Quick Post */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCommunityQuickPostClick}
                className={showCommunityQuickPost ? "bg-slate-100" : ""}
              >
                <Users className="w-5 h-5" />
              </Button>

              {/* Notifications */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNotificationsClick}
                  className={showNotifications ? "bg-slate-100" : ""}
                >
                  <Bell className="w-5 h-5" />
                </Button>
                {unreadCount && unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
              </div>

              {/* Create */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCreateClick}
                className={showCreatePanel ? "bg-slate-100" : ""}
              >
                <Plus className="w-5 h-5" />
              </Button>

              {/* Profile */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => user?.username && navigate(`/u/${user.username}`)}
              >
                <User className="w-5 h-5" />
              </Button>

              <UserButton />
            </Authenticated>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <Authenticated>
              <UserButton />
            </Authenticated>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
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
                  <Button className="w-full">Sign In</Button>
                </SignInButton>
              </Unauthenticated>

              <Authenticated>
                <div className="grid grid-cols-2 gap-3">
                  {/* Gaming Hub */}
                  <Button 
                    variant="secondary" 
                    className="flex items-center justify-center gap-2"
                    onClick={handleGamingClick}
                  >
                    <Gamepad2 className="w-4 h-4" />
                    Gaming
                  </Button>

                  {/* Community Quick Post */}
                  <Button 
                    variant="secondary" 
                    className="flex items-center justify-center gap-2"
                    onClick={handleCommunityQuickPostClick}
                  >
                    <Users className="w-4 h-4" />
                    Quick Post
                  </Button>

                  {/* Notifications */}
                  <Button 
                    variant="secondary" 
                    className="flex items-center justify-center gap-2 relative"
                    onClick={handleNotificationsClick}
                  >
                    <Bell className="w-4 h-4" />
                    Notifications
                    {unreadCount && unreadCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                      >
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </Badge>
                    )}
                  </Button>

                  {/* Create */}
                  <Button 
                    className="flex items-center justify-center gap-2"
                    onClick={handleCreateClick}
                  >
                    <Plus className="w-4 h-4" />
                    Create
                  </Button>

                  {/* Profile */}
                  <Button
                    variant="secondary"
                    className="flex items-center justify-center gap-2 col-span-2"
                    onClick={() => {
                      if (user?.username) {
                        navigate(`/u/${user.username}`);
                        setShowMobileMenu(false);
                      }
                    }}
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </Button>
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
    </nav>
  );
};

export default Navbar;