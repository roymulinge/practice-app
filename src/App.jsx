import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

import LandingPage from "./Pages/LandingPage";
import Login from "./Pages/Login"; // Admin login
import AdminDashboard from "./Components/AdminDashboard";
import StudentPortal from "./Pages/StudentPortal";
import Navbar from "./Components/Navbar";
import StudentLogin from "./Pages/StudentLogin";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen to auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading)
    return (
      <p className="min-h-screen flex items-center justify-center">
        Loading...
      </p>
    );

  const role = localStorage.getItem("role"); // "admin" or "student"

  return (
    <Router>
      <Navbar user={user} />

      <Routes>
        <Route path="/" element={<LandingPage />} />

        {/* Admin login */}
        <Route
          path="/login"
          element={
            !user || role !== "admin" ? (
              <Login />
            ) : (
              <Navigate to="/dashboard" />
            )
          }
        />

        {/* Admin dashboard */}
        <Route
          path="/admin-dashboard"
          element={
            user && role === "admin" ? (
              <AdminDashboard />
            ) : (
              <Navigate to="/admin-login" />
            )
          }
        />

        {/* Student login */}
        <Route
          path="/student-login"
          element={
            !user || role !== "student" ? (
              <StudentLogin />
            ) : (
              <Navigate to="/student-portal" />
            )
          }
        />

        {/* Student portal */}
        <Route
          path="/student-portal"
          element={
            user && role === "student" ? (
              <StudentPortal />
            ) : (
              <Navigate to="/student-login" />
            )
          }
        />

        {/* Fallback for all unknown routes */}
        <Route path="*" element={<p>Page not found</p>} />
      </Routes>
    </Router>
  );
}

export default App;
