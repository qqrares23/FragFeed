import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { User, Users, FileText, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SettingsPage = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  
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

  if (!user) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">Please sign in to access settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Settings</h1>
        
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
                <span className="text-slate-600">Username</span>
                <span className="font-semibold text-slate-900">u/{user.username}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Account Created</span>
                <span className="font-semibold text-slate-900">
                  {new Date(user.createdAt || 0).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Total Posts</span>
                <span className="font-semibold flex items-center gap-1 text-slate-900">
                  <FileText className="w-4 h-4" />
                  {stats?.posts || 0}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Communities Joined</span>
                <span className="font-semibold flex items-center gap-1 text-slate-900">
                  <Users className="w-4 h-4" />
                  {memberships?.length || 0}
                </span>
              </div>
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
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;