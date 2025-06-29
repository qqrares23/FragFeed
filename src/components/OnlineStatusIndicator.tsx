import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Sword, Gamepad2 } from "lucide-react";

interface OnlineStatusIndicatorProps {
  username: string;
  className?: string;
}

const OnlineStatusIndicator = ({ username, className = "" }: OnlineStatusIndicatorProps) => {
  const userStats = useQuery(api.users.getPublicUser, { username });

  // Don't show indicator if user has privacy settings disabled
  if (!userStats?.showOnlineStatus) {
    return null;
  }

  // Show green sword if online, gray gamepad if offline
  if (userStats?.isOnline) {
    return (
      <div className={`absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800 ${className}`}>
        <Sword className="w-3 h-3 text-white" />
      </div>
    );
  } else {
    return (
      <div className={`absolute -bottom-1 -right-1 w-6 h-6 bg-slate-400 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800 ${className}`}>
        <Gamepad2 className="w-3 h-3 text-white" />
      </div>
    );
  }
};

export default OnlineStatusIndicator;