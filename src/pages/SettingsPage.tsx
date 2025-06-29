import { useUser } from "@clerk/clerk-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect } from "react";
import { 
  Settings, 
  User, 
  Calendar, 
  FileText, 
  Users, 
  Moon, 
  Sun,
  Shield,
  Bell,
  Palette,
  Info,
  Eye,
  EyeOff,
  Sword,
  Gamepad2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type ThemeMode = 'light' | 'dark';

const SettingsPage = () => {
  const { user } = useUser();
  const [theme, setTheme] = useState<ThemeMode>('light');
  
  // Get user stats and memberships
  const stats = useQuery(
    api.users.getPublicUser, 
    user?.username ? { username: user.username } : "skip"
  );
  const memberships = useQuery(
    api.subreddit.getUserMemberships, 
    user?.username ? { username: user.username } : "skip"
  );
  const userSettings = useQuery(api.users.getUserSettings);

  // Mutations
  const updateOnlineStatus = useMutation(api.users.updateOnlineStatus);
  const updatePrivacySettings = useMutation(api.users.updatePrivacySettings);
  const updateNotificationSettings = useMutation(api.users.updateNotificationSettings);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('fragfeed-theme') as ThemeMode;
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    }
  }, []);

  // Update online status when component mounts/unmounts
  useEffect(() => {
    if (user) {
      updateOnlineStatus({ isOnline: true });
      
      // Set user offline when they leave the page
      const handleBeforeUnload = () => {
        updateOnlineStatus({ isOnline: false });
      };
      
      const handleVisibilityChange = () => {
        if (document.hidden) {
          updateOnlineStatus({ isOnline: false });
        } else {
          updateOnlineStatus({ isOnline: true });
        }
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        updateOnlineStatus({ isOnline: false });
        window.removeEventListener('beforeunload', handleBeforeUnload);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [user, updateOnlineStatus]);

  const applyTheme = (newTheme: ThemeMode) => {
    const root = document.documentElement;
    
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    localStorage.setItem('fragfeed-theme', newTheme);
    applyTheme(newTheme);
  };

  const handlePrivacyToggle = async (setting: 'showOnlineStatus' | 'profileVisibility', value: boolean | string) => {
    try {
      await updatePrivacySettings({
        [setting]: value
      });
    } catch (error) {
      console.error('Failed to update privacy settings:', error);
    }
  };

  const handleNotificationToggle = async (setting: 'newPosts' | 'comments' | 'mentions' | 'communityUpdates', value: boolean) => {
    try {
      await updateNotificationSettings({
        [setting]: value
      });
    } catch (error) {
      console.error('Failed to update notification settings:', error);
    }
  };

  const formatJoinDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getThemeIcon = (themeMode: ThemeMode) => {
    switch (themeMode) {
      case 'light': return <Sun className="w-4 h-4" />;
      case 'dark': return <Moon className="w-4 h-4" />;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <Card className="p-8 text-center">
          <Shield className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-600">You need to be signed in to access settings.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Settings</h1>
              <p className="text-slate-600 dark:text-slate-400">Manage your account and preferences</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary-600" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Section */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={stats?.profilePictureUrl} />
                      <AvatarFallback className="text-lg">
                        <User className="w-8 h-8" />
                      </AvatarFallback>
                    </Avatar>
                    {/* Online Status Indicator */}
                    {userSettings?.showOnlineStatus && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800">
                        <Sword className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">u/{user.username}</h3>
                    <p className="text-slate-600 dark:text-slate-400">{user.primaryEmailAddress?.emailAddress}</p>
                    {stats?.bio && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{stats.bio}</p>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Account Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Member Since</p>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                          {formatJoinDate(user.createdAt || Date.now())}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Total Posts</p>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{stats?.posts || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Appearance Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-primary-600" />
                  Appearance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Theme</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {(['light', 'dark'] as ThemeMode[]).map((themeMode) => (
                        <Button
                          key={themeMode}
                          variant={theme === themeMode ? "default" : "outline"}
                          onClick={() => handleThemeChange(themeMode)}
                          className="flex flex-col items-center gap-2 h-auto py-4"
                        >
                          {getThemeIcon(themeMode)}
                          <span className="capitalize text-sm">{themeMode}</span>
                        </Button>
                      ))}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                      Choose how FragFeed looks to you.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Privacy & Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary-600" />
                  Privacy & Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-slate-100">Profile Visibility</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Control who can see your profile</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePrivacyToggle('profileVisibility', 
                      userSettings?.profileVisibility === 'public' ? 'private' : 'public'
                    )}
                  >
                    {userSettings?.profileVisibility === 'public' ? (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        Public
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-4 h-4 mr-2" />
                        Private
                      </>
                    )}
                  </Button>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-slate-100">Online Status</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Show gaming sword when you're active</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePrivacyToggle('showOnlineStatus', !userSettings?.showOnlineStatus)}
                  >
                    {userSettings?.showOnlineStatus ? (
                      <>
                        <Sword className="w-4 h-4 mr-2 text-green-600" />
                        Visible
                      </>
                    ) : (
                      <>
                        <Gamepad2 className="w-4 h-4 mr-2 text-slate-400" />
                        Hidden
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary-600" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-slate-100">New Posts</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Get notified about new posts in your communities</p>
                  </div>
                  <Button
                    variant={userSettings?.notificationSettings?.newPosts ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleNotificationToggle('newPosts', !userSettings?.notificationSettings?.newPosts)}
                  >
                    {userSettings?.notificationSettings?.newPosts ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-slate-100">Comments</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Get notified when someone comments on your posts</p>
                  </div>
                  <Button
                    variant={userSettings?.notificationSettings?.comments ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleNotificationToggle('comments', !userSettings?.notificationSettings?.comments)}
                  >
                    {userSettings?.notificationSettings?.comments ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>

                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-slate-100">Mentions</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Get notified when someone mentions you</p>
                  </div>
                  <Button
                    variant={userSettings?.notificationSettings?.mentions ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleNotificationToggle('mentions', !userSettings?.notificationSettings?.mentions)}
                  >
                    {userSettings?.notificationSettings?.mentions ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>

                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-slate-100">Community Updates</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Get notified about community announcements</p>
                  </div>
                  <Button
                    variant={userSettings?.notificationSettings?.communityUpdates ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleNotificationToggle('communityUpdates', !userSettings?.notificationSettings?.communityUpdates)}
                  >
                    {userSettings?.notificationSettings?.communityUpdates ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Communities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary-600" />
                  Your Communities
                </CardTitle>
              </CardHeader>
              <CardContent>
                {memberships && memberships.length > 0 ? (
                  <div className="space-y-3">
                    <div className="text-center mb-4">
                      <div className="text-2xl font-bold text-primary-600">{memberships.length}</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        Communit{memberships.length === 1 ? 'y' : 'ies'} Joined
                      </div>
                    </div>
                    
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {memberships.slice(0, 5).map((membership) => (
                        <div key={membership._id} className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-xs">
                              {membership.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-900 dark:text-slate-100 text-sm truncate">
                              r/{membership.name}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Joined {new Date(membership.joinedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {memberships.length > 5 && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                        +{memberships.length - 5} more communities
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 dark:text-slate-400 font-medium">No communities joined</p>
                    <p className="text-sm text-slate-400 mt-1">
                      Join communities to start participating
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-primary-600" />
                  Account Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <User className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="w-4 h-4 mr-2" />
                  Privacy Settings
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Download Data
                </Button>
                
                <Separator />
                
                <Button variant="destructive" className="w-full justify-start">
                  Delete Account
                </Button>
              </CardContent>
            </Card>

            {/* App Info */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto">
                    <Settings className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">FragFeed</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Version 1.0.0</p>
                  <p className="text-xs text-slate-400">
                    Built with ❤️ for gamers
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;