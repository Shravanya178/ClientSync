import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { db } from "../services/firebase";
import { 
  Bell, 
  AlertTriangle, 
  Info, 
  CheckCircle,
  Clock
} from "lucide-react";

const NotificationsCompact = ({ user }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const notificationsQuery = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const notificationsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      }));
      setNotifications(notificationsList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const getNotificationIcon = (type, priority) => {
    const iconClass = `w-4 h-4 ${
      priority === 'high' ? 'text-red-500' : 
      priority === 'medium' ? 'text-yellow-500' : 
      'text-blue-500'
    }`;

    switch (type) {
      case 'deadline':
        return <AlertTriangle className={iconClass} />;
      case 'update':
        return <Info className={iconClass} />;
      case 'completed':
        return <CheckCircle className={iconClass} />;
      default:
        return <Bell className={iconClass} />;
    }
  };

  const formatDate = (date) => {
    if (!date) return "Just now";
    const now = new Date();
    const diffInHours = Math.abs(now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <span className="mr-2">🔔</span>
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Stay updated with important alerts
          </p>
        </div>
        
        {unreadCount > 0 && (
          <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
            Mark all read
          </button>
        )}
      </div>

      {/* Notifications List - Compact */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bell className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          notifications.slice(0, 5).map((notification) => (
            <div
              key={notification.id}
              className={`flex items-start space-x-3 p-3 rounded-lg transition-colors ${
                !notification.read 
                  ? 'bg-blue-50 border border-blue-200' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {getNotificationIcon(notification.type, notification.priority)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className={`text-sm font-medium ${
                      !notification.read ? 'text-gray-900' : 'text-gray-700'
                    }`}>
                      {notification.title}
                    </h4>
                    {notification.message && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 ml-3">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {formatDate(notification.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        
        {notifications.length > 5 && (
          <div className="text-center pt-2">
            <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
              View all notifications ({notifications.length})
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsCompact;
