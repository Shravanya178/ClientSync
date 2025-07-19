// Deliverables component placeholder
import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../services/firebase";
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  Calendar,
  Download,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  File,
} from "lucide-react";

const Deliverables = ({ user }) => {
  const [deliverables, setDeliverables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const deliverablesRef = collection(db, "deliverables");
    const q = query(deliverablesRef, orderBy("deadline", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const deliverablesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        deadline: doc.data().deadline?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
      }));
      setDeliverables(deliverablesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension)) {
      return <Image className="w-4 h-4" />;
    } else if (['mp4', 'avi', 'mov', 'wmv', 'flv'].includes(extension)) {
      return <Video className="w-4 h-4" />;
    } else if (['mp3', 'wav', 'flac', 'aac'].includes(extension)) {
      return <Music className="w-4 h-4" />;
    } else if (['zip', 'rar', '7z', 'tar'].includes(extension)) {
      return <Archive className="w-4 h-4" />;
    } else if (['pdf', 'doc', 'docx', 'txt'].includes(extension)) {
      return <FileText className="w-4 h-4" />;
    } else {
      return <File className="w-4 h-4" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const filteredDeliverables = deliverables.filter((deliverable) => {
    if (filter === "all") return true;
    return deliverable.status === filter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-2xl font-bold text-gray-900">Deliverables</h3>
        
        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {["all", "pending", "in-progress", "completed"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === status
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Deliverables List */}
      <div className="space-y-4">{filteredDeliverables.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No deliverables found
            </h3>
            <p className="text-gray-600">
              {filter === "all"
                ? "No deliverables have been assigned yet."
                : `No ${filter.replace('-', ' ')} deliverables found.`}
            </p>
          </div>
        ) : (
          filteredDeliverables.map((deliverable) => (
            <div
              key={deliverable.id}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {deliverable.title}
                  </h4>
                  {deliverable.description && (
                    <p className="text-gray-600 mb-3">{deliverable.description}</p>
                  )}
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(deliverable.status)}`}>
                    {deliverable.status?.charAt(0).toUpperCase() + deliverable.status?.slice(1).replace('-', ' ')}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(deliverable.priority)}`}>
                    {deliverable.priority?.charAt(0).toUpperCase() + deliverable.priority?.slice(1)} Priority
                  </span>
                </div>
              </div>

              {/* Resources */}
              {deliverable.resources && deliverable.resources.length > 0 && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <h5 className="font-medium text-gray-800 mb-2">Resources ({deliverable.resources.length})</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {deliverable.resources.map((resource, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          {getFileIcon(resource.name)}
                          <span className="text-sm text-gray-700 truncate">{resource.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">{formatFileSize(resource.size)}</span>
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  Created by {deliverable.createdBy} • {formatDate(deliverable.createdAt)}
                </div>
                {deliverable.deadline && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-1" />
                    Due: {formatDate(deliverable.deadline)}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Deliverables;
