import React, { useState } from "react";
import { 
  collection, 
  addDoc, 
  serverTimestamp,
  doc,
  updateDoc 
} from "firebase/firestore";
import { db } from "../services/firebase";
import { 
  Phone, 
  Video, 
  Mail, 
  AlertTriangle, 
  Clock, 
  Calendar,
  Send,
  CheckCircle,
  X
} from "lucide-react";

const HelpRequestModal = ({ 
  isOpen, 
  onClose, 
  deliverable, 
  user 
}) => {
  const [selectedType, setSelectedType] = useState("");
  const [description, setDescription] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [urgency, setUrgency] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const helpTypes = {
    callback: {
      icon: Phone,
      label: "Request Callback",
      description: "Get a phone call from our team",
      color: "blue",
      requiresTime: true
    },
    googlemeet: {
      icon: Video,
      label: "Schedule Google Meet",
      description: "Set up a video meeting",
      color: "green",
      requiresTime: true
    },
    email: {
      icon: Mail,
      label: "Email Support",
      description: "Send a detailed email inquiry",
      color: "purple",
      requiresTime: false
    },
    urgent: {
      icon: AlertTriangle,
      label: "Urgent Support",
      description: "Immediate attention needed",
      color: "red",
      requiresTime: false
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const helpRequestData = {
        deliverableId: deliverable.id,
        deliverableTitle: deliverable.title,
        clientId: user.uid,
        clientName: user.displayName || user.email,
        clientEmail: user.email,
        type: selectedType,
        description,
        preferredTime: preferredTime || null,
        urgency,
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Add to help requests collection
      await addDoc(collection(db, "helpRequests"), helpRequestData);

      // Update deliverable with help request flag
      await updateDoc(doc(db, "deliverables", deliverable.id), {
        hasActiveHelpRequest: true,
        lastHelpRequestAt: serverTimestamp()
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        // Reset form
        setSelectedType("");
        setDescription("");
        setPreferredTime("");
        setUrgency("medium");
      }, 2000);

    } catch (error) {
      console.error("Error submitting help request:", error);
      alert("Failed to submit help request. Please try again.");
    }
    
    setLoading(false);
  };

  if (!isOpen) return null;

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Help Request Submitted!
          </h3>
          <p className="text-gray-600">
            We'll get back to you soon with assistance for "{deliverable.title}".
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Get Help with Deliverable
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              "{deliverable.title}"
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Help Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              How would you like to get help?
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(helpTypes).map(([type, config]) => {
                const IconComponent = config.icon;
                const isSelected = selectedType === type;
                
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedType(type)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      isSelected
                        ? `border-${config.color}-500 bg-${config.color}-50`
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <IconComponent 
                        className={`w-6 h-6 mt-0.5 ${
                          isSelected 
                            ? `text-${config.color}-600` 
                            : "text-gray-400"
                        }`} 
                      />
                      <div className="flex-1">
                        <h4 className={`font-medium ${
                          isSelected 
                            ? `text-${config.color}-900` 
                            : "text-gray-900"
                        }`}>
                          {config.label}
                        </h4>
                        <p className={`text-sm mt-1 ${
                          isSelected 
                            ? `text-${config.color}-700` 
                            : "text-gray-600"
                        }`}>
                          {config.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preferred Time (for callback and meet) */}
          {selectedType && helpTypes[selectedType].requiresTime && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Preferred Date & Time
              </label>
              <input
                type="datetime-local"
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Please select your preferred time. We'll confirm availability.
              </p>
            </div>
          )}

          {/* Urgency Level */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Urgency Level
            </label>
            <select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="low">Low - Can wait a few days</option>
              <option value="medium">Medium - Should be addressed soon</option>
              <option value="high">High - Urgent attention needed</option>
            </select>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Describe your issue or question
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Please provide details about what you need help with..."
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedType || loading}
              className="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>{loading ? "Submitting..." : "Submit Request"}</span>
            </button>
          </div>
        </form>

        {/* Help Info */}
        <div className="px-6 pb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <Clock className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">Response Times:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-600">
                  <li>Urgent: Within 2-4 hours</li>
                  <li>High priority: Same business day</li>
                  <li>Medium priority: Within 24 hours</li>
                  <li>Low priority: Within 2-3 business days</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpRequestModal;
