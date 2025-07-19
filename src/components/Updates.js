import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../services/firebase";
import { Clock, MessageSquare, FileAudio } from "lucide-react";

const Updates = ({ user }) => {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-gray-900">Project Updates</h3>
      </div>

      {/* Updates Feed */}
      <div className="space-y-4">
        {updates.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No updates yet
            </h3>
            <p className="text-gray-600">
              Check back later for project updates from your admin.
            </p>
          </div>
        ) : (
          updates.map((update) => (
            <div
              key={update.id}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                  {update.type === "voice-note" ? (
                    <FileAudio className="w-5 h-5 text-indigo-600" />
                  ) : (
                    <MessageSquare className="w-5 h-5 text-indigo-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {update.title}
                    </h4>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatDate(update.createdAt)}
                    </div>
                  </div>
                  <p className="text-gray-700 mb-3">{update.description}</p>
                  
                  {/* Voice Note Player */}
                  {update.voiceNoteUrl && (
                    <div className="mt-3 p-3 bg-gray-50 rounded border">
                      <div className="flex items-center space-x-2 mb-2">
                        <FileAudio className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-gray-700">Voice Note</span>
                      </div>
                      <audio controls className="w-full">
                        <source src={update.voiceNoteUrl} type="audio/wav" />
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      By {update.author}
                    </span>
                    <div className="flex space-x-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {update.type === "voice-note" ? "Voice Note" : "Text Update"}
                      </span>
                      {update.clientName && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Client: {update.clientName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Updates;
