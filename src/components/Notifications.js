import React, { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  updateDoc,
  doc,
  getDocs,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../services/firebase";
import emailjs from "@emailjs/browser";
import {
  Bell,
  Check,
  CheckCheck,
  Clock,
  Calendar,
  MessageSquare,
  FileText,
  Settings,
  X
} from "lucide-react";

const Notifications = ({ user }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const createDeadlineNotification = useCallback(async (deliverable, timeDiff) => {
    const hoursLeft = Math.floor(timeDiff / (1000 * 60 * 60));

    const notificationData = {
      userId: user.uid,
      type: "deadline",
      title: "Upcoming Deadline",
      message: `"${deliverable.title}" is due in ${hoursLeft} hours`,
      read: false,
      priority: hoursLeft <= 2 ? "High" : "Medium",
      createdAt: new Date(),
      relatedId: deliverable.id,
      relatedType: "deliverable",
    };

    try {
      await addDoc(collection(db, "notifications"), notificationData);
      console.log(`Deadline notification created for ${deliverable.title}`);
    } catch (error) {
      console.error("Error creating notification:", error);
    }
  }, [user?.uid]);

  const sendDeadlineEmail = useCallback(async (deliverable, timeDiff) => {
    const hoursLeft = Math.floor(timeDiff / (1000 * 60 * 60));

    const templateParams = {
      to_email: user.email,
      name: user.displayName || "Client",
      deliverable_name: deliverable.title,
      due_date: deliverable.deadline.toDate().toLocaleString(),
      dashboard_link: window.location.origin,
      email: "support@clientsync.com",
      hours_left: hoursLeft
    };

    try {
      if (process.env.REACT_APP_EMAILJS_SERVICE_ID) {
        await emailjs.send(
          process.env.REACT_APP_EMAILJS_SERVICE_ID,
          process.env.REACT_APP_EMAILJS_DEADLINE_TEMPLATE_ID,
          templateParams,
          process.env.REACT_APP_EMAILJS_PUBLIC_KEY
        );
        console.log("Deadline email sent successfully");
      }
    } catch (error) {
      console.error("Error sending deadline email:", error);
    }
  }, [user?.email, user?.displayName]);

  const checkUpcomingDeadlines = useCallback(async () => {
    if (!user) return;

    try {
      const deliverablesQuery = query(
        collection(db, "deliverables"),
        where("clientId", "==", user.uid)
      );

      const snapshot = await getDocs(deliverablesQuery);
      const now = new Date();
      const twentyFourHours = 24 * 60 * 60 * 1000;

      snapshot.docs.forEach(async (deliverableDoc) => {
        const deliverable = deliverableDoc.data();
        if (deliverable.deadline && deliverable.status !== "Completed") {
          const deadline = deliverable.deadline.toDate();
          const timeDiff = deadline.getTime() - now.getTime();

          if (
            timeDiff > 0 &&
            timeDiff <= twentyFourHours &&
            !deliverable.notificationSent
          ) {
            await createDeadlineNotification(deliverable, timeDiff);
            await sendDeadlineEmail(deliverable, timeDiff);

            await updateDoc(doc(db, "deliverables", deliverableDoc.id), {
              notificationSent: true,
            });
          }
        }
      });
    } catch (error) {
      console.error("Error checking deadlines:", error);
    }
  }, [user, createDeadlineNotification, sendDeadlineEmail]);

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

    checkUpcomingDeadlines();

    return () => unsubscribe();
  }, [user, checkUpcomingDeadlines]);

  const markAsRead = async (notificationId) => {
    try {
      await updateDoc(doc(db, "notifications", notificationId), {
        read: true,
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter((n) => !n.read);

    try {
      const promises = unreadNotifications.map((notification) =>
        updateDoc(doc(db, "notifications", notification.id), { read: true })
      );
      await Promise.all(promises);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await deleteDoc(doc(db, "notifications", notificationId));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "text-red-600 bg-red-100 border-red-200";
      case "Medium":
        return "text-yellow-600 bg-yellow-100 border-yellow-200";
      case "Low":
        return "text-green-600 bg-green-100 border-green-200";
      default:
        return "text-gray-600 bg-gray-100 border-gray-200";
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "deadline":
        return <Clock className="w-4 h-4" />;
      case "message":
        return <MessageSquare className="w-4 h-4" />;
      case "deliverable":
        return <FileText className="w-4 h-4" />;
      case "system":
        return <Settings className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "all") return true;
    if (filter === "unread") return !notification.read;
    if (filter === "read") return notification.read;
    return notification.type === filter;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Add some sample notifications for demonstration
  useEffect(() => {
    if (notifications.length === 0 && !loading) {
      const sampleNotifications = [
        {
          id: "sample-1",
          type: "system",
          title: "Welcome to ClientSync!",
          message: "Your notification system is working perfectly. You'll receive updates about deadlines, messages, and important project updates here.",
          read: false,
          priority: "Medium",
          createdAt: new Date(),
          relatedType: "system",
        },
        {
          id: "sample-2",
          type: "deadline",
          title: "Project Deadline Reminder",
          message: "Website redesign project is due in 2 days. Please review the latest updates.",
          read: false,
          priority: "High",
          createdAt: new Date(Date.now() - 3600000), // 1 hour ago
          relatedType: "deliverable",
        }
      ];
      setNotifications(sampleNotifications);
    }
  }, [notifications.length, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
          <p className="text-gray-600">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : "All caught up!"}
          </p>
        </div>
        
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All Read</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: "all", label: "All", count: notifications.length },
          { id: "unread", label: "Unread", count: unreadCount },
          { id: "deadline", label: "Deadlines", count: notifications.filter(n => n.type === 'deadline').length },
          { id: "message", label: "Messages", count: notifications.filter(n => n.type === 'message').length },
        ].map((filterOption) => (
          <button
            key={filterOption.id}
            onClick={() => setFilter(filterOption.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
              filter === filterOption.id
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <span>{filterOption.label}</span>
            <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs">
              {filterOption.count}
            </span>
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {filteredNotifications.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-600">
              {filter === "all" 
                ? "You're all caught up! No notifications to show."
                : `No ${filter} notifications found.`
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-6 hover:bg-gray-50 transition-colors ${
                  !notification.read ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-2 rounded-lg ${
                    !notification.read ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-600"
                  }`}>
                    {getTypeIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className={`text-sm font-medium ${
                            !notification.read ? "text-gray-900" : "text-gray-700"
                          }`}>
                            {notification.title}
                          </h4>
                          
                          {notification.priority && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                              getPriorityColor(notification.priority)
                            }`}>
                              {notification.priority}
                            </span>
                          )}
                          
                          {!notification.read && (
                            <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="w-3 h-3 mr-1" />
                          <span>
                            {notification.createdAt?.toLocaleString() || "Unknown time"}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-1 text-gray-400 hover:text-indigo-600"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                          title="Delete notification"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Test Notification Button */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Notifications</h3>
        <button
          onClick={async () => {
            try {
              await addDoc(collection(db, "notifications"), {
                userId: user.uid,
                type: "system",
                title: "Test Notification",
                message: "This is a test notification to verify the system is working correctly.",
                read: false,
                priority: "Medium",
                createdAt: new Date(),
                relatedType: "system",
              });
            } catch (error) {
              console.error("Error creating test notification:", error);
              // Add to local state as fallback
              const testNotification = {
                id: `test-${Date.now()}`,
                type: "system",
                title: "Test Notification",
                message: "This is a test notification to verify the system is working correctly.",
                read: false,
                priority: "Medium",
                createdAt: new Date(),
                relatedType: "system",
              };
              setNotifications(prev => [testNotification, ...prev]);
            }
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          Create Test Notification
        </button>
      </div>
    </div>
  );
};

export default Notifications;
