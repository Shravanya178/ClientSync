import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  where,
} from "firebase/firestore";
import { db } from "../services/firebase";
import { ChartBar, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import RadialProgress from "./RadialProgress";

const Progress = ({ user, isAdminView }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [overallProgress, setOverallProgress] = useState(0);
  const [onTrackCount, setOnTrackCount] = useState(0);
  const [delayedCount, setDelayedCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    const projectsRef = collection(db, "projects");
    let q;
    
    if (isAdminView) {
      q = query(projectsRef, orderBy("updatedAt", "desc"));
    } else {
      q = query(
        projectsRef, 
        where("clientId", "==", user.uid),
        orderBy("updatedAt", "desc")
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      setProjects(projectsData);
      
      // Calculate overall progress
      if (projectsData.length > 0) {
        const totalProgress = projectsData.reduce((sum, project) => 
          sum + (project.progress || 0), 0);
        setOverallProgress(Math.round(totalProgress / projectsData.length));
        
        // Count projects by status
        setOnTrackCount(projectsData.filter(p => p.status === "on-track").length);
        setDelayedCount(projectsData.filter(p => p.status === "delayed").length);
        setCompletedCount(projectsData.filter(p => p.status === "completed").length);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user.uid, isAdminView]);

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-2xl shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Project Progress</h2>
        <div className="flex justify-center py-8">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-gray-200 h-24 w-24"></div>
            <div className="flex-1 space-y-6 py-1">
              <div className="h-2 bg-gray-200 rounded"></div>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-2 bg-gray-200 rounded col-span-2"></div>
                  <div className="h-2 bg-gray-200 rounded col-span-1"></div>
                </div>
                <div className="h-2 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md border border-gray-100">
      <h2 className="text-xl font-semibold mb-6 flex items-center">
        <ChartBar className="w-6 h-6 mr-2 text-blue-600" />
        Project Progress
      </h2>
      
      {projects.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No projects found</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-blue-50 p-4 rounded-xl flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600">Overall Progress</h3>
                <p className="text-2xl font-bold text-blue-600">{overallProgress}%</p>
              </div>
              <div className="w-16 h-16">
                <RadialProgress value={overallProgress} color="#2563EB" />
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-xl">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-medium text-gray-600">On Track</h3>
                  <p className="text-2xl font-bold text-green-600">{onTrackCount}</p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-500 opacity-70" />
              </div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-xl">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-medium text-gray-600">Delayed</h3>
                  <p className="text-2xl font-bold text-yellow-600">{delayedCount}</p>
                </div>
                <Clock className="w-10 h-10 text-yellow-500 opacity-70" />
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-xl">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-medium text-gray-600">Completed</h3>
                  <p className="text-2xl font-bold text-purple-600">{completedCount}</p>
                </div>
                <AlertTriangle className="w-10 h-10 text-purple-500 opacity-70" />
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Project Details</h3>
            
            {projects.map((project) => (
              <div 
                key={project.id} 
                className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-800">{project.name}</h4>
                  <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                    project.status === "on-track" 
                      ? "bg-green-100 text-green-800" 
                      : project.status === "delayed"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-blue-100 text-blue-800"
                  }`}>
                    {project.status === "on-track" 
                      ? "On Track" 
                      : project.status === "delayed"
                      ? "Delayed"
                      : "Completed"
                    }
                  </span>
                </div>
                
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">{project.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${project.progress || 0}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Start: {project.startDate?.toDate().toLocaleDateString()}</span>
                  <span>Due: {project.endDate?.toDate().toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Progress;
