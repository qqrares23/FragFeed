import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { X, Check, Unlink } from "lucide-react";
import { SiEpicgames, SiRiotgames, SiUbisoft } from "react-icons/si";
import { FaSteam } from "react-icons/fa";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface GamingProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GamingProfileModal = ({ isOpen, onClose }: GamingProfileModalProps) => {
  const [activeTab, setActiveTab] = useState<'steam' | 'riot' | 'epic' | 'ubisoft'>('steam');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Form states for each platform
  const [steamData, setSteamData] = useState({
    steamId: "",
    username: "",
    profileUrl: "",
    avatarUrl: ""
  });
  
  const [riotData, setRiotData] = useState({
    riotId: "",
    gameName: "",
    tagLine: ""
  });
  
  const [epicData, setEpicData] = useState({
    epicId: "",
    displayName: ""
  });
  
  const [ubisoftData, setUbisoftData] = useState({
    ubisoftId: "",
    username: ""
  });

  const connectSteam = useMutation(api.users.connectSteamProfile);
  const connectRiot = useMutation(api.users.connectRiotProfile);
  const connectEpic = useMutation(api.users.connectEpicProfile);
  const connectUbisoft = useMutation(api.users.connectUbisoftProfile);
  const disconnectProfile = useMutation(api.users.disconnectGamingProfile);

  const handleSteamConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!steamData.steamId || !steamData.username || !steamData.profileUrl) {
      setError("Steam ID, username, and profile URL are required");
      return;
    }

    setIsLoading(true);
    setError("");
    
    try {
      await connectSteam({
        steamId: steamData.steamId,
        username: steamData.username,
        profileUrl: steamData.profileUrl,
        avatarUrl: steamData.avatarUrl
      });
      setSteamData({ steamId: "", username: "", profileUrl: "", avatarUrl: "" });
    } catch (err: any) {
      setError(err.message || "Failed to connect Steam profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRiotConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!riotData.gameName || !riotData.tagLine) {
      setError("Game name and tag line are required");
      return;
    }

    setIsLoading(true);
    setError("");
    
    try {
      await connectRiot({
        riotId: `${riotData.gameName}#${riotData.tagLine}`,
        gameName: riotData.gameName,
        tagLine: riotData.tagLine
      });
      setRiotData({ riotId: "", gameName: "", tagLine: "" });
    } catch (err: any) {
      setError(err.message || "Failed to connect Riot profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEpicConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!epicData.displayName) {
      setError("Display name is required");
      return;
    }

    setIsLoading(true);
    setError("");
    
    try {
      await connectEpic({
        epicId: epicData.displayName,
        displayName: epicData.displayName
      });
      setEpicData({ epicId: "", displayName: "" });
    } catch (err: any) {
      setError(err.message || "Failed to connect Epic Games profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUbisoftConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ubisoftData.username) {
      setError("Username is required");
      return;
    }

    setIsLoading(true);
    setError("");
    
    try {
      await connectUbisoft({
        ubisoftId: ubisoftData.username,
        username: ubisoftData.username
      });
      setUbisoftData({ ubisoftId: "", username: "" });
    } catch (err: any) {
      setError(err.message || "Failed to connect Ubisoft profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async (platform: 'steam' | 'riot' | 'epic' | 'ubisoft') => {
    setIsLoading(true);
    try {
      await disconnectProfile({ platform });
    } catch (err: any) {
      setError(err.message || "Failed to disconnect profile");
    } finally {
      setIsLoading(false);
    }
  };

  const platforms = [
    { id: 'steam', name: 'Steam', icon: FaSteam, color: 'from-blue-500 to-blue-600' },
    { id: 'riot', name: 'Riot Games', icon: SiRiotgames, color: 'from-red-500 to-red-600' },
    { id: 'epic', name: 'Epic Games', icon: SiEpicgames, color: 'from-gray-700 to-gray-800' },
    { id: 'ubisoft', name: 'Ubisoft', icon: SiUbisoft, color: 'from-blue-600 to-indigo-600' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white p-6 -m-6 mb-6 rounded-t-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">Gaming Profiles</DialogTitle>
            <DialogDescription className="text-white/80">Connect your gaming accounts</DialogDescription>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3 text-red-700">
              <span className="font-medium">{error}</span>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-4">
              {platforms.map((platform) => (
                <TabsTrigger key={platform.id} value={platform.id} className="flex items-center gap-2">
                  <platform.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{platform.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Steam Tab */}
            <TabsContent value="steam">
              <Card>
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FaSteam className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle>Connect Steam</CardTitle>
                  <CardDescription>Link your Steam profile to show your gaming identity</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSteamConnect} className="space-y-4">
                    <div>
                      <Label htmlFor="steam-id">Steam ID or Custom URL</Label>
                      <Input
                        id="steam-id"
                        value={steamData.steamId}
                        onChange={(e) => setSteamData({...steamData, steamId: e.target.value})}
                        placeholder="your_steam_id"
                        disabled={isLoading}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="steam-username">Display Name</Label>
                      <Input
                        id="steam-username"
                        value={steamData.username}
                        onChange={(e) => setSteamData({...steamData, username: e.target.value})}
                        placeholder="Your Steam display name"
                        disabled={isLoading}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="steam-url">Profile URL</Label>
                      <Input
                        id="steam-url"
                        type="url"
                        value={steamData.profileUrl}
                        onChange={(e) => setSteamData({...steamData, profileUrl: e.target.value})}
                        placeholder="https://steamcommunity.com/id/yourprofile"
                        disabled={isLoading}
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Your complete Steam profile URL is required
                      </p>
                    </div>
                    
                    <Button
                      type="submit"
                      disabled={isLoading || !steamData.steamId || !steamData.username || !steamData.profileUrl}
                      className="w-full"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          Connect Steam
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Riot Tab */}
            <TabsContent value="riot">
              <Card>
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <SiRiotgames className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle>Connect Riot Games</CardTitle>
                  <CardDescription>Link your Riot ID for Valorant, League of Legends, and more</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRiotConnect} className="space-y-4">
                    <div>
                      <Label htmlFor="riot-gamename">Game Name</Label>
                      <Input
                        id="riot-gamename"
                        value={riotData.gameName}
                        onChange={(e) => setRiotData({...riotData, gameName: e.target.value})}
                        placeholder="YourGameName"
                        disabled={isLoading}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="riot-tagline">Tag Line</Label>
                      <Input
                        id="riot-tagline"
                        value={riotData.tagLine}
                        onChange={(e) => setRiotData({...riotData, tagLine: e.target.value})}
                        placeholder="TAG"
                        disabled={isLoading}
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Your Riot ID will be: {riotData.gameName}#{riotData.tagLine}
                      </p>
                    </div>
                    
                    <Button
                      type="submit"
                      disabled={isLoading || !riotData.gameName || !riotData.tagLine}
                      className="w-full"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          Connect Riot Games
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Epic Tab */}
            <TabsContent value="epic">
              <Card>
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <SiEpicgames className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle>Connect Epic Games</CardTitle>
                  <CardDescription>Link your Epic Games account for Fortnite, Rocket League, and more</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleEpicConnect} className="space-y-4">
                    <div>
                      <Label htmlFor="epic-displayname">Epic Games Display Name</Label>
                      <Input
                        id="epic-displayname"
                        value={epicData.displayName}
                        onChange={(e) => setEpicData({...epicData, displayName: e.target.value})}
                        placeholder="YourEpicName"
                        disabled={isLoading}
                      />
                    </div>
                    
                    <Button
                      type="submit"
                      disabled={isLoading || !epicData.displayName}
                      className="w-full"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          Connect Epic Games
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Ubisoft Tab */}
            <TabsContent value="ubisoft">
              <Card>
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <SiUbisoft className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle>Connect Ubisoft</CardTitle>
                  <CardDescription>Link your Ubisoft account for Rainbow Six Siege, Assassin's Creed, and more</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUbisoftConnect} className="space-y-4">
                    <div>
                      <Label htmlFor="ubisoft-username">Ubisoft Username</Label>
                      <Input
                        id="ubisoft-username"
                        value={ubisoftData.username}
                        onChange={(e) => setUbisoftData({...ubisoftData, username: e.target.value})}
                        placeholder="YourUbisoftUsername"
                        disabled={isLoading}
                      />
                    </div>
                    
                    <Button
                      type="submit"
                      disabled={isLoading || !ubisoftData.username}
                      className="w-full"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          Connect Ubisoft
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GamingProfileModal;