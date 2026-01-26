import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

import LandingPage from "./Pages/LandingPage";
import Login from "./Pages/Login";
import AdminDashboard from "./Components/AdminDashboard";
import StudentPortal from "./Pages/StudentPortal";
import Navbar from "./Components/Navbar"; // Import the new Navbar
import StudentLogin from "./Pages/StudentLogin";
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return <p className="min-h-screen flex items-center justify-center">Loading...</p>;

  return (
    <Router>
      {/* Navbar sits outside Routes so it is visible on all pages */}
      <Navbar user={user} />
      
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/student-portal" element={user ? <StudentPortal /> : <Navigate to="/student-login" />}/>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={user ? <AdminDashboard /> : <Navigate to="/login" />} />
        <Route path="/student-login" element={!user ? <StudentLogin /> : <Navigate to="/student-portal" />} />
      </Routes>
    </Router>
  );
}

export default App;