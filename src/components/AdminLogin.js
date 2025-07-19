import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, googleProvider, db } from "../services/firebase";
import { LogIn, Mail, Lock, Shield, AlertCircle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const checkAdminRole = async (user) => {
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();
      
      if (!userData || userData.role !== "admin") {
        throw new Error("Access denied. Admin privileges required.");
      }
      
      return true;
    } catch (error) {
      throw error;
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await checkAdminRole(userCredential.user);
      // If we reach here, user is admin - redirect handled by App.js
    } catch (error) {
      setError(error.message);
      // Sign out if role check failed
      if (auth.currentUser) {
        await auth.signOut();
      }
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      await checkAdminRole(userCredential.user);
      // If we reach here, user is admin - redirect handled by App.js
    } catch (error) {
      setError(error.message);
      // Sign out if role check failed
      if (auth.currentUser) {
        await auth.signOut();
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 fade-in">
        {/* Back to Client Login */}
        <button
          onClick={() => navigate("/client-login")}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span className="text-sm">Client Login</span>
        </button>

        <div className="text-center mb-8">
          <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Portal</h1>
          <p className="text-gray-600">Administrative Access Only</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter admin email"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <LogIn className="w-5 h-5 mr-2" />
                Admin Sign In
              </>
            )}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="mt-4 w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google (Admin)
          </button>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start">
            <Shield className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-sm text-yellow-700">
              <p className="font-medium mb-1">Admin Access Required</p>
              <p>Only users with admin privileges can access this portal. Contact your system administrator if you need admin access.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
