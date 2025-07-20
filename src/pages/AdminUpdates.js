import React, { useState, useEffect, useRef } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../services/firebase";
import { 
  Clock, 
  MessageSquare, 
  Plus, 
  Send, 
  Mic, 
  Square, 
  Play, 
  Pause,
  Upload,
  FileAudio,
  User,
  Calendar,
  AlertCircle
} from "lucide-react";

const AdminUpdates = ({ user, selectedClient, selectedProject }) => {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newUpdate, setNewUpdate] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);

  useEffect(() => {
    const updatesRef = collection(db, "updates");
    // Use a simple query to avoid needing composite indexes
    const q = query(updatesRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updatesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      }));
      
      // Filter client-side to avoid composite index requirements
      let filteredUpdates = updatesData;
      
      if (selectedClient && selectedProject) {
        filteredUpdates = updatesData.filter(update => 
          update.clientName === selectedClient && update.projectName === selectedProject
        );
      } else if (selectedClient) {
        filteredUpdates = updatesData.filter(update => 
          update.clientName === selectedClient
        );
      }
      
      setUpdates(filteredUpdates);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedClient, selectedProject]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      alert("Error accessing microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playRecording = () => {
    if (audioBlob) {
      const audioUrl = URL.createObjectURL(audioBlob);
      audioRef.current.src = audioUrl;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const pauseRecording = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const uploadAudio = async () => {
    if (!audioBlob) return null;

    setUploadingAudio(true);
    try {
      const fileName = `voice-notes/${user.uid}/${Date.now()}_voice_note.wav`;
      const storageRef = ref(storage, fileName);
      
      // Upload the blob directly
      const snapshot = await uploadBytes(storageRef, audioBlob, {
        contentType: 'audio/wav',
      });
      
      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading audio:", error);
      alert("Failed to upload voice note. Please check Firebase Storage rules and try again.");
      throw error;
    } finally {
      setUploadingAudio(false);
    }
  };

  const handleAddUpdate = async (e) => {
    e.preventDefault();
    if (!newUpdate.trim() && !audioBlob) return;
    if (!selectedClient) {
      alert("Please select a client first");
      return;
    }

    try {
      let audioUrl = null;
      if (audioBlob) {
        audioUrl = await uploadAudio();
      }

      await addDoc(collection(db, "updates"), {
        title: newUpdate || "Voice Note Update",
        description: newUpdate || "Voice note sent by admin",
        clientName: selectedClient,
        projectName: selectedProject || "General",
        voiceNoteUrl: audioUrl,
        createdAt: serverTimestamp(),
        author: user.displayName || user.email,
        type: audioUrl ? "voice-note" : "text",
        isFromAdmin: true,
      });
      
      setNewUpdate("");
      setAudioBlob(null);
      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding update:", error);
      alert("Error sending update. Please try again.");
    }
  };

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

  if (!selectedClient) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
          <h3 className="text-lg font-medium text-yellow-800">No Client Selected</h3>
        </div>
        <p className="text-yellow-700 mt-2">
          Please select a client from the Client Management tab to send updates.
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
              Updates for {selectedClient}
              {selectedProject && ` - ${selectedProject}`}
            </h3>
            <p className="text-gray-600">Send voice notes and text updates to your client</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Update</span>
          </button>
        </div>
      </div>

      {/* Add Update Form */}
      {showAddForm && (
        <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl shadow-lg p-6 border-2 border-red-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Plus className="w-6 h-6 mr-3 text-red-600" />
            Send Update
          </h3>
          <form onSubmit={handleAddUpdate} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Update Message
              </label>
              <textarea
                value={newUpdate}
                onChange={(e) => setNewUpdate(e.target.value)}
                placeholder="Type your update message..."
                rows={4}
                className="w-full px-4 py-3 border-2 border-red-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
              />
            </div>

            {/* Voice Note Section */}
            <div className="bg-white rounded-xl p-4 border border-red-200">
              <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                <Mic className="w-4 h-4 mr-2 text-red-600" />
                Voice Note (Optional)
              </label>
              <div className="flex items-center space-x-4">
                {!isRecording && !audioBlob && (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 flex items-center space-x-2 shadow-lg transition-all"
                  >
                    <Mic className="w-5 h-5" />
                    <span>Start Recording</span>
                  </button>
                )}

                {isRecording && (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:from-red-700 hover:to-pink-700 flex items-center space-x-2 animate-pulse shadow-lg transition-all"
                  >
                    <Square className="w-5 h-5" />
                    <span>Stop Recording</span>
                  </button>
                )}

                {audioBlob && !isRecording && (
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={isPlaying ? pauseRecording : playRecording}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center space-x-2"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      <span>{isPlaying ? "Pause" : "Play"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAudioBlob(null)}
                      className="text-gray-600 hover:text-red-600"
                    >
                      Delete Recording
                    </button>
                  </div>
                )}
              </div>
              <audio
                ref={audioRef}
                onEnded={() => setIsPlaying(false)}
                style={{ display: 'none' }}
              />
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setNewUpdate("");
                  setAudioBlob(null);
                }}
                className="px-6 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={(!newUpdate.trim() && !audioBlob) || uploadingAudio}
                className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:from-red-700 hover:to-pink-700 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all font-medium"
              >
                {uploadingAudio ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Send Update</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Updates List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            Updates ({updates.length})
          </h3>
        </div>
        <div className="p-6">
          {updates.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No updates yet</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="mt-2 text-red-600 hover:text-red-700"
              >
                Send your first update
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {updates.map((update) => (
                <div
                  key={update.id}
                  className={`p-4 rounded-lg border ${
                    update.isFromAdmin 
                      ? "bg-red-50 border-red-200" 
                      : "bg-blue-50 border-blue-200"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        update.isFromAdmin ? "bg-red-100" : "bg-blue-100"
                      }`}>
                        <User className={`w-4 h-4 ${
                          update.isFromAdmin ? "text-red-600" : "text-blue-600"
                        }`} />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{update.title}</h4>
                        <p className="text-sm text-gray-600">
                          by {update.author} • {update.isFromAdmin ? "Admin" : "Client"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(update.createdAt)}
                      </div>
                      {update.type === "voice-note" && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 mt-1">
                          <FileAudio className="w-3 h-3 mr-1" />
                          Voice Note
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-3">{update.description}</p>
                  
                  {update.voiceNoteUrl && (
                    <div className="mt-3 p-3 bg-white rounded border">
                      <audio controls className="w-full">
                        <source src={update.voiceNoteUrl} type="audio/wav" />
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-sm text-gray-500 mt-3">
                    <span>Client: {update.clientName}</span>
                    <span>Project: {update.projectName}</span>
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

export default AdminUpdates;
