import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../services/firebase";
import { 
  Plus, 
  Users, 
  FolderOpen, 
  Edit, 
  Save, 
  X, 
  Building,
  User,
  Calendar,
  Mail,
  Phone
} from "lucide-react";

const ClientManagement = ({ 
  user, 
  onClientSelect, 
  onProjectSelect, 
  selectedClient, 
  selectedProject 
}) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddClientForm, setShowAddClientForm] = useState(false);
  const [showAddProjectForm, setShowAddProjectForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  // Form states
  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    projects: []
  });

  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    startDate: "",
    deadline: "",
    status: "active"
  });

  // Predefined clients for quick setup
  const predefinedClients = [
    { name: "Shrav", email: "shrav@example.com", company: "Tech Solutions" },
    { name: "Sank", email: "sank@example.com", company: "Digital Innovations" },
    { name: "Khus", email: "khus@example.com", company: "Creative Agency" },
    { name: "Nikh", email: "nikh@example.com", company: "StartUp Inc" }
  ];

  useEffect(() => {
    const clientsRef = collection(db, "clients");
    const q = query(clientsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const clientsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      }));
      setClients(clientsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAddClient = async (e) => {
    e.preventDefault();
    if (!newClient.name.trim()) return;

    try {
      await addDoc(collection(db, "clients"), {
        ...newClient,
        createdAt: serverTimestamp(),
        addedBy: user.displayName || user.email,
      });
      setNewClient({ name: "", email: "", phone: "", company: "", projects: [] });
      setShowAddClientForm(false);
    } catch (error) {
      console.error("Error adding client:", error);
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!newProject.name.trim() || !selectedClient) return;

    try {
      const selectedClientData = clients.find(c => c.name === selectedClient);
      if (selectedClientData) {
        const clientRef = doc(db, "clients", selectedClientData.id);
        await updateDoc(clientRef, {
          projects: arrayUnion({
            ...newProject,
            id: Date.now().toString(),
            createdAt: new Date(),
            addedBy: user.displayName || user.email,
          })
        });
      }
      setNewProject({ name: "", description: "", startDate: "", deadline: "", status: "active" });
      setShowAddProjectForm(false);
    } catch (error) {
      console.error("Error adding project:", error);
    }
  };

  const handleQuickAddPredefinedClients = async () => {
    try {
      for (const client of predefinedClients) {
        await addDoc(collection(db, "clients"), {
          ...client,
          phone: "",
          projects: [],
          createdAt: serverTimestamp(),
          addedBy: user.displayName || user.email,
        });
      }
    } catch (error) {
      console.error("Error adding predefined clients:", error);
    }
  };

  const handleClientSelect = (clientName) => {
    onClientSelect(clientName);
    onProjectSelect(""); // Reset project selection
  };

  const handleProjectSelect = (projectName) => {
    onProjectSelect(projectName);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowAddClientForm(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Client</span>
          </button>
          {selectedClient && (
            <button
              onClick={() => setShowAddProjectForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Project to {selectedClient}</span>
            </button>
          )}
          {clients.length === 0 && (
            <button
              onClick={handleQuickAddPredefinedClients}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center space-x-2"
            >
              <Users className="w-4 h-4" />
              <span>Add Sample Clients</span>
            </button>
          )}
        </div>
      </div>

      {/* Add Client Form */}
      {showAddClientForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Add New Client</h3>
            <button
              onClick={() => setShowAddClientForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleAddClient} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client Name *
                </label>
                <input
                  type="text"
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={newClient.phone}
                  onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company
                </label>
                <input
                  type="text"
                  value={newClient.company}
                  onChange={(e) => setNewClient({ ...newClient, company: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowAddClientForm(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Client</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Project Form */}
      {showAddProjectForm && selectedClient && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Add Project to {selectedClient}</h3>
            <button
              onClick={() => setShowAddProjectForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleAddProject} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={newProject.status}
                  onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="on-hold">On Hold</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={newProject.startDate}
                  onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deadline
                </label>
                <input
                  type="date"
                  value={newProject.deadline}
                  onChange={(e) => setNewProject({ ...newProject, deadline: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowAddProjectForm(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Project</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Clients List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            All Clients ({clients.length})
          </h3>
        </div>
        <div className="p-6">
          {clients.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No clients added yet</p>
              <button
                onClick={() => setShowAddClientForm(true)}
                className="mt-2 text-red-600 hover:text-red-700"
              >
                Add your first client
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clients.map((client) => (
                <div
                  key={client.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedClient === client.name
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                  }`}
                  onClick={() => handleClientSelect(client.name)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900 flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      {client.name}
                    </h4>
                    {selectedClient === client.name && (
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                        Selected
                      </span>
                    )}
                  </div>
                  
                  {client.company && (
                    <p className="text-sm text-gray-600 flex items-center mb-2">
                      <Building className="w-3 h-3 mr-1" />
                      {client.company}
                    </p>
                  )}
                  
                  {client.email && (
                    <p className="text-sm text-gray-600 flex items-center mb-2">
                      <Mail className="w-3 h-3 mr-1" />
                      {client.email}
                    </p>
                  )}
                  
                  {client.phone && (
                    <p className="text-sm text-gray-600 flex items-center mb-3">
                      <Phone className="w-3 h-3 mr-1" />
                      {client.phone}
                    </p>
                  )}
                  
                  <div className="text-xs text-gray-500 mb-3">
                    Projects: {client.projects?.length || 0}
                  </div>

                  {/* Projects for selected client */}
                  {selectedClient === client.name && client.projects && client.projects.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <h5 className="font-medium text-gray-800 mb-2 flex items-center">
                        <FolderOpen className="w-4 h-4 mr-1" />
                        Projects:
                      </h5>
                      <div className="space-y-2">
                        {client.projects.map((project) => (
                          <div
                            key={project.id}
                            className={`p-2 rounded border cursor-pointer transition-all ${
                              selectedProject === project.name
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-blue-300"
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProjectSelect(project.name);
                            }}
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">{project.name}</span>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                project.status === 'active' ? 'bg-green-100 text-green-800' :
                                project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {project.status}
                              </span>
                            </div>
                            {project.description && (
                              <p className="text-xs text-gray-600 mt-1">{project.description}</p>
                            )}
                            {project.deadline && (
                              <p className="text-xs text-gray-500 mt-1 flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                Due: {new Date(project.deadline).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientManagement;
