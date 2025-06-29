import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { FaBell, FaCheck, FaEye, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationDropdown = ({ isOpen, onClose }: NotificationDropdownProps) => {
  const notifications = useQuery(api.notifications.getUserNotifications, { limit: 10 });
  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);

  if (!isOpen) return null;

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

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-full mt-2 w-96 max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 z-50 max-h-96 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FaBell className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-slate-900">Notifications</h3>
          </div>
          <div className="flex items-center gap-2">
            {notifications && notifications.some(n => !n.read) && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                title="Mark all as read"
              >
                <FaCheck className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-80 overflow-y-auto">
          {!notifications || notifications.length === 0 ? (
            <div className="p-8 text-center">
              <FaBell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No notifications yet</p>
              <p className="text-sm text-slate-400 mt-1">
                You'll see notifications here when someone posts in your communities
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 hover:bg-slate-50 transition-colors ${
                    !notification.read ? 'bg-primary-50/50' : ''
                  }`}
                >
                  <Link
                    to={getNotificationLink(notification)}
                    onClick={onClose}
                    className="block"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                        !notification.read ? 'bg-primary-500' : 'bg-transparent'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 text-sm">
                          {notification.title}
                        </p>
                        <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-slate-400 mt-2">
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
                          className="text-primary-600 hover:text-primary-700 p-1"
                          title="Mark as read"
                        >
                          <FaEye className="w-3 h-3" />
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
    </>
  );
};

export default NotificationDropdown;