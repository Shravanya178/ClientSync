import React, { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import {
  LogOut,
  User,
  ToggleLeft,
  ToggleRight,
  Home,
  FolderOpen,
  MessageSquare,
  CheckSquare,
  Ticket,
  Bell,
  Search,
  Settings
} from "lucide-react";
import Updates from "./Updates";
import NotificationsCompact from "./NotificationsCompact";
import Projects from "./Projects";
import Deliverables from "./Deliverables";
import TicketForm from "./TicketForm";
import AdminDashboard from "../pages/AdminDashboard";

const Dashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState("home");
  const [isAdminView, setIsAdminView] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const tabs = [
    { id: "home", label: "Home", icon: Home },
    { id: "projects", label: "Projects", icon: FolderOpen },
    { id: "updates", label: "Updates", icon: MessageSquare },
    { id: "deliverables", label: "Deliverables", icon: CheckSquare },
    { id: "tickets", label: "Tickets", icon: Ticket },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  return (
    <>
      {/* Render AdminDashboard when in admin view */}
      {isAdminView ? (
        <AdminDashboard user={user} />
      ) : (
        <div className="min-h-screen bg-gray-50">
          {/* Modern Top Navbar */}
          <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                {/* Logo and Search */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-sm">CS</span>
                    </div>
                    <h1 className="ml-3 text-xl font-bold text-gray-900">ClientSync</h1>
                  </div>
                  
                  {/* Search Bar */}
                  <div className="hidden md:flex relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search projects, updates..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 w-64"
                    />
                  </div>
                </div>

                {/* Right Side - User Actions */}
                <div className="flex items-center space-x-4">
                  {/* Admin/Client View Toggle */}
                  <div className="flex items-center space-x-3 bg-gray-100 rounded-xl p-1">
                    <span
                      className={`text-sm px-3 py-1 rounded-lg transition-all ${
                        !isAdminView
                          ? "bg-white text-blue-600 font-medium shadow-sm"
                          : "text-gray-600"
                      }`}
                    >
                      Client
                    </span>
                    <button
                      onClick={() => setIsAdminView(!isAdminView)}
                      className="text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      {isAdminView ? (
                        <ToggleRight className="w-5 h-5" />
                      ) : (
                        <ToggleLeft className="w-5 h-5" />
                      )}
                    </button>
                    <span
                      className={`text-sm px-3 py-1 rounded-lg transition-all ${
                        isAdminView
                          ? "bg-white text-blue-600 font-medium shadow-sm"
                          : "text-gray-600"
                      }`}
                    >
                      Admin
                    </span>
                  </div>

                  {/* User Profile */}
                  <div className="flex items-center space-x-3">
                    <div className="hidden sm:block text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {user.displayName || "John Doe"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {isAdminView ? "Administrator" : "Client"}
                      </p>
                    </div>
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
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
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl text-white p-6 mb-8 fade-in card-hover border border-black">
          <h2 className="text-2xl font-bold mb-2">
            Welcome back, {user.displayName || "Client"}! 👋
          </h2>
          <p className="text-blue-100">
            Stay updated on your project progress and manage your requests.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-white p-1 rounded-2xl shadow-sm border border-black">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-blue-600 text-white shadow-lg"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  <IconComponent className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Dashboard Content */}
        <div className="fade-in">
          {activeTab === "home" && (
            <div className="space-y-8">
              {/* Projects Section - Limited to 4-5 cards */}
              <div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                      <FolderOpen className="w-6 h-6 mr-3 text-blue-600" />
                      {isAdminView ? "Recent Projects" : "My Projects"}
                    </h2>
                    <p className="text-gray-600 mt-1">
                      {isAdminView 
                        ? "Latest client projects overview" 
                        : "Your current projects at a glance"}
                    </p>
                  </div>
                  <button 
                    onClick={() => setActiveTab("projects")}
                    className="mt-4 sm:mt-0 btn-primary bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium inline-flex items-center"
                  >
                    View All Projects
                    <span className="ml-2">→</span>
                  </button>
                </div>
                <Projects user={user} isAdminView={isAdminView} isHomeView={true} />
              </div>
              
              {/* Updates & Notifications Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <Updates user={user} isAdminView={isAdminView} />
                </div>
                <div>
                  <NotificationsCompact user={user} />
                </div>
              </div>
              
              {/* Quick Actions & Stats Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Quick Actions */}
                <div className="bg-white rounded-2xl shadow-md p-6 border border-black card-hover">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                      ⚡
                    </span>
                    Quick Actions
                  </h3>
                  <div className="space-y-3">
                    <button 
                      onClick={() => setActiveTab("tickets")}
                      className="w-full btn-primary bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl transition-all flex items-center justify-center space-x-2"
                    >
                      <Ticket className="w-4 h-4" />
                      <span>Create New Ticket</span>
                    </button>
                    <button 
                      onClick={() => setActiveTab("deliverables")}
                      className="w-full btn-primary bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl transition-all flex items-center justify-center space-x-2"
                    >
                      <CheckSquare className="w-4 h-4" />
                      <span>View Deliverables</span>
                    </button>
                    <button className="w-full btn-primary bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-xl transition-all flex items-center justify-center space-x-2">
                      <MessageSquare className="w-4 h-4" />
                      <span>Contact Support</span>
                    </button>
                  </div>
                </div>
                
                {/* Project Stats */}
                <div className="bg-white rounded-2xl shadow-md p-6 border border-black card-hover">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      📊
                    </span>
                    Project Overview
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Active Projects</span>
                      <span className="text-lg font-bold text-blue-600">3</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Completed</span>
                      <span className="text-lg font-bold text-green-600">1</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Avg Progress</span>
                      <span className="text-lg font-bold text-yellow-600">67%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full" style={{width: '67%'}}></div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-2xl shadow-md p-6 border border-black card-hover">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      🕒
                    </span>
                    Recent Activity
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full mt-1.5"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">Project updated</p>
                        <p className="text-xs text-gray-500">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mt-1.5"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">New message received</p>
                        <p className="text-xs text-gray-500">4 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full mt-1.5"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">Deadline reminder</p>
                        <p className="text-xs text-gray-500">1 day ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Support & Resources Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white card-hover border border-black">
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <span className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-3">
                      🎯
                    </span>
                    Need Help?
                  </h3>
                  <p className="text-blue-100 mb-4">
                    Our support team is here to assist you with any questions or issues.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button className="btn-primary bg-white text-blue-600 px-4 py-2 rounded-xl hover:bg-blue-50 transition-all text-sm font-medium">
                      Chat Support
                    </button>
                    <button className="btn-primary bg-blue-400 text-white px-4 py-2 rounded-xl hover:bg-blue-300 transition-all text-sm font-medium">
                      Knowledge Base
                    </button>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white card-hover border border-black">
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <span className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-3">
                      📈
                    </span>
                    Performance Metrics
                  </h3>
                  <p className="text-green-100 mb-4">
                    Track your project milestones and team collaboration metrics.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button className="btn-primary bg-white text-green-600 px-4 py-2 rounded-xl hover:bg-green-50 transition-all text-sm font-medium">
                      View Reports
                    </button>
                    <button className="btn-primary bg-green-400 text-white px-4 py-2 rounded-xl hover:bg-green-300 transition-all text-sm font-medium">
                      Analytics
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === "projects" && (
            <Projects user={user} isAdminView={isAdminView} />
          )}
          {activeTab === "updates" && (
            <Updates user={user} isAdminView={isAdminView} />
          )}
          {activeTab === "deliverables" && (
            <Deliverables user={user} isAdminView={isAdminView} />
          )}
          {activeTab === "tickets" && (
            <TicketForm user={user} isAdminView={isAdminView} />
          )}
          {activeTab === "notifications" && <NotificationsCompact user={user} />}
        </div>
      </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
