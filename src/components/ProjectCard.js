import React from "react";
import { 
  MessageSquare, 
  Eye, 
  Calendar,
  User,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import { useScrollAnimation } from "../hooks/useScrollAnimation";

const ProjectCard = ({ project, isAdminView, index }) => {
  const [ref, isVisible] = useScrollAnimation(0.1);

  const getProgressColor = (progress) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 50) return "bg-yellow-500";
    if (progress >= 25) return "bg-orange-500";
    return "bg-red-500";
  };

  const getStatusIcon = (status, progress) => {
    if (status === "completed" || progress === 100) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    if (status === "on-hold") {
      return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
    return <Clock className="w-5 h-5 text-blue-500" />;
  };

  const formatDate = (date) => {
    if (!date) return "No deadline";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDaysUntilDeadline = (deadline) => {
    if (!deadline) return null;
    const today = new Date();
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilDeadline = getDaysUntilDeadline(project.deadline);

  return (
    <div
      ref={ref}
      className={`transform transition-all duration-700 ease-out ${
        isVisible
          ? 'translate-y-0 opacity-100'
          : 'translate-y-8 opacity-0'
      }`}
      style={{
        transitionDelay: `${index * 150}ms`,
      }}
    >
      <div className="bg-white rounded-2xl shadow-md card-hover border border-black overflow-hidden group">
        {/* Card Header */}
        <div className="p-6 pb-4">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors flex-1 mr-3">
              {project.name}
            </h3>
            <div className="flex-shrink-0">
              {getStatusIcon(project.status, project.progress)}
            </div>
          </div>
          
          {project.description && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
              {project.description}
            </p>
          )}

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm font-bold text-blue-600">
                {project.progress || 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-3 rounded-full transition-all duration-1000 ease-out ${getProgressColor(
                  project.progress || 0
                )}`}
                style={{ 
                  width: isVisible ? `${project.progress || 0}%` : '0%',
                  transitionDelay: `${index * 150 + 200}ms`
                }}
              ></div>
            </div>
          </div>

          {/* Project Info */}
          <div className="space-y-3 mb-4">
            {isAdminView && (
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                  <User className="w-3 h-3" />
                </div>
                <span className="truncate">{project.clientEmail}</span>
              </div>
            )}
            
            {project.deadline && (
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                  <Calendar className="w-3 h-3" />
                </div>
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <span>{formatDate(project.deadline)}</span>
                  {daysUntilDeadline !== null && (
                    <span
                      className={`mt-1 sm:mt-0 sm:ml-2 px-2 py-1 rounded-lg text-xs font-medium transition-all duration-300 ${
                        daysUntilDeadline < 0
                          ? "bg-red-100 text-red-800"
                          : daysUntilDeadline <= 7
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      } ${isVisible ? 'scale-100' : 'scale-95'}`}
                      style={{
                        transitionDelay: `${index * 150 + 400}ms`
                      }}
                    >
                      {daysUntilDeadline < 0
                        ? `${Math.abs(daysUntilDeadline)} days overdue`
                        : daysUntilDeadline === 0
                        ? "Due today"
                        : `${daysUntilDeadline} days left`}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Latest Comment */}
          {project.lastComment && (
            <div className={`bg-gray-50 rounded-xl p-4 mb-4 transition-all duration-500 ${
              isVisible ? 'transform translate-x-0 opacity-100' : 'transform translate-x-4 opacity-0'
            }`}
            style={{
              transitionDelay: `${index * 150 + 300}ms`
            }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-700 flex items-center">
                  <MessageSquare className="w-3 h-3 mr-1" />
                  Latest Update
                </span>
                <span className="text-xs text-gray-500">
                  by {project.lastCommentBy || "Admin"}
                </span>
              </div>
              <p className="text-sm text-gray-800 line-clamp-2 leading-relaxed">
                {project.lastComment}
              </p>
            </div>
          )}
        </div>

        {/* Elite Card Actions */}
        <div className={`px-6 py-4 bg-gradient-to-r from-elevated-dark to-card-hover border-t border-subtle-dark flex flex-col sm:flex-row gap-3 transition-all duration-500 ${
          isVisible ? 'transform translate-y-0 opacity-100' : 'transform translate-y-4 opacity-0'
        }`}
        style={{
          transitionDelay: `${index * 150 + 500}ms`
        }}>
          <button className="flex-1 btn-neon px-4 py-2.5 transition-all flex items-center justify-center space-x-2 text-sm font-medium">
            <MessageSquare className="w-4 h-4" />
            <span>Connect</span>
          </button>
          <button className="flex-1 btn-dark px-4 py-2.5 transition-all flex items-center justify-center space-x-2 text-sm font-medium">
            <Eye className="w-4 h-4" />
            <span>View Details</span>
          </button>
        </div>
        
        {/* SVG Neon Gradient Definition */}
        <svg width="0" height="0">
          <defs>
            <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7F00FF" />
              <stop offset="50%" stopColor="#E100FF" />
              <stop offset="100%" stopColor="#7F00FF" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};

export default ProjectCard;
