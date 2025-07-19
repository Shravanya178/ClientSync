import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../services/firebase";
import { 
  CheckCircle, 
  Clock, 
  Plus, 
  Upload, 
  File, 
  Calendar,
  User,
  AlertCircle,
  Download,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  Paperclip
} from "lucide-react";

const AdminDeliverables = ({ user, selectedClient, selectedProject }) => {
  const [deliverables, setDeliverables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [newDeliverable, setNewDeliverable] = useState({
    title: "",
    description: "",
    deadline: "",
    priority: "medium",
    status: "pending",
    resources: []
  });

  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    const deliverablesRef = collection(db, "deliverables");
    // Use a simple query to avoid needing composite indexes
    const q = query(deliverablesRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const deliverablesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        deadline: doc.data().deadline ? new Date(doc.data().deadline) : null,
      }));
      
      // Filter client-side to avoid composite index requirements
      let filteredDeliverables = deliverablesData;
      
      if (selectedClient && selectedProject) {
        filteredDeliverables = deliverablesData.filter(deliverable => 
          deliverable.clientName === selectedClient && deliverable.projectName === selectedProject
        );
      } else if (selectedClient) {
        filteredDeliverables = deliverablesData.filter(deliverable => 
          deliverable.clientName === selectedClient
        );
      }
      
      setDeliverables(filteredDeliverables);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedClient, selectedProject]);

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

  const uploadFiles = async (files) => {
    const uploadedFiles = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileName = `deliverables/${selectedClient}/${selectedProject || 'general'}/${user.uid}_${Date.now()}_${file.name}`;
      const fileRef = ref(storage, fileName);
      
      try {
        // Upload with metadata
        const snapshot = await uploadBytes(fileRef, file, {
          contentType: file.type,
        });
        
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        uploadedFiles.push({
          name: file.name,
          url: downloadURL,
          size: file.size,
          type: file.type,
          uploadedAt: new Date(),
        });
        
        setUploadProgress(((i + 1) / files.length) * 100);
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        alert(`Failed to upload ${file.name}. Please check Firebase Storage rules and try again.`);
      }
    }
    
    return uploadedFiles;
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const handleAddDeliverable = async (e) => {
    e.preventDefault();
    if (!newDeliverable.title.trim()) return;
    if (!selectedClient) {
      alert("Please select a client first");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      let uploadedResources = [];
      
      if (selectedFiles.length > 0) {
        uploadedResources = await uploadFiles(selectedFiles);
      }

      await addDoc(collection(db, "deliverables"), {
        ...newDeliverable,
        clientName: selectedClient,
        projectName: selectedProject || "General",
        resources: uploadedResources,
        createdAt: serverTimestamp(),
        createdBy: user.displayName || user.email,
        deadline: newDeliverable.deadline ? new Date(newDeliverable.deadline) : null,
      });
      
      setNewDeliverable({
        title: "",
        description: "",
        deadline: "",
        priority: "medium",
        status: "pending",
        resources: []
      });
      setSelectedFiles([]);
      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding deliverable:", error);
      alert("Error creating deliverable. Please try again.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const updateDeliverableStatus = async (deliverableId, newStatus) => {
    try {
      const deliverableRef = doc(db, "deliverables", deliverableId);
      await updateDoc(deliverableRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating deliverable status:", error);
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!selectedClient) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
          <h3 className="text-lg font-medium text-yellow-800">No Client Selected</h3>
        </div>
        <p className="text-yellow-700 mt-2">
          Please select a client from the Client Management tab to manage deliverables.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Deliverables for {selectedClient}
              {selectedProject && ` - ${selectedProject}`}
            </h3>
            <p className="text-gray-600">Manage project deliverables and resources</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Deliverable</span>
          </button>
        </div>
      </div>

      {/* Add Deliverable Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Deliverable</h3>
          <form onSubmit={handleAddDeliverable} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={newDeliverable.title}
                  onChange={(e) => setNewDeliverable({ ...newDeliverable, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deadline
                </label>
                <input
                  type="date"
                  value={newDeliverable.deadline}
                  onChange={(e) => setNewDeliverable({ ...newDeliverable, deadline: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={newDeliverable.priority}
                  onChange={(e) => setNewDeliverable({ ...newDeliverable, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={newDeliverable.status}
                  onChange={(e) => setNewDeliverable({ ...newDeliverable, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={newDeliverable.description}
                onChange={(e) => setNewDeliverable({ ...newDeliverable, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resources (All file formats supported)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                  accept="*/*"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center justify-center"
                >
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">Click to upload files</span>
                  <span className="text-xs text-gray-500 mt-1">All file formats supported</span>
                </label>
              </div>
              
              {selectedFiles.length > 0 && (
                <div className="mt-2">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Files:</h4>
                  <div className="space-y-1">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center space-x-2">
                          {getFileIcon(file.name)}
                          <span className="text-sm text-gray-700">{file.name}</span>
                        </div>
                        <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {uploading && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Uploading... {Math.round(uploadProgress)}%</p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setNewDeliverable({
                    title: "",
                    description: "",
                    deadline: "",
                    priority: "medium",
                    status: "pending",
                    resources: []
                  });
                  setSelectedFiles([]);
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newDeliverable.title.trim() || uploading}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Create Deliverable</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Deliverables List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            Deliverables ({deliverables.length})
          </h3>
        </div>
        <div className="p-6">
          {deliverables.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No deliverables yet</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="mt-2 text-red-600 hover:text-red-700"
              >
                Create your first deliverable
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {deliverables.map((deliverable) => (
                <div key={deliverable.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{deliverable.title}</h4>
                      <p className="text-gray-600 text-sm mb-2">{deliverable.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <User className="w-3 h-3 mr-1" />
                          {deliverable.createdBy}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          Created: {formatDate(deliverable.createdAt)}
                        </span>
                        {deliverable.deadline && (
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            Due: {formatDate(deliverable.deadline)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <div className="flex space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(deliverable.priority)}`}>
                          {deliverable.priority.charAt(0).toUpperCase() + deliverable.priority.slice(1)} Priority
                        </span>
                        <select
                          value={deliverable.status}
                          onChange={(e) => updateDeliverableStatus(deliverable.id, e.target.value)}
                          className={`px-2 py-1 rounded-full text-xs font-medium border-0 ${getStatusColor(deliverable.status)}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="overdue">Overdue</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Resources */}
                  {deliverable.resources && deliverable.resources.length > 0 && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <h5 className="font-medium text-gray-800 mb-2 flex items-center">
                        <Paperclip className="w-4 h-4 mr-1" />
                        Resources ({deliverable.resources.length})
                      </h5>
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

                  <div className="flex justify-between items-center text-sm text-gray-500 mt-3 pt-3 border-t">
                    <span>Client: {deliverable.clientName}</span>
                    <span>Project: {deliverable.projectName}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDeliverables;
