import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Bell, Check, Eye, UserPlus, MessageSquare, Users } from "lucide-react";
import { Link } from "react-router-dom";

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationDropdown = ({ isOpen, onClose }: NotificationDropdownProps) => {
  const notifications = useQuery(api.notifications.getUserNotifications, { limit: 10 });
  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead({ notificationId: notificationId as any });
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead({});
  };

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const getNotificationLink = (notification: any) => {
    if (notification.postId) {
      return `/post/${notification.postId}`;
    }
    if (notification.subredditId) {
      return `/r/${notification.subredditId}`;
    }
    return '#';
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_follower':
        return <UserPlus className="w-4 h-4 text-blue-500" />;
      case 'follower_post':
        return <MessageSquare className="w-4 h-4 text-green-500" />;
      case 'new_post':
        return <Users className="w-4 h-4 text-purple-500" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-16 right-4 w-96 max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 max-h-96 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-t-2xl">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          <h3 className="font-semibold">Notifications</h3>
        </div>
        <div className="flex items-center gap-2">
          {notifications && notifications.some(n => !n.read) && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-white hover:bg-white/20 rounded-lg px-2 py-1 text-xs transition-colors"
            >
              <Check className="w-4 h-4 inline mr-1" />
              Mark All Read
            </button>
          )}
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
          >
            ×
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-80 overflow-y-auto">
        {!notifications || notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">No notifications yet</p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
              You'll see notifications here when someone follows you or posts in your communities
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
                  !notification.read ? 'bg-primary-50/50 dark:bg-primary-900/20' : ''
                }`}
              >
                <Link
                  to={getNotificationLink(notification)}
                  onClick={onClose}
                  className="block"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      !notification.read ? 'bg-primary-500' : 'bg-transparent'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 dark:text-slate-100 text-sm">
                        {notification.title}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                        {formatTimeAgo(notification.createdAt)}
                      </p>
                    </div>
                    {!notification.read && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleMarkAsRead(notification._id);
                        }}
                        className="p-1 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;