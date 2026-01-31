import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

import LandingPage from "./Pages/LandingPage";
import AdminLogin from "./Pages/AdminLogin";
import AdminDashboard from "./Components/AdminDashboard";
import StudentPortal from "./Pages/StudentPortal";
import Navbar from "./Components/Navbar";
import StudentLogin from "./Pages/StudentLogin";
import StudentSignup from "./Pages/StudentSignup";

// Layout wrapper to handle conditional navbar
function AppLayout({ user, children }) {
  const location = useLocation();
  const authPages = ["/admin-login", "/student-login", "/student-signup"];
  const showNavbar = !authPages.includes(location.pathname);

  return (
    <>
      {showNavbar && <Navbar user={user} />}
      {children}
    </>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  const role = localStorage.getItem("role");

  return (
    <Router>
      <AppLayout user={user}>
        <Routes>
        <Route path="/" element={<LandingPage />} />
        
        <Route path="/admin-login" element={
          !user || role !== "admin" ? <AdminLogin /> : <Navigate to="/admin-dashboard" />
        } />
        
        <Route path="/admin-dashboard" element={
            user && role === "admin" ? <AdminDashboard /> : <Navigate to="/admin-login" />
        } />
       
        <Route path="/student-login" element={
          !user || role !== "student" ? <StudentLogin /> : <Navigate to="/student-portal" />
        } />

        <Route path="/student-signup" element={
          !user || role !== "student" ? <StudentSignup /> : <Navigate to="/student-portal" />
        } />
        
        <Route path="/student-portal" element={
          user && role === "student" ? <StudentPortal /> : <Navigate to="/student-login" />
        } />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;