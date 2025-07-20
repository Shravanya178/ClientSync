import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../services/firebase";
import { 
  Plus,
  FolderOpen
} from "lucide-react";
import ProjectCard from "./ProjectCard";

const Projects = ({ user, isAdminView, isHomeView = false }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    clientEmail: "",
    deadline: "",
  });

  useEffect(() => {
    // For non-admin users, immediately load dummy data to avoid loading screen
    if (!isAdminView) {
      const dummyProjects = [
        {
          id: "dummy1",
          name: "Website Redesign",
          description: "Revamp the client website UI/UX.",
          clientEmail: user.email,
          progress: 60,
          status: "active",
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          lastComment: "Design phase completed.",
          lastCommentBy: "Admin",
          lastCommentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        {
          id: "dummy2",
          name: "SEO Optimization",
          description: "Improve search engine ranking.",
          clientEmail: user.email,
          progress: 30,
          status: "active",
          deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
          lastComment: "Keyword research done.",
          lastCommentBy: "Admin",
          lastCommentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
        {
          id: "dummy3",
          name: "Content Update",
          description: "Update blog and news sections.",
          clientEmail: user.email,
          progress: 80,
          status: "active",
          deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          lastComment: "Drafts ready for review.",
          lastCommentBy: "Admin",
          lastCommentAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        },
      ];
      setProjects(dummyProjects);
      setLoading(false);
      return;
    }

    // For admin users, query Firestore
    const projectsRef = collection(db, "projects");
    const q = query(projectsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        deadline: doc.data().deadline?.toDate(),
      }));
      setProjects(projectsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user.email, isAdminView]);

  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!newProject.name.trim() || !newProject.clientEmail.trim()) return;

    try {
      await addDoc(collection(db, "projects"), {
        name: newProject.name,
        description: newProject.description,
        clientEmail: newProject.clientEmail,
        progress: 0,
        status: "active",
        deadline: newProject.deadline ? new Date(newProject.deadline) : null,
        createdAt: serverTimestamp(),
        createdBy: user.displayName || user.email,
        lastComment: "Project initiated",
        lastCommentBy: "Admin",
        lastCommentAt: serverTimestamp(),
      });
      
      setNewProject({
        name: "",
        description: "",
        clientEmail: "",
        deadline: "",
      });
      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding project:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <FolderOpen className="w-6 h-6 mr-3 text-blue-600" />
            {isAdminView ? "All Projects" : "My Projects"}
          </h2>
          <p className="text-gray-600 mt-1">
            {isAdminView 
              ? "Manage and monitor all client projects" 
              : "Track your project progress and updates"}
          </p>
        </div>
        
        {isAdminView && (
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-all flex items-center space-x-2 font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Add Project</span>
          </button>
        )}
      </div>

      {/* Add Project Form */}
      {showAddForm && isAdminView && (
        <div className="bg-white rounded-2xl shadow-md p-6 border border-black">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <Plus className="w-4 h-4 text-blue-600" />
            </div>
            Add New Project
          </h3>
          <form onSubmit={handleAddProject} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) =>
                    setNewProject({ ...newProject, name: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client Email *
                </label>
                <input
                  type="email"
                  value={newProject.clientEmail}
                  onChange={(e) =>
                    setNewProject({ ...newProject, clientEmail: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={newProject.description}
                onChange={(e) =>
                  setNewProject({ ...newProject, description: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deadline
              </label>
              <input
                type="date"
                value={newProject.deadline}
                onChange={(e) =>
                  setNewProject({ ...newProject, deadline: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                className="btn-primary bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl transition-all font-medium"
              >
                Create Project
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="btn-primary bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2.5 rounded-xl transition-all font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="text-center py-16">
          <div className="animate-float mb-6">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="w-12 h-12 text-gray-400" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {isAdminView ? "No projects yet" : "No projects assigned"}
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {isAdminView 
              ? "Create your first project to get started with client management" 
              : "Projects will appear here once they're assigned to you by the admin"}
          </p>
          {isAdminView && (
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-6 btn-primary bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-all inline-flex items-center space-x-2 font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Project</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(isHomeView ? projects.slice(0, 4) : projects).map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              isAdminView={isAdminView}
              index={index}
            />
          ))}
        </div>
      )}
      
      {/* Show "View All" button if in home view and there are more projects */}
      {isHomeView && projects.length > 4 && (
        <div className="text-center mt-8">
          <p className="text-gray-600 text-sm mb-3">
            Showing 4 of {projects.length} projects
          </p>
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div 
              className="bg-blue-600 h-1 rounded-full transition-all duration-1000"
              style={{ width: `${(4 / projects.length) * 100}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
