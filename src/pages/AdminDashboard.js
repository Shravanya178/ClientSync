import React, { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import {
  LogOut,
  User,
  Users,
  FolderOpen,
  Plus,
  Settings,
  MessageSquare,
} from "lucide-react";
import AdminUpdates from "./AdminUpdates";
import AdminDeliverables from "./AdminDeliverables";
import AdminTickets from "./AdminTickets";
import ClientManagement from "./ClientManagement";
import Messages from "./Messages";

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
    { id: "messages", label: "Messages", icon: <MessageSquare className="w-4 h-4" /> },
    { id: "updates", label: "Updates", icon: <FolderOpen className="w-4 h-4" /> },
    { id: "deliverables", label: "Deliverables", icon: <Plus className="w-4 h-4" /> },
    { id: "tickets", label: "Tickets", icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Top Navbar */}
      <header className="bg-white shadow-sm border-b border-black sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-red-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-sm">CS</span>
              </div>
              <h1 className="ml-3 text-xl font-bold text-gray-900">ClientSync</h1>
              <span className="ml-3 text-sm text-gray-500 bg-red-100 px-3 py-1 rounded-full border border-black">
                Admin Dashboard
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {user.displayName || user.email}
                  </p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-red-600" />
                </div>
                <button
                  onClick={handleSignOut}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl text-white p-6 mb-8 fade-in card-hover border border-black">
          <h2 className="text-2xl font-bold mb-2">
            Admin Dashboard 🔧
          </h2>
          <p className="text-red-100">
            Manage clients, projects, deliverables, and communications from one central location.
          </p>
        </div>

        {/* Client & Project Selection Bar */}
        {activeTab !== "clients" && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-black card-hover">
            <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
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
                className="btn-primary bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl transition-all flex items-center space-x-2 font-medium"
              >
                <Settings className="w-4 h-4" />
                <span>Change Selection</span>
              </button>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-white p-1 rounded-2xl shadow-sm border border-black">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-red-600 text-white shadow-lg"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
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
          {activeTab === "messages" && (
            <div className="bg-white rounded-2xl shadow-sm border border-black overflow-hidden" style={{ height: 'calc(100vh - 400px)' }}>
              <Messages user={user} isAdminView={true} />
            </div>
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
