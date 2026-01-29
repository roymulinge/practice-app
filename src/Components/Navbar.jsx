import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

export default function Navbar({ user }) {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const [isAuthDropdownOpen, setIsAuthDropdownOpen] = useState(false);
  const authDropdownRef = useRef(null);
  const authButtonRef = useRef(null);


  
  // Close dropdown when clicking outside
   useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        authDropdownRef.current && 
        !authDropdownRef.current.contains(event.target) &&
        authButtonRef.current && 
        !authButtonRef.current.contains(event.target)
      ) {
        setIsAuthDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

   // Close dropdown on Escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsAuthDropdownOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

   const toggleAuthDropdown = () => {
    setIsAuthDropdownOpen(!isAuthDropdownOpen);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("role");
      localStorage.removeItem("adminEmail");
      localStorage.removeItem("studentEmail");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <nav className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white shadow-xl mt-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-white to-blue-200 rounded-lg flex items-center justify-center">
              <span className="font-bold text-blue-900 text-lg">D</span>
            </div>
            <span className="text-xl font-bold">DEST HIGH INTL</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="hover:text-blue-200 transition-colors">Home</Link>
            
            {role === "student" && (
              <Link to="/student-portal" className="hover:text-blue-200 transition-colors">My Portal</Link>
            )}
            
            {role === "admin" && (
              <Link to="/admin-dashboard" className="hover:text-blue-200 transition-colors">Dashboard</Link>
            )}
            
            <Link to="/student-login" className="hover:text-blue-200 transition-colors">Student Login</Link>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="hidden md:inline text-sm bg-white/20 px-3 py-1 rounded-full">
                  {role === "admin" ? "Administrator" : "Student"}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 px-4 py-2 rounded-lg font-semibold shadow-lg transition-all duration-300"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                ref={authButtonRef}
                 
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg font-semibold transition-all duration-300 backdrop-blur-sm border border-white/20"
              onClick={toggleAuthDropdown}
              aria-expanded={isAuthDropdownOpen}
              aria-haspopup="true">
              {/* <Link
                to="/admin-login"
                className="bg-gradient-to-r bg-pink-500 hover:bg-pink-600 px-10 py-4 rounded-full font-semibold shadow-xl
"
              > */}
                <span>Login / Sign up</span>
              {/* </Link> */}
             <svg 
                    className={`w-4 h-4 transition-transform ${isAuthDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
              </button>
              
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}