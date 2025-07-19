import React, { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import {
  LogOut,
  User,
  Users,
  FolderOpen,
  Plus,
  Settings,
} from "lucide-react";
import AdminUpdates from "./AdminUpdates";
import AdminDeliverables from "./AdminDeliverables";
import AdminTickets from "./AdminTickets";
import ClientManagement from "./ClientManagement";

const AdminDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState("clients");
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedProject, setSelectedProject] = useState("");

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const tabs = [
    { id: "clients", label: "Client Management", icon: <Users className="w-4 h-4" /> },
    { id: "updates", label: "Updates", icon: "📰" },
    { id: "deliverables", label: "Deliverables", icon: "✅" },
    { id: "tickets", label: "Tickets", icon: "🎫" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-red-600">ClientSync</h1>
              <span className="ml-2 text-sm text-gray-500 bg-red-100 px-2 py-1 rounded-full">
                Admin Dashboard
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-red-600" />
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
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-xl text-white p-6 mb-8 fade-in">
          <h2 className="text-2xl font-bold mb-2">
            Admin Dashboard 🔧
          </h2>
          <p className="text-red-100">
            Manage clients, projects, deliverables, and communications from one central location.
          </p>
        </div>

        {/* Client & Project Selection Bar */}
        {activeTab !== "clients" && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Selected Client
                </label>
                <div className="text-lg font-semibold text-gray-900">
                  {selectedClient || "No client selected"}
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Selected Project
                </label>
                <div className="text-lg font-semibold text-gray-900">
                  {selectedProject || "No project selected"}
                </div>
              </div>
              <button
                onClick={() => setActiveTab("clients")}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center space-x-2"
              >
                <Settings className="w-4 h-4" />
                <span>Change Selection</span>
              </button>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-white text-red-600 shadow-sm"
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
          {activeTab === "clients" && (
            <ClientManagement 
              user={user} 
              onClientSelect={setSelectedClient}
              onProjectSelect={setSelectedProject}
              selectedClient={selectedClient}
              selectedProject={selectedProject}
            />
          )}
          {activeTab === "updates" && (
            <AdminUpdates 
              user={user} 
              selectedClient={selectedClient}
              selectedProject={selectedProject}
            />
          )}
          {activeTab === "deliverables" && (
            <AdminDeliverables 
              user={user} 
              selectedClient={selectedClient}
              selectedProject={selectedProject}
            />
          )}
          {activeTab === "tickets" && (
            <AdminTickets 
              user={user} 
              selectedClient={selectedClient}
              selectedProject={selectedProject}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
