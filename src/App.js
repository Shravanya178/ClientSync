// App component placeholder
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./services/firebase";
import AdminLogin from "./components/AdminLogin";
import ClientLogin from "./components/ClientLogin";
import Dashboard from "./components/Dashboard";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Get user role from Firestore
          const userDoc = await getDoc(doc(db, "users", user.uid));
          const userData = userDoc.data();
          
          setUser(user);
          setUserRole(userData?.role || "client");
        } catch (error) {
          console.error("Error fetching user role:", error);
          setUser(user);
          setUserRole("client"); // Default to client if error
        }
      } else {
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ClientSync...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Client Login Route */}
          <Route
            path="/client-login"
            element={!user ? <ClientLogin /> : <Navigate to="/dashboard" />}
          />
          
          {/* Admin Login Route */}
          <Route
            path="/admin-login"
            element={!user ? <AdminLogin /> : <Navigate to="/dashboard" />}
          />
          
          {/* Legacy Login Route - redirect to client login */}
          <Route
            path="/login"
            element={<Navigate to="/client-login" />}
          />
          
          {/* Dashboard Route */}
          <Route
            path="/dashboard"
            element={
              user ? (
                <Dashboard user={user} userRole={userRole} />
              ) : (
                <Navigate to="/client-login" />
              )
            }
          />
          
          {/* Root Route */}
          <Route
            path="/"
            element={
              <Navigate 
                to={user ? "/dashboard" : "/client-login"} 
                replace 
              />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
