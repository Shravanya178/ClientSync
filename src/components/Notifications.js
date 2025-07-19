// Notifications component placeholder
import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  updateDoc,
  doc,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../services/firebase";
import emailjs from "@emailjs/browser";

const Notifications = () => {
  const [user] = useAuthState(auth);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!user) return;

    // Listen for real-time notifications
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

    // Check for upcoming deadlines
    checkUpcomingDeadlines();

    return () => unsubscribe();
  }, [user]);

  const checkUpcomingDeadlines = async () => {
    if (!user) return;

    try {
      const deliverablesQuery = query(
        collection(db, "deliverables"),
        where("clientId", "==", user.uid),
        where("status", "!=", "Completed")
      );

      const snapshot = await getDocs(deliverablesQuery);
      const now = new Date();
      const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

      snapshot.docs.forEach(async (deliverableDoc) => {
        const deliverable = deliverableDoc.data();
        if (deliverable.deadline) {
          const deadline = deliverable.deadline.toDate();
          const timeDiff = deadline.getTime() - now.getTime();

          // If deadline is within 24 hours and not already notified
          if (
            timeDiff > 0 &&
            timeDiff <= twentyFourHours &&
            !deliverable.notificationSent
          ) {
            await createDeadlineNotification(deliverable, timeDiff);
            await sendDeadlineEmail(deliverable, timeDiff);

            // Mark as notified
            await updateDoc(doc(db, "deliverables", deliverableDoc.id), {
              notificationSent: true,
            });
          }
        }
      });
    } catch (error) {
      console.error("Error checking deadlines:", error);
    }
  };

  const createDeadlineNotification = async (deliverable, timeDiff) => {
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
    } catch (error) {
      console.error("Error creating notification:", error);
    }
  };

  const sendDeadlineEmail = async (deliverable, timeDiff) => {
    const hoursLeft = Math.floor(timeDiff / (1000 * 60 * 60));

    const templateParams = {
      to_email: user.email, // recipient
      name: user.displayName || "Client", // client name
      deliverable_name: deliverable.title, // deliverable name
      due_date: deliverable.deadline.toDate().toLocaleString(), // due date
      dashboard_link: "https://clientsync-77fd5.firebaseapp.com/dashboard", // update as needed
      email: "support@clientsync.com", // reply-to (can be your support email or user's email)
    };

    try {
      await emailjs.send(
        process.env.REACT_APP_EMAILJS_SERVICE_ID,
        process.env.REACT_APP_EMAILJS_DEADLINE_TEMPLATE_ID,
        templateParams,
        process.env.REACT_APP_EMAILJS_PUBLIC_KEY
      );
      console.log("Deadline email sent successfully");
    } catch (error) {
      console.error("Error sending deadline email:", error);
    }
  };

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

  const getNotificationIcon = (type, priority) => {
    const iconClass =
      priority === "High"
        ? "text-red-500"
        : priority === "Medium"
        ? "text-yellow-500"
        : "text-blue-500";

    switch (type) {
      case "deadline":
        return (
          <svg
            className={`w-6 h-6 ${iconClass}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "update":
        return (
          <svg
            className={`w-6 h-6 ${iconClass}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "ticket":
        return (
          <svg
            className={`w-6 h-6 ${iconClass}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
            />
          </svg>
        );
      default:
        return (
          <svg
            className={`w-6 h-6 ${iconClass}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-5 5v-5zM4 17v5h5M4 7V2h5M20 7V2h-5"
            />
          </svg>
        );
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "unread") return !notification.read;
    if (filter === "read") return notification.read;
    return true; // 'all'
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-5 5v-5zM4 17v5h5M4 7V2h5M20 7V2h-5"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Notifications
              </h2>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-600">
                  {unreadCount} unread notifications
                </p>
              )}
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 mt-4">
          {[
            { key: "all", label: "All", count: notifications.length },
            { key: "unread", label: "Unread", count: unreadCount },
            {
              key: "read",
              label: "Read",
              count: notifications.length - unreadCount,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === tab.key
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <svg
              className="w-12 h-12 text-gray-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-5 5v-5zM4 17v5h5M4 7V2h5M20 7V2h-5"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No notifications
            </h3>
            <p className="text-gray-500">
              {filter === "unread"
                ? "All caught up! No unread notifications."
                : "You have no notifications at the moment."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  !notification.read
                    ? "bg-blue-50 border-l-4 border-l-blue-500"
                    : ""
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(
                      notification.type,
                      notification.priority
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4
                        className={`text-sm font-medium ${
                          !notification.read ? "text-gray-900" : "text-gray-700"
                        }`}
                      >
                        {notification.title}
                      </h4>
                      <div className="flex items-center space-x-2 ml-4">
                        {notification.priority && (
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              notification.priority === "High"
                                ? "bg-red-100 text-red-800"
                                : notification.priority === "Medium"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {notification.priority}
                          </span>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                          title="Delete notification"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <p
                      className={`mt-1 text-sm ${
                        !notification.read ? "text-gray-800" : "text-gray-600"
                      }`}
                    >
                      {notification.message}
                    </p>
                  </div>
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  {notification.createdAt &&
                    notification.createdAt.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
