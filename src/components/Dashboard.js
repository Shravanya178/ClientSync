// Dashboard component placeholder
import React, { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import {
  LogOut,
  User,
} from "lucide-react";
import Updates from "./Updates";
import Deliverables from "./Deliverables";
import TicketForm from "./TicketForm";
import Notifications from "./Notifications";

const Dashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState("updates");

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const tabs = [
    { id: "updates", label: "Updates", icon: "📰" },
    { id: "deliverables", label: "Deliverables", icon: "✅" },
    { id: "tickets", label: "Tickets", icon: "🎫" },
    { id: "notifications", label: "Notifications", icon: "🔔" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600">ClientSync</h1>
              <span className="ml-2 text-sm text-gray-500">Client Portal</span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-indigo-600" />
                  </div>
                  <span className="text-sm text-gray-700">
                    {user.displayName || user.email}
                  </span>
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
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-white p-6 mb-8 fade-in">
          <h2 className="text-2xl font-bold mb-2">
            Welcome back, {user.displayName || "Client"}! 👋
          </h2>
          <p className="text-indigo-100">
            Stay updated on your project progress and manage your requests.
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
                    ? "bg-white text-indigo-600 shadow-sm"
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
            <Updates user={user} />
          )}
          {activeTab === "deliverables" && (
            <Deliverables user={user} />
          )}
          {activeTab === "tickets" && (
            <TicketForm user={user} />
          )}
          {activeTab === "notifications" && <Notifications user={user} />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
