// Dashboard component placeholder
import React, { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import {
  LogOut,
  User,
  Shield,
  Users,
} from "lucide-react";
import Updates from "./Updates";
import Deliverables from "./Deliverables";
import TicketForm from "./TicketForm";
import Notifications from "./Notifications";
import AdminHelpRequests from "./AdminHelpRequests";
import MessagingHub from "./MessagingHub";
import FileUploadManager from "./FileUploadManager";
import ProgressTracker from "./ProgressTracker";

const Dashboard = ({ user, userRole }) => {
  const [activeTab, setActiveTab] = useState("updates");
  const isAdmin = userRole === "admin";

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const tabs = [
    { id: "updates", label: "Updates", icon: "📰" },
    { id: "progress", label: "Progress", icon: "📊" },
    { id: "deliverables", label: "Deliverables", icon: "✅" },
    { id: "files", label: "File Manager", icon: "📁" },
    { id: "messaging", label: "Messages", icon: "💬" },
    { id: "tickets", label: "Support", icon: "🎫" },
    { id: "notifications", label: "Notifications", icon: "🔔" },
    ...(isAdmin ? [{ id: "help-requests", label: "Help Requests", icon: "🆘" }] : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600">ClientSync</h1>
              <div className="ml-4 flex items-center">
                {isAdmin ? (
                  <div className="flex items-center text-red-600">
                    <Shield className="w-4 h-4 mr-1" />
                    <span className="text-sm font-medium">Admin Portal</span>
                  </div>
                ) : (
                  <div className="flex items-center text-indigo-600">
                    <Users className="w-4 h-4 mr-1" />
                    <span className="text-sm font-medium">Client Portal</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isAdmin ? "bg-red-100" : "bg-indigo-100"
                  }`}>
                    <User className={`w-5 h-5 ${
                      isAdmin ? "text-red-600" : "text-indigo-600"
                    }`} />
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-700">
                      {user.displayName || user.email}
                    </div>
                    <div className={`text-xs ${
                      isAdmin ? "text-red-600" : "text-indigo-600"
                    }`}>
                      {isAdmin ? "Administrator" : "Client"}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 px-3 py-2 rounded-md hover:bg-gray-100"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className={`bg-gradient-to-r rounded-xl text-white p-6 mb-8 fade-in ${
          isAdmin 
            ? "from-red-500 to-pink-600" 
            : "from-indigo-500 to-purple-600"
        }`}>
          <h2 className="text-2xl font-bold mb-2">
            Welcome back, {user.displayName || (isAdmin ? "Admin" : "Client")}! 👋
          </h2>
          <p className={isAdmin ? "text-red-100" : "text-indigo-100"}>
            {isAdmin 
              ? "Manage clients, projects, and deliverables from your admin dashboard."
              : "Stay updated on your project progress and manage your requests."
            }
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? `bg-white shadow-sm ${
                        isAdmin ? "text-red-600" : "text-indigo-600"
                      }`
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="fade-in">
          {activeTab === "updates" && (
            <Updates user={user} isAdminView={isAdmin} />
          )}
          {activeTab === "progress" && (
            <ProgressTracker user={user} isAdminView={isAdmin} />
          )}
          {activeTab === "deliverables" && (
            <Deliverables user={user} isAdminView={isAdmin} />
          )}
          {activeTab === "files" && (
            <FileUploadManager user={user} isAdminView={isAdmin} />
          )}
          {activeTab === "messaging" && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200" style={{ height: "600px" }}>
              <MessagingHub user={user} />
            </div>
          )}
          {activeTab === "tickets" && (
            <TicketForm user={user} isAdminView={isAdmin} />
          )}
          {activeTab === "notifications" && <Notifications user={user} />}
          {activeTab === "help-requests" && isAdmin && (
            <AdminHelpRequests user={user} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
