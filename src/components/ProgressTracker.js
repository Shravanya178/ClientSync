import React, { useState } from 'react';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  TrendingUp,
  Target,
  Award,
  BarChart3
} from 'lucide-react';

const ProgressTracker = ({ user, isAdminView = false }) => {
  const [projects] = useState([
    {
      id: 1,
      name: "Website Redesign",
      progress: 75,
      status: "in-progress",
      dueDate: new Date("2025-08-15"),
      assignedTo: "Design Team",
      tasks: {
        total: 12,
        completed: 9,
        inProgress: 2,
        pending: 1
      },
      milestones: [
        { name: "Research & Planning", completed: true, date: "2025-07-01" },
        { name: "Wireframes", completed: true, date: "2025-07-08" },
        { name: "Design Mockups", completed: true, date: "2025-07-15" },
        { name: "Development", completed: false, date: "2025-08-01" },
        { name: "Testing & Launch", completed: false, date: "2025-08-15" }
      ]
    },
    {
      id: 2,
      name: "Mobile App Development",
      progress: 45,
      status: "in-progress",
      dueDate: new Date("2025-09-30"),
      assignedTo: "Dev Team",
      tasks: {
        total: 20,
        completed: 9,
        inProgress: 4,
        pending: 7
      },
      milestones: [
        { name: "Requirements Analysis", completed: true, date: "2025-06-15" },
        { name: "UI/UX Design", completed: true, date: "2025-07-01" },
        { name: "Frontend Development", completed: false, date: "2025-08-15" },
        { name: "Backend Integration", completed: false, date: "2025-09-01" },
        { name: "Testing & Deployment", completed: false, date: "2025-09-30" }
      ]
    },
    {
      id: 3,
      name: "Brand Guidelines",
      progress: 100,
      status: "completed",
      dueDate: new Date("2025-07-10"),
      assignedTo: "Creative Team",
      tasks: {
        total: 8,
        completed: 8,
        inProgress: 0,
        pending: 0
      },
      milestones: [
        { name: "Brand Research", completed: true, date: "2025-06-20" },
        { name: "Logo Design", completed: true, date: "2025-06-28" },
        { name: "Color Palette", completed: true, date: "2025-07-03" },
        { name: "Typography", completed: true, date: "2025-07-07" },
        { name: "Guidelines Document", completed: true, date: "2025-07-10" }
      ]
    }
  ]);

  const [selectedProject, setSelectedProject] = useState(projects[0]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'in-progress':
        return 'text-blue-600 bg-blue-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'overdue':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'in-progress':
        return <Clock className="w-4 h-4" />;
      case 'overdue':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getDaysRemaining = (dueDate) => {
    const today = new Date();
    const timeDiff = dueDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff;
  };

  const overallStats = {
    totalProjects: projects.length,
    completedProjects: projects.filter(p => p.status === 'completed').length,
    inProgressProjects: projects.filter(p => p.status === 'in-progress').length,
    averageProgress: Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / projects.length)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Progress Tracker</h2>
          <p className="text-gray-600">Monitor project progress and milestones</p>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-gray-500">Overall Progress</div>
          <div className="text-2xl font-bold text-indigo-600">{overallStats.averageProgress}%</div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <Target className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Projects</p>
              <p className="text-2xl font-bold text-gray-900">{overallStats.totalProjects}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <Award className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{overallStats.completedProjects}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">{overallStats.inProgressProjects}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg. Progress</p>
              <p className="text-2xl font-bold text-gray-900">{overallStats.averageProgress}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Projects</h3>
            </div>
            
            <div className="divide-y divide-gray-200">
              {projects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedProject.id === project.id ? 'bg-indigo-50 border-r-2 border-indigo-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{project.name}</h4>
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                      {getStatusIcon(project.status)}
                      <span className="capitalize">{project.status.replace('-', ' ')}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="w-3 h-3 mr-1" />
                      <span>Due: {project.dueDate.toLocaleDateString()}</span>
                      <span className="ml-2">
                        ({getDaysRemaining(project.dueDate)} days)
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Project Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">{selectedProject.name}</h3>
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedProject.status)}`}>
                {getStatusIcon(selectedProject.status)}
                <span className="capitalize">{selectedProject.status.replace('-', ' ')}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-600">Progress</p>
                <p className="text-2xl font-bold text-indigo-600">{selectedProject.progress}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Due Date</p>
                <p className="text-sm font-medium text-gray-900">{selectedProject.dueDate.toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Assigned To</p>
                <p className="text-sm font-medium text-gray-900">{selectedProject.assignedTo}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Days Left</p>
                <p className="text-sm font-medium text-gray-900">{getDaysRemaining(selectedProject.dueDate)} days</p>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Overall Progress</span>
                <span>{selectedProject.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${selectedProject.progress}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Tasks Overview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Tasks Overview</h4>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{selectedProject.tasks.total}</div>
                <div className="text-sm text-gray-600">Total Tasks</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{selectedProject.tasks.completed}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{selectedProject.tasks.inProgress}</div>
                <div className="text-sm text-gray-600">In Progress</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{selectedProject.tasks.pending}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
            </div>
          </div>

          {/* Milestones */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Project Milestones</h4>
            
            <div className="space-y-4">
              {selectedProject.milestones.map((milestone, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className={`w-4 h-4 rounded-full flex-shrink-0 ${
                    milestone.completed 
                      ? 'bg-green-500' 
                      : 'bg-gray-300'
                  }`}>
                    {milestone.completed && (
                      <CheckCircle className="w-4 h-4 text-white" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h5 className={`font-medium ${
                        milestone.completed ? 'text-gray-900' : 'text-gray-600'
                      }`}>
                        {milestone.name}
                      </h5>
                      <span className="text-sm text-gray-500">{milestone.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;
