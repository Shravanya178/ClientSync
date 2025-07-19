import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../services/firebase";
import { 
  Ticket, 
  Clock, 
  User, 
  Calendar,
  AlertCircle,
  MessageSquare,
  Phone,
  Mail,
  Video,
  CheckCircle,
  X,
  Plus,
  Send
} from "lucide-react";

const AdminTickets = ({ user, selectedClient, selectedProject }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [responseText, setResponseText] = useState("");

  useEffect(() => {
    const ticketsRef = collection(db, "tickets");
    // Use a simple query to avoid needing composite indexes
    const q = query(ticketsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ticketsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        status: 'pending',
        priority: 'medium',
        requestType: 'general',
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      }));
      
      // Filter client-side to avoid composite index requirements
      let filteredTickets = ticketsData;
      
      if (selectedClient && selectedProject) {
        filteredTickets = ticketsData.filter(ticket => 
          ticket.clientName === selectedClient && ticket.projectName === selectedProject
        );
      } else if (selectedClient) {
        filteredTickets = ticketsData.filter(ticket => 
          ticket.clientName === selectedClient
        );
      }
      
      setTickets(filteredTickets);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedClient, selectedProject]);

  const updateTicketStatus = async (ticketId, newStatus) => {
    try {
      const ticketRef = doc(db, "tickets", ticketId);
      await updateDoc(ticketRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
        resolvedBy: newStatus === "resolved" ? user.displayName || user.email : null,
      });
    } catch (error) {
      console.error("Error updating ticket status:", error);
    }
  };

  const addResponse = async (ticketId) => {
    if (!responseText.trim()) return;

    try {
      const ticketRef = doc(db, "tickets", ticketId);
      const ticket = tickets.find(t => t.id === ticketId);
      
      await updateDoc(ticketRef, {
        responses: [
          ...(ticket.responses || []),
          {
            text: responseText,
            author: user.displayName || user.email,
            isAdmin: true,
            createdAt: new Date(),
          }
        ],
        status: "in-progress",
        updatedAt: serverTimestamp(),
      });
      
      setResponseText("");
    } catch (error) {
      console.error("Error adding response:", error);
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    if (filter === "all") return true;
    if (filter === "callback-requests") return ticket.requestType === "callback";
    if (filter === "meeting-requests") return ticket.requestType === "meeting";
    if (filter === "email-requests") return ticket.requestType === "email";
    if (filter === "pending") return ticket.status === "pending";
    if (filter === "in-progress") return ticket.status === "in-progress";
    if (filter === "resolved") return ticket.status === "resolved";
    return true;
  });

  const formatDate = (date) => {
    if (!date) return "";
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    switch (status) {
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    if (!priority) return 'bg-gray-100 text-gray-800';
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

  const getRequestTypeIcon = (type) => {
    switch (type) {
      case 'callback':
        return <Phone className="w-4 h-4" />;
      case 'meeting':
        return <Video className="w-4 h-4" />;
      case 'email':
        return <Mail className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getRequestTypeLabel = (type) => {
    switch (type) {
      case 'callback':
        return 'Callback Request';
      case 'meeting':
        return 'Google Meet Request';
      case 'email':
        return 'Email Request';
      default:
        return 'General Inquiry';
    }
  };

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
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Client Tickets
              {selectedClient && ` - ${selectedClient}`}
              {selectedProject && ` (${selectedProject})`}
            </h3>
            <p className="text-gray-600">Manage client requests and communications</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === "all" 
                ? "bg-red-100 text-red-800" 
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All ({tickets.length})
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === "pending" 
                ? "bg-yellow-100 text-yellow-800" 
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Pending ({tickets.filter(t => t.status === "pending").length})
          </button>
          <button
            onClick={() => setFilter("in-progress")}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === "in-progress" 
                ? "bg-blue-100 text-blue-800" 
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            In Progress ({tickets.filter(t => t.status === "in-progress").length})
          </button>
          <button
            onClick={() => setFilter("resolved")}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === "resolved" 
                ? "bg-green-100 text-green-800" 
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Resolved ({tickets.filter(t => t.status === "resolved").length})
          </button>
          <div className="border-l pl-2 ml-2">
            <button
              onClick={() => setFilter("callback-requests")}
              className={`px-3 py-1 rounded-full text-sm ${
                filter === "callback-requests" 
                  ? "bg-blue-100 text-blue-800" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Callback Requests ({tickets.filter(t => t.requestType === "callback").length})
            </button>
            <button
              onClick={() => setFilter("meeting-requests")}
              className={`px-3 py-1 rounded-full text-sm ml-2 ${
                filter === "meeting-requests" 
                  ? "bg-purple-100 text-purple-800" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Meeting Requests ({tickets.filter(t => t.requestType === "meeting").length})
            </button>
            <button
              onClick={() => setFilter("email-requests")}
              className={`px-3 py-1 rounded-full text-sm ml-2 ${
                filter === "email-requests" 
                  ? "bg-green-100 text-green-800" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Email Requests ({tickets.filter(t => t.requestType === "email").length})
            </button>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Ticket className="w-5 h-5 mr-2" />
            {filter === "all" ? "All Tickets" : 
             filter === "callback-requests" ? "Callback Requests" :
             filter === "meeting-requests" ? "Meeting Requests" :
             filter === "email-requests" ? "Email Requests" :
             filter ? filter.charAt(0).toUpperCase() + filter.slice(1) + " Tickets" : "Tickets"} 
            ({filteredTickets.length})
          </h3>
        </div>
        <div className="p-6">
          {filteredTickets.length === 0 ? (
            <div className="text-center py-8">
              <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {filter === "all" ? "No tickets yet" : `No ${filter.replace("-", " ")} tickets`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTickets.map((ticket) => (
                <div key={ticket.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getRequestTypeIcon(ticket.requestType)}
                        <h4 className="font-semibold text-gray-900">{ticket.subject}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                          {ticket.status ? ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1) : 'Unknown'}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority ? ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1) : 'Normal'} Priority
                        </span>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-2">{ticket.description}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                        <span className="flex items-center">
                          <User className="w-3 h-3 mr-1" />
                          {ticket.clientName}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(ticket.createdAt)}
                        </span>
                        <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                          {getRequestTypeLabel(ticket.requestType)}
                        </span>
                      </div>

                      {/* Deliverable Info */}
                      {ticket.deliverableName && (
                        <div className="text-sm text-blue-600 mb-2">
                          Related to: {ticket.deliverableName}
                        </div>
                      )}

                      {/* Client Contact Info for callback/meeting requests */}
                      {(ticket.requestType === "callback" || ticket.requestType === "meeting") && ticket.contactInfo && (
                        <div className="bg-blue-50 p-2 rounded text-sm text-blue-800 mb-2">
                          Contact: {ticket.contactInfo}
                        </div>
                      )}

                      {/* Preferred Time for meeting requests */}
                      {ticket.requestType === "meeting" && ticket.preferredTime && (
                        <div className="bg-purple-50 p-2 rounded text-sm text-purple-800 mb-2">
                          Preferred Time: {ticket.preferredTime}
                        </div>
                      )}

                      {/* Responses */}
                      {ticket.responses && ticket.responses.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <h5 className="font-medium text-gray-800 mb-2">Responses:</h5>
                          <div className="space-y-2">
                            {ticket.responses.map((response, index) => (
                              <div key={index} className={`p-2 rounded text-sm ${
                                response.isAdmin ? "bg-red-50 border-l-4 border-red-500" : "bg-blue-50 border-l-4 border-blue-500"
                              }`}>
                                <div className="font-medium text-gray-800">
                                  {response.author} {response.isAdmin ? "(Admin)" : "(Client)"}
                                </div>
                                <div className="text-gray-700">{response.text}</div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {formatDate(new Date(response.createdAt))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Add Response for non-resolved tickets */}
                      {ticket.status !== "resolved" && selectedTicket === ticket.id && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              value={responseText}
                              onChange={(e) => setResponseText(e.target.value)}
                              placeholder="Type your response..."
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                              onKeyPress={(e) => e.key === "Enter" && addResponse(ticket.id)}
                            />
                            <button
                              onClick={() => addResponse(ticket.id)}
                              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center space-x-1"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      {ticket.status !== "resolved" && (
                        <>
                          <button
                            onClick={() => setSelectedTicket(selectedTicket === ticket.id ? null : ticket.id)}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center space-x-1"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>Respond</span>
                          </button>
                          <button
                            onClick={() => updateTicketStatus(ticket.id, "in-progress")}
                            className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
                          >
                            In Progress
                          </button>
                          <button
                            onClick={() => updateTicketStatus(ticket.id, "resolved")}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 flex items-center space-x-1"
                          >
                            <CheckCircle className="w-3 h-3" />
                            <span>Resolve</span>
                          </button>
                        </>
                      )}
                      
                      {ticket.status === "resolved" && ticket.resolvedBy && (
                        <div className="text-xs text-gray-500 text-right">
                          Resolved by:<br />{ticket.resolvedBy}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm text-gray-500 pt-3 border-t">
                    <span>Project: {ticket.projectName}</span>
                    <span>Ticket ID: {ticket.id.slice(-8)}</span>
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

export default AdminTickets;
