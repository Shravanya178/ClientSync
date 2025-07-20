import React, { useState } from 'react';
import { 
  Upload, 
  File, 
  Download, 
  Trash2, 
  Eye, 
  FileText, 
  Image, 
  Video,
  Music,
  Archive,
  CheckCircle,
  Clock
} from 'lucide-react';

const FileUploadManager = ({ user, isAdminView = false }) => {
  const [files, setFiles] = useState([
    // Sample data
    {
      id: 1,
      name: 'Project_Proposal.pdf',
      type: 'application/pdf',
      size: 2048576,
      uploadedBy: 'john@example.com',
      uploadedAt: new Date(Date.now() - 86400000),
      status: 'approved',
      category: 'proposal'
    },
    {
      id: 2,
      name: 'design_mockup.figma',
      type: 'application/figma',
      size: 15728640,
      uploadedBy: 'designer@example.com',
      uploadedAt: new Date(Date.now() - 172800000),
      status: 'pending',
      category: 'design'
    },
    {
      id: 3,
      name: 'brand_guidelines.zip',
      type: 'application/zip',
      size: 5242880,
      uploadedBy: 'client@example.com',
      uploadedAt: new Date(Date.now() - 259200000),
      status: 'approved',
      category: 'assets'
    }
  ]);
  
  const [dragActive, setDragActive] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [uploadStatus, setUploadStatus] = useState('');

  const categories = [
    { id: 'all', label: 'All Files', icon: File },
    { id: 'proposal', label: 'Proposals', icon: FileText },
    { id: 'design', label: 'Designs', icon: Image },
    { id: 'assets', label: 'Assets', icon: Archive },
    { id: 'media', label: 'Media', icon: Video }
  ];

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return <Image className="w-5 h-5" />;
    if (type.startsWith('video/')) return <Video className="w-5 h-5" />;
    if (type.startsWith('audio/')) return <Music className="w-5 h-5" />;
    if (type.includes('zip') || type.includes('rar')) return <Archive className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (fileList) => {
    setUploadStatus('Uploading...');
    
    // Simulate upload process
    setTimeout(() => {
      const newFiles = Array.from(fileList).map((file, index) => ({
        id: files.length + index + 1,
        name: file.name,
        type: file.type,
        size: file.size,
        uploadedBy: user?.email || 'current-user@example.com',
        uploadedAt: new Date(),
        status: 'pending',
        category: 'assets'
      }));
      
      setFiles(prev => [...prev, ...newFiles]);
      setUploadStatus('Upload successful! ✅');
      
      setTimeout(() => setUploadStatus(''), 3000);
    }, 2000);
  };

  const updateFileStatus = (fileId, newStatus) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId ? { ...file, status: newStatus } : file
    ));
  };

  const deleteFile = (fileId) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const filteredFiles = files.filter(file => 
    selectedCategory === 'all' || file.category === selectedCategory
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">File Manager</h2>
          <p className="text-gray-600">Upload and manage project files</p>
        </div>
        
        {uploadStatus && (
          <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg">
            {uploadStatus}
          </div>
        )}
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive 
            ? 'border-indigo-500 bg-indigo-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-2">
          Drop files here or click to upload
        </p>
        <p className="text-gray-600 mb-4">
          Support for PDF, images, videos, and compressed files
        </p>
        <input
          type="file"
          multiple
          onChange={handleFileInput}
          className="hidden"
          id="file-upload"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.mp4,.mov,.zip,.rar"
        />
        <label
          htmlFor="file-upload"
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer inline-block"
        >
          Choose Files
        </label>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{category.label}</span>
            </button>
          );
        })}
      </div>

      {/* Files List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Files ({filteredFiles.length})
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredFiles.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              <File className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No files in this category</p>
            </div>
          ) : (
            filteredFiles.map((file) => (
              <div key={file.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-gray-500">
                      {getFileIcon(file.type)}
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {file.name}
                      </h4>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{formatFileSize(file.size)}</span>
                        <span>•</span>
                        <span>Uploaded by {file.uploadedBy}</span>
                        <span>•</span>
                        <span>{file.uploadedAt.toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {/* Status Badge */}
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                      file.status === 'approved' 
                        ? 'bg-green-100 text-green-700'
                        : file.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {file.status === 'approved' ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <Clock className="w-3 h-3" />
                      )}
                      <span className="capitalize">{file.status}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => window.open('#', '_blank')}
                        className="p-2 text-gray-400 hover:text-gray-600"
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => {/* Handle download */}}
                        className="p-2 text-gray-400 hover:text-gray-600"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      {isAdminView && (
                        <>
                          <button
                            onClick={() => updateFileStatus(file.id, 
                              file.status === 'approved' ? 'pending' : 'approved'
                            )}
                            className={`p-2 ${
                              file.status === 'approved' 
                                ? 'text-yellow-500 hover:text-yellow-700' 
                                : 'text-green-500 hover:text-green-700'
                            }`}
                            title={file.status === 'approved' ? 'Mark as Pending' : 'Approve'}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => deleteFile(file.id)}
                            className="p-2 text-red-400 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Upload className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Files</p>
              <p className="text-2xl font-bold text-blue-900">{files.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-green-600 font-medium">Approved</p>
              <p className="text-2xl font-bold text-green-900">
                {files.filter(f => f.status === 'approved').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-100 p-2 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-yellow-600 font-medium">Pending</p>
              <p className="text-2xl font-bold text-yellow-900">
                {files.filter(f => f.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUploadManager;
