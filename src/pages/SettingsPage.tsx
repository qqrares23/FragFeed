import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { User, Users, FileText, Sun, Moon, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "../contexts/ThemeContext";

const SettingsPage = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  
  const stats = useQuery(api.users.getPublicUser, {
    username: user?.username || ""
  });
  const memberships = useQuery(api.subreddit.getUserMemberships, {
    username: user?.username || ""
  });

  const handleEditProfile = () => {
    if (user?.username) {
      navigate(`/u/${user.username}`);
    }
  };

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-400">Please sign in to access settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-8">Settings</h1>
        
        <div className="space-y-6">
          {/* Account Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Account Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Username</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">u/{user.username}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Account Created</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {new Date(user.createdAt || 0).toLocaleDateString()}
                </span>
              </div>
              
              {stats?.posts !== undefined && stats.posts > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">Total Posts</span>
                  <span className="font-semibold flex items-center gap-1 text-slate-900 dark:text-slate-100">
                    <FileText className="w-4 h-4" />
                    {stats.posts}
                  </span>
                </div>
              )}
              
              {memberships && memberships.length > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">Communities Joined</span>
                  <span className="font-semibold flex items-center gap-1 text-slate-900 dark:text-slate-100">
                    <Users className="w-4 h-4" />
                    {memberships.length}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Edit Profile */}
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={handleEditProfile} className="w-full">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </CardContent>
          </Card>

          {/* Theme Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Theme</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Button
                  variant={theme === 'light' ? 'default' : 'outline'}
                  onClick={() => handleThemeChange('light')}
                  className={`flex-1 ${theme === 'light' ? 'bg-slate-900 text-white hover:bg-slate-800' : 'border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white dark:border-slate-100 dark:text-slate-100 dark:hover:bg-slate-100 dark:hover:text-slate-900'}`}
                >
                  <Sun className="w-4 h-4 mr-2" />
                  Light
                </Button>
                <Button
                  variant={theme === 'dark' ? 'default' : 'outline'}
                  onClick={() => handleThemeChange('dark')}
                  className={`flex-1 ${theme === 'dark' ? 'bg-slate-900 text-white hover:bg-slate-800' : 'border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white dark:border-slate-100 dark:text-slate-100 dark:hover:bg-slate-100 dark:hover:text-slate-900'}`}
                >
                  <Moon className="w-4 h-4 mr-2" />
                  Dark
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;