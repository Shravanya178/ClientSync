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
import { Clock, MessageSquare, Plus, Send } from "lucide-react";

const Updates = ({ user, isAdminView }) => {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newUpdate, setNewUpdate] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    const updatesRef = collection(db, "updates");
    const q = query(updatesRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updatesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      }));
      setUpdates(updatesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAddUpdate = async (e) => {
    e.preventDefault();
    if (!newUpdate.trim()) return;

    try {
      await addDoc(collection(db, "updates"), {
        title: newUpdate,
        description: "Project update added by admin",
        createdAt: serverTimestamp(),
        author: user.displayName || user.email,
        type: "general",
      });
      setNewUpdate("");
      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding update:", error);
    }
  };

  const formatDate = (date) => {
    if (!date) return "Just now";
    return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
      Math.ceil((date - new Date()) / (1000 * 60 * 60 * 24)),
      "day"
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <span className="mr-2">📰</span>
            Recent Updates
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Latest project news and announcements
          </p>
        </div>
        
        {isAdminView && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Add Update Form - Enhanced */}
      {showAddForm && isAdminView && (
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-6 mb-6 border-2 border-indigo-200 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Plus className="w-5 h-5 mr-2 text-indigo-600" />
            Add New Update
          </h3>
          <form onSubmit={handleAddUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Update Title
              </label>
              <input
                type="text"
                value={newUpdate}
                onChange={(e) => setNewUpdate(e.target.value)}
                placeholder="Enter update title..."
                className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                required
              />
            </div>
            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-6 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-2 rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all flex items-center space-x-2 shadow-lg font-medium"
              >
                <Send className="w-4 h-4" />
                <span>Post Update</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Updates List - Compact */}
      <div className="space-y-3">
        {updates.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No updates yet</p>
          </div>
        ) : (
          updates.slice(0, 4).map((update) => (
            <div
              key={update.id}
              className="border-l-4 border-indigo-500 pl-4 py-2 hover:bg-gray-50 rounded-r-lg transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 text-sm">
                    {update.title}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    by {update.author} • {formatDate(update.createdAt)}
                  </p>
                </div>
                <Clock className="w-4 h-4 text-gray-400 ml-2 flex-shrink-0" />
              </div>
            </div>
          ))
        )}
        
        {updates.length > 4 && (
          <div className="text-center pt-2">
            <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
              View all updates ({updates.length})
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Updates;
