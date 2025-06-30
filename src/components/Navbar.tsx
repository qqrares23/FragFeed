import { Plus, User, Gamepad2, Bell, Menu, X, Settings, Users, UserPlus, Search, Bookmark, History, Home, Compass, TrendingUp } from "lucide-react";
import { FaCrosshairs } from "react-icons/fa";
import { SignInButton, UserButton, useUser } from "@clerk/clerk-react";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const Navbar = () => {
  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [showGamingDropdown, setShowGamingDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCommunityQuickPost, setShowCommunityQuickPost] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  
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

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const handleSavedClick = () => {
    navigate('/saved');
    closeAllDropdowns();
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <TooltipProvider>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
        isScrolled 
          ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl border-b border-slate-200/50 dark:border-slate-700/50' 
          : 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 shadow-lg'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Enhanced Logo with Animation */}
            <Link to="/" className="flex items-center gap-3 group relative">
              <div className={`relative w-10 h-10 bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-500 rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 ease-out shadow-lg group-hover:shadow-xl ${
                isScrolled ? 'shadow-xl' : ''
              }`}>
                <FaCrosshairs className="w-5 h-5 text-white transform group-hover:rotate-180 transition-transform duration-700 ease-in-out" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="hidden sm:block">
                <div className="flex flex-col">
                  <span className="text-xl font-black bg-gradient-to-r from-primary-600 via-secondary-600 to-primary-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
                    FragFeed
                  </span>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 -mt-1 group-hover:text-primary-500 transition-colors duration-300">
                    Share Your World
                  </span>
                </div>
              </div>
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
            </Link>

            {/* Enhanced Search Bar */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-6">
              <SearchBar />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2 relative">
              {/* Navigation Links */}
              <div className="flex items-center gap-1 mr-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className={`relative px-3 py-2 rounded-xl transition-all duration-300 ${
                        isActivePath('/') 
                          ? 'bg-primary-100 text-primary-700 shadow-md' 
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Link to="/">
                        <Home className="w-4 h-4 mr-2" />
                        <span className="font-medium">Home</span>
                        {isActivePath('/') && (
                          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-500 rounded-full" />
                        )}
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Home Feed</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleGamingClick}
                      className={`relative px-3 py-2 rounded-xl transition-all duration-300 ${
                        showGamingDropdown 
                          ? 'bg-green-100 text-green-700 shadow-md scale-105' 
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-105'
                      }`}
                    >
                      <Gamepad2 className="w-4 h-4 mr-2" />
                      <span className="font-medium">Gaming</span>
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Gaming Hub</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              <Unauthenticated>
                <SignInButton mode="modal">
                  <Button className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-semibold px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                    Sign In
                  </Button>
                </SignInButton>
              </Unauthenticated>
              
              <Authenticated>
                {/* User Actions */}
                <div className="flex items-center gap-1">
                  {/* Following */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleFollowingClick}
                        className={`relative rounded-xl transition-all duration-300 ${
                          showFollowing 
                            ? 'bg-blue-100 text-blue-700 shadow-md scale-105' 
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-105'
                        }`}
                      >
                        <UserPlus className="w-5 h-5" />
                        {hasFollowing && (
                          <Badge 
                            variant="secondary" 
                            className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-blue-500 text-white animate-bounce shadow-lg"
                          >
                            {followingCount > 99 ? '99+' : followingCount}
                          </Badge>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Following ({followingCount || 0})</p>
                    </TooltipContent>
                  </Tooltip>

                  {/* Communities */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCommunityQuickPostClick}
                        className={`rounded-xl transition-all duration-300 ${
                          showCommunityQuickPost 
                            ? 'bg-purple-100 text-purple-700 shadow-md scale-105' 
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-105'
                        }`}
                      >
                        <Users className="w-5 h-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Quick Post</p>
                    </TooltipContent>
                  </Tooltip>

                  {/* Notifications */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleNotificationsClick}
                        className={`relative rounded-xl transition-all duration-300 ${
                          showNotifications 
                            ? 'bg-orange-100 text-orange-700 shadow-md scale-105' 
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-105'
                        }`}
                      >
                        <Bell className="w-5 h-5" />
                        {hasUnreadNotifications && (
                          <Badge 
                            variant="destructive" 
                            className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs animate-pulse shadow-lg"
                          >
                            {unreadNotifications > 9 ? '9+' : unreadNotifications}
                          </Badge>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Notifications {hasUnreadNotifications ? `(${unreadNotifications})` : ''}</p>
                    </TooltipContent>
                  </Tooltip>

                  {/* Saved Posts */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className={`rounded-xl transition-all duration-300 ${
                          isActivePath('/saved') 
                            ? 'bg-yellow-100 text-yellow-700 shadow-md scale-105' 
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-105'
                        }`}
                      >
                        <Link to="/saved">
                          <Bookmark className="w-5 h-5" />
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Saved Posts</p>
                    </TooltipContent>
                  </Tooltip>

                  {/* Create */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCreateClick}
                        className={`rounded-xl transition-all duration-300 ${
                          showCreatePanel 
                            ? 'bg-green-100 text-green-700 shadow-md scale-105' 
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-105'
                        }`}
                      >
                        <Plus className="w-5 h-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Create Post</p>
                    </TooltipContent>
                  </Tooltip>

                  {/* Settings */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={handleSettingsClick}
                        className={`rounded-xl transition-all duration-300 ${
                          isActivePath('/settings') 
                            ? 'bg-slate-100 text-slate-700 shadow-md scale-105' 
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-105'
                        }`}
                      >
                        <Settings className="w-5 h-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Settings</p>
                    </TooltipContent>
                  </Tooltip>

                  {/* Profile */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className={`rounded-xl transition-all duration-300 ${
                          isActivePath(`/u/${user?.username}`) 
                            ? 'bg-primary-100 text-primary-700 shadow-md scale-105' 
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-105'
                        }`}
                      >
                        <Link to={`/u/${user?.username || ''}`}>
                          <User className="w-5 h-5" />
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Your Profile</p>
                    </TooltipContent>
                  </Tooltip>

                  {/* User Avatar */}
                  <div className="ml-2 transform hover:scale-105 transition-transform duration-300">
                    <UserButton 
                      appearance={{
                        elements: {
                          avatarBox: "w-10 h-10 rounded-xl ring-2 ring-primary-200 hover:ring-primary-400 transition-all duration-300 shadow-lg hover:shadow-xl"
                        }
                      }}
                    />
                  </div>
                </div>
              </Authenticated>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-3">
              <Authenticated>
                <div className="transform hover:scale-105 transition-transform duration-300">
                  <UserButton 
                    appearance={{
                      elements: {
                        avatarBox: "w-9 h-9 rounded-xl ring-2 ring-primary-200 shadow-lg"
                      }
                    }}
                  />
                </div>
              </Authenticated>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMobileMenu}
                className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 hover:scale-110"
              >
                {showMobileMenu ? (
                  <X className="w-6 h-6 transition-transform duration-300 hover:rotate-90" />
                ) : (
                  <Menu className="w-6 h-6 transition-transform duration-300 hover:rotate-12" />
                )}
              </Button>
            </div>
          </div>

          {/* Enhanced Mobile Menu */}
          {showMobileMenu && (
            <div className="md:hidden border-t border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl animate-in slide-in-from-top-2 duration-300">
              <div className="px-4 py-6 space-y-6">
                {/* Mobile Search */}
                <div className="w-full animate-in slide-in-from-left-2 duration-300" style={{ animationDelay: '100ms' }}>
                  <SearchBar />
                </div>

                <Unauthenticated>
                  <div className="animate-in slide-in-from-left-2 duration-300" style={{ animationDelay: '200ms' }}>
                    <SignInButton mode="modal">
                      <Button className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-semibold py-3 rounded-xl shadow-lg">
                        Sign In to FragFeed
                      </Button>
                    </SignInButton>
                  </div>
                </Unauthenticated>

                <Authenticated>
                  {/* Navigation Links */}
                  <div className="space-y-3">
                    <div className="animate-in slide-in-from-left-2 duration-300" style={{ animationDelay: '250ms' }}>
                      <Button 
                        asChild
                        variant={isActivePath('/') ? "default" : "ghost"}
                        className="w-full justify-start py-3 rounded-xl font-medium"
                      >
                        <Link to="/" onClick={() => setShowMobileMenu(false)}>
                          <Home className="w-5 h-5 mr-3" />
                          Home Feed
                        </Link>
                      </Button>
                    </div>

                    <div className="animate-in slide-in-from-left-2 duration-300" style={{ animationDelay: '300ms' }}>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start py-3 rounded-xl font-medium relative"
                        onClick={handleGamingClick}
                      >
                        <Gamepad2 className="w-5 h-5 mr-3" />
                        Gaming Hub
                        <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      </Button>
                    </div>
                  </div>

                  {/* User Actions Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="animate-in slide-in-from-left-2 duration-300" style={{ animationDelay: '350ms' }}>
                      <Button 
                        variant="secondary" 
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium relative"
                        onClick={handleFollowingClick}
                      >
                        <UserPlus className="w-5 h-5" />
                        Following
                        {hasFollowing && (
                          <Badge 
                            variant="secondary" 
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-blue-500 text-white"
                          >
                            {followingCount > 99 ? '99+' : followingCount}
                          </Badge>
                        )}
                      </Button>
                    </div>

                    <div className="animate-in slide-in-from-left-2 duration-300" style={{ animationDelay: '400ms' }}>
                      <Button 
                        variant="secondary" 
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium"
                        onClick={handleCommunityQuickPostClick}
                      >
                        <Users className="w-5 h-5" />
                        Quick Post
                      </Button>
                    </div>

                    <div className="animate-in slide-in-from-left-2 duration-300" style={{ animationDelay: '450ms' }}>
                      <Button 
                        variant="secondary" 
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium relative"
                        onClick={handleNotificationsClick}
                      >
                        <Bell className="w-5 h-5" />
                        Notifications
                        {hasUnreadNotifications && (
                          <Badge 
                            variant="destructive" 
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs animate-pulse"
                          >
                            {unreadNotifications > 9 ? '9+' : unreadNotifications}
                          </Badge>
                        )}
                      </Button>
                    </div>

                    <div className="animate-in slide-in-from-left-2 duration-300" style={{ animationDelay: '500ms' }}>
                      <Button 
                        asChild
                        variant="secondary" 
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium"
                      >
                        <Link to="/saved" onClick={() => setShowMobileMenu(false)}>
                          <Bookmark className="w-5 h-5" />
                          Saved
                        </Link>
                      </Button>
                    </div>

                    <div className="animate-in slide-in-from-left-2 duration-300" style={{ animationDelay: '550ms' }}>
                      <Button 
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium bg-gradient-to-r from-primary-600 to-secondary-600"
                        onClick={handleCreateClick}
                      >
                        <Plus className="w-5 h-5" />
                        Create
                      </Button>
                    </div>

                    <div className="animate-in slide-in-from-left-2 duration-300" style={{ animationDelay: '600ms' }}>
                      <Button 
                        variant="secondary" 
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium"
                        onClick={handleSettingsClick}
                      >
                        <Settings className="w-5 h-5" />
                        Settings
                      </Button>
                    </div>
                  </div>

                  {/* Profile Link */}
                  <div className="animate-in slide-in-from-left-2 duration-300" style={{ animationDelay: '650ms' }}>
                    <Button
                      asChild
                      variant="outline"
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium border-2 border-primary-200 hover:bg-primary-50"
                    >
                      <Link to={`/u/${user?.username || ''}`} onClick={() => setShowMobileMenu(false)}>
                        <User className="w-5 h-5" />
                        View Profile
                      </Link>
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
        
        <FollowingDropdown
          isOpen={showFollowing}
          onClose={closeAllDropdowns}
        />
      </nav>
    </TooltipProvider>
  );
};

export default Navbar;