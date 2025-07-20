import React, { useState, useEffect } from "react";
import { 
  User, 
  Building, 
  Phone, 
  Mail, 
  MapPin, 
  Globe, 
  Calendar, 
  Clock, 
  Save, 
  Edit, 
  X,
  Check,
  Upload,
  AlertCircle
} from "lucide-react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../services/firebase";

const ClientProfile = ({ user, isAdminView }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || "",
    email: user?.email || "",
    phone: "",
    company: "",
    position: "",
    address: "",
    website: "",
    industry: "",
    joinDate: "",
    avatar: user?.photoURL || "",
    bio: "",
    contactPerson: "",
    contactPersonRole: "",
    contactPersonEmail: "",
    contactPersonPhone: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [error, setError] = useState("");
  const [projectStats, setProjectStats] = useState({
    totalProjects: 0,
    completedProjects: 0,
    activeProjects: 0,
    upcomingDeliverables: 0
  });

  // Fetch client profile data from Firestore
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data();
        
        if (userData) {
          setProfileData({
            ...profileData,
            ...userData,
            email: user.email,
            displayName: user.displayName || userData.displayName || "",
            avatar: user.photoURL || userData.avatar || ""
          });
          
          // Fetch project statistics if available
          if (userData.projectStats) {
            setProjectStats(userData.projectStats);
          } else {
            // Fetch project statistics from projects collection
            // This is a placeholder for actual implementation
            setProjectStats({
              totalProjects: 3,
              completedProjects: 1,
              activeProjects: 2,
              upcomingDeliverables: 5
            });
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching profile data:", error);
        setError("Failed to load profile data");
        setLoading(false);
      }
    };
    
    fetchProfileData();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    
    try {
      const userRef = doc(db, "users", user.uid);
      
      // Upload avatar if changed
      let avatarURL = profileData.avatar;
      if (avatarFile) {
        const avatarRef = ref(storage, `avatars/${user.uid}`);
        await uploadBytes(avatarRef, avatarFile);
        avatarURL = await getDownloadURL(avatarRef);
      }
      
      // Update Firestore
      await updateDoc(userRef, {
        ...profileData,
        avatar: avatarURL,
        lastUpdated: new Date()
      });
      
      // Update displayName in Auth profile
      if (user.displayName !== profileData.displayName) {
        await updateProfile(user, { 
          displayName: profileData.displayName,
          photoURL: avatarURL
        });
      }
      
      setProfileData((prev) => ({
        ...prev,
        avatar: avatarURL
      }));
      
      setIsEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to original data
    setIsEditing(false);
    setAvatarFile(null);
    setAvatarPreview(null);
    
    // Re-fetch profile data
    const fetchProfileData = async () => {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();
      
      setProfileData({
        ...profileData,
        ...userData,
        email: user.email,
        displayName: user.displayName || userData.displayName || "",
        avatar: user.photoURL || userData.avatar || ""
      });
    };
    
    fetchProfileData();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50">
      {error && (
        <div className="bg-red-50 p-4 border-l-4 border-red-500 mb-6 rounded-md shadow-sm">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}
      
      <div className="grid gap-6 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-24"></div>
          <div className="flex flex-col items-center -mt-12 px-6 pb-6">
            <div className="relative group mb-4">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md bg-white">
                <img 
                  src={avatarPreview || profileData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.displayName || user.email)}&background=6366f1&color=fff`} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
              
              {isEditing && (
                <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                  <Upload className="w-8 h-8 text-white" />
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleAvatarChange} 
                  />
                </label>
              )}
            </div>
            
            <h2 className="text-xl font-bold text-gray-800">{profileData.displayName}</h2>
            <p className="text-indigo-600 font-medium">{profileData.position || "Client"}</p>
            <p className="text-gray-500 mt-1 text-sm">{profileData.company || "Company not specified"}</p>
            
            <div className="mt-6 w-full">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-500">Client since</span>
                <span className="text-sm font-medium">{profileData.joinDate || "Not available"}</span>
              </div>
              
              <div className="bg-gray-200 rounded-full h-2 mb-4">
                <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${(projectStats.completedProjects / projectStats.totalProjects) * 100}%` }}></div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-xl font-bold text-indigo-600">{projectStats.activeProjects}</p>
                  <p className="text-xs text-gray-500">Active Projects</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-xl font-bold text-green-600">{projectStats.completedProjects}</p>
                  <p className="text-xs text-gray-500">Completed</p>
                </div>
              </div>
            </div>

            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="mt-6 flex items-center justify-center w-full px-4 py-2 border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </button>
            ) : (
              <div className="mt-6 flex space-x-2 w-full">
                <button
                  onClick={handleCancel}
                  className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  disabled={saving}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className={`flex-1 flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 ${saving ? 'opacity-75 cursor-not-allowed' : ''}`}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-t-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Personal Information Card */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-indigo-500" />
              Personal Information
            </h3>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="displayName"
                    value={profileData.displayName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <p className="text-gray-800 font-medium">{profileData.displayName || "Not provided"}</p>
                )}
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-gray-500" />
                  <p className="text-gray-800">{profileData.email}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-gray-500" />
                    <p className="text-gray-800">{profileData.phone || "Not provided"}</p>
                  </div>
                )}
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-1">Position/Title</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="position"
                    value={profileData.position}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <p className="text-gray-800">{profileData.position || "Not provided"}</p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Company Information Card */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Building className="w-5 h-5 mr-2 text-indigo-500" />
              Company Information
            </h3>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="company"
                    value={profileData.company}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <p className="text-gray-800 font-medium">{profileData.company || "Not provided"}</p>
                )}
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                {isEditing ? (
                  <select
                    name="industry"
                    value={profileData.industry}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Industry</option>
                    <option value="Technology">Technology</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Finance">Finance</option>
                    <option value="Education">Education</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Retail">Retail</option>
                    <option value="Media">Media</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Construction">Construction</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <p className="text-gray-800">{profileData.industry || "Not provided"}</p>
                )}
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="website"
                    value={profileData.website}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : profileData.website ? (
                  <a href={profileData.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline flex items-center">
                    <Globe className="w-4 h-4 mr-2" />
                    {profileData.website}
                  </a>
                ) : (
                  <p className="text-gray-800">Not provided</p>
                )}
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="address"
                    value={profileData.address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                    <p className="text-gray-800">{profileData.address || "Not provided"}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Additional Contact Card */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Phone className="w-5 h-5 mr-2 text-indigo-500" />
              Additional Contact
            </h3>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="contactPerson"
                    value={profileData.contactPerson}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <p className="text-gray-800 font-medium">{profileData.contactPerson || "Not provided"}</p>
                )}
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Role</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="contactPersonRole"
                    value={profileData.contactPersonRole}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <p className="text-gray-800">{profileData.contactPersonRole || "Not provided"}</p>
                )}
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    name="contactPersonEmail"
                    value={profileData.contactPersonEmail}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-gray-500" />
                    <p className="text-gray-800">{profileData.contactPersonEmail || "Not provided"}</p>
                  </div>
                )}
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="contactPersonPhone"
                    value={profileData.contactPersonPhone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-gray-500" />
                    <p className="text-gray-800">{profileData.contactPersonPhone || "Not provided"}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Notes & Bio Card */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-indigo-500" />
              Notes & Bio
            </h3>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              {isEditing ? (
                <textarea
                  name="bio"
                  value={profileData.bio}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Tell us about your company or project requirements..."
                ></textarea>
              ) : (
                <p className="text-gray-800 whitespace-pre-line">{profileData.bio || "No additional information provided."}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Activity Timeline - Only visible in non-editing mode */}
      {!isEditing && (
        <div className="mt-6 lg:col-span-3 md:col-span-2 sm:col-span-1">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-indigo-500" />
                Recent Activity
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                  <span className="absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-500 ring-1 ring-white">
                    <Check className="h-3 w-3" />
                  </span>
                  <div className="pt-2 pr-8">
                    <h4 className="text-sm font-medium text-gray-900">Project milestone achieved</h4>
                    <span className="text-xs text-gray-500 block mt-1 mb-2">2 days ago</span>
                    <p className="text-sm text-gray-600">Phase 1 deliverables completed and approved.</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                  <span className="absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-500 ring-1 ring-white">
                    <Upload className="h-3 w-3" />
                  </span>
                  <div className="pt-2 pr-8">
                    <h4 className="text-sm font-medium text-gray-900">Files uploaded</h4>
                    <span className="text-xs text-gray-500 block mt-1 mb-2">1 week ago</span>
                    <p className="text-sm text-gray-600">Uploaded 5 new documents for review.</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                  <span className="absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-500 ring-1 ring-white">
                    <User className="h-3 w-3" />
                  </span>
                  <div className="pt-2 pr-8">
                    <h4 className="text-sm font-medium text-gray-900">Profile created</h4>
                    <span className="text-xs text-gray-500 block mt-1 mb-2">{profileData.joinDate || "N/A"}</span>
                    <p className="text-sm text-gray-600">Welcome to ClientSync! Your journey with us begins.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientProfile;
