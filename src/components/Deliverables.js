// Deliverables component placeholder
import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../services/firebase";
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  Plus,
  Calendar,
  Send,
} from "lucide-react";

const Deliverables = ({ user, isAdminView }) => {
  const [deliverables, setDeliverables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDeliverable, setNewDeliverable] = useState({
    title: "",
    description: "",
    deadline: "",
    priority: "medium",
  });

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
      
      // Filter deliverables for the current user (when not in admin view)
      let filteredData = deliverablesData;
      if (!isAdminView) {
        // Show deliverables for the current user based on email or display name
        filteredData = deliverablesData.filter(deliverable => 
          deliverable.clientName === (user.displayName || user.email) ||
          deliverable.createdBy === user.uid ||
          !deliverable.clientName // Show legacy deliverables without client assignment
        );
      }
      
      setDeliverables(filteredData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isAdminView, user]);

  const handleAddDeliverable = async (e) => {
    e.preventDefault();
    if (!newDeliverable.title.trim() || !newDeliverable.deadline) return;

    try {
      await addDoc(collection(db, "deliverables"), {
        title: newDeliverable.title,
        description: newDeliverable.description,
        deadline: new Date(newDeliverable.deadline),
        priority: newDeliverable.priority,
        status: "pending",
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        clientName: isAdminView ? "All Clients" : (user.displayName || user.email),
        projectName: "General",
        isFromAdmin: isAdminView,
      });
      setNewDeliverable({
        title: "",
        description: "",
        deadline: "",
        priority: "medium",
      });
      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding deliverable:", error);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, "deliverables", id), {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "status-completed";
      case "in-progress":
        return "status-in-progress";
      default:
        return "status-pending";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "priority-high";
      case "low":
        return "priority-low";
      default:
        return "priority-medium";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "in-progress":
        return <Clock className="w-5 h-5 text-blue-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
    }
  };

  const isOverdue = (deadline) => {
    return deadline && new Date() > deadline;
  };

  const formatDeadline = (deadline) => {
    if (!deadline) return "No deadline";
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(deadline);
  };

  const filteredDeliverables = deliverables.filter((item) => {
    if (filter === "all") return true;
    return item.status === filter;
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
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white border-2 border-black">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-bold flex items-center">
              <CheckCircle className="w-8 h-8 mr-3" />
              Deliverables
            </h3>
            <p className="text-blue-100 mt-1">
              {isAdminView ? "Manage client deliverables and deadlines" : "Track your project deliverables"}
            </p>
          </div>
          {isAdminView && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center space-x-2 bg-white text-blue-600 px-6 py-3 rounded-xl hover:bg-blue-50 transition-all shadow-lg font-medium"
            >
              <Plus className="w-5 h-5" />
              <span>Add Deliverable</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl p-2 shadow-lg border-2 border-black">
        <div className="flex space-x-1">
          {["all", "pending", "in-progress", "completed"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium capitalize transition-all ${
                filter === status
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
              }`}
            >
              {status === "all" ? "All Items" : status.replace("-", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Add Deliverable Form (Admin Only) */}
      {isAdminView && showAddForm && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl shadow-lg border border-blue-200 slide-in">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Plus className="w-5 h-5 mr-2 text-blue-600" />
            Add New Deliverable
          </h3>
          <form onSubmit={handleAddDeliverable} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={newDeliverable.title}
                  onChange={(e) =>
                    setNewDeliverable({
                      ...newDeliverable,
                      title: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Deliverable title..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deadline
                </label>
                <input
                  type="date"
                  value={newDeliverable.deadline}
                  onChange={(e) =>
                    setNewDeliverable({
                      ...newDeliverable,
                      deadline: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={newDeliverable.description}
                onChange={(e) =>
                  setNewDeliverable({
                    ...newDeliverable,
                    description: e.target.value,
                  })
                }
                rows={3}
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Deliverable description..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={newDeliverable.priority}
                onChange={(e) =>
                  setNewDeliverable({
                    ...newDeliverable,
                    priority: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
              >
                <Send className="w-4 h-4" />
                <span>Add Deliverable</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Deliverables List */}
      <div className="space-y-4">
        {filteredDeliverables.length === 0 ? (
          <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border-2 border-black">
            <CheckCircle className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No deliverables found
            </h3>
            <p className="text-gray-600">
              {filter === "all"
                ? "No deliverables have been added yet."
                : `No ${filter.replace("-", " ")} deliverables found.`}
            </p>
          </div>
        ) : (
          filteredDeliverables.map((deliverable) => (
            <div
              key={deliverable.id}
              className={`bg-white p-6 rounded-2xl shadow-lg border-2 border-black hover:shadow-xl transition-all card-hover ${
                isOverdue(deliverable.deadline) &&
                deliverable.status !== "completed"
                  ? "bg-gradient-to-br from-red-50 to-pink-50 border-red-400"
                  : "bg-gradient-to-br from-white to-gray-50"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="mt-1">
                    {getStatusIcon(deliverable.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {deliverable.title}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(
                            deliverable.priority
                          )}`}
                        >
                          {deliverable.priority}
                        </span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                            deliverable.status
                          )}`}
                        >
                          {deliverable.status.replace("-", " ")}
                        </span>
                      </div>
                    </div>
                    {deliverable.description && (
                      <p className="text-gray-700 mb-3">
                        {deliverable.description}
                      </p>
                    )}
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span
                        className={
                          isOverdue(deliverable.deadline) &&
                          deliverable.status !== "completed"
                            ? "text-red-600 font-medium"
                            : ""
                        }
                      >
                        {formatDeadline(deliverable.deadline)}
                        {isOverdue(deliverable.deadline) &&
                          deliverable.status !== "completed" &&
                          " (Overdue)"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Update Buttons (Admin Only) */}
                {isAdminView && (
                  <div className="ml-4 flex space-x-2">
                    <button
                      onClick={() =>
                        updateStatus(deliverable.id, "in-progress")
                      }
                      disabled={deliverable.status === "in-progress"}
                      className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      In Progress
                    </button>
                    <button
                      onClick={() => updateStatus(deliverable.id, "completed")}
                      disabled={deliverable.status === "completed"}
                      className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Complete
                    </button>
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
