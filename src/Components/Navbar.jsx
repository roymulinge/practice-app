import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

export default function Navbar({ user }) {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const [isAuthDropdownOpen, setIsAuthDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const authDropdownRef = useRef(null);
  const authButtonRef = useRef(null);
  const mobileMenuRef = useRef(null);

  
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
       if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        !event.target.closest('.mobile-menu-toggle')
      ) {
        setIsMobileMenuOpen(false);
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
        setIsMobileMenuOpen(false);
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
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleAuthAction = (action) => {
    setIsAuthDropdownOpen(false);
    if (action === 'student-login') {
      navigate('/student-login');
    } else if (action === 'admin-login') {
      navigate('/admin-login');
    } else if (action === 'student-signup') {
      navigate('/student-signup'); 
    }
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
    <nav className="bg-gradient-to-r from-blue-900         to-indigo-900 text-white shadow-xl mt-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300 shadow-lg">
                <span className="font-bold text-white text-2xl">D</span>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/30 to-transparent rounded-2xl"></div>
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
            </div>
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                DEST HIGH
              </span>
              <span className="block text-xs text-gray-500 font-medium">International School</span>
            </div>
          </Link>

         {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-blue-600 transition-colors duration-300 font-medium text-lg relative group"
            >
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
            
            {role === "student" && (
              <Link 
                to="/student-portal" 
                className="text-gray-700 hover:text-blue-600 transition-colors duration-300 font-medium text-lg relative group"
              >
                My Portal
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
            )}
            
            {role === "admin" && (
              <Link 
                to="/admin-dashboard" 
                className="text-gray-700 hover:text-blue-600 transition-colors duration-300 font-medium text-lg relative group"
              >
                Dashboard
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
            )}
            
            
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
            <div className="relative" ref={authDropdownRef}>
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

              {/* Dropdown Menu */}
                {isAuthDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl overflow-hidden z-50 border border-gray-200">
                    <div className="p-4 border-b border-gray-100">
                      <h3 className="font-bold text-gray-800">Welcome to DEST HIGH</h3>
                      <p className="text-sm text-gray-600 mt-1">Choose your login option</p>
                    </div>
                    
                    <div className="p-2">
                      <button
                        onClick={() => handleAuthAction('student-login')}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors text-left group"
                      >
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">Student Login</div>
                          <div className="text-xs text-gray-500">Access your student portal</div>
                        </div>
                        <span className="text-gray-400 group-hover:text-blue-600 transition-colors">→</span>
                      </button>

                      <button
                        onClick={() => handleAuthAction('admin-login')}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-purple-50 transition-colors text-left group mt-2"
                      >
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">Admin Login</div>
                          <div className="text-xs text-gray-500">Access admin dashboard</div>
                        </div>
                        <span className="text-gray-400 group-hover:text-purple-600 transition-colors">→</span>
                      </button>

                      <button
                        onClick={() => handleAuthAction('student-signup')}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-green-50 transition-colors text-left group mt-2"
                      >
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">Student Sign up</div>
                          <div className="text-xs text-gray-500">Create new student account</div>
                        </div>
                        <span className="text-gray-400 group-hover:text-green-600 transition-colors">→</span>
                      </button>
                    </div>

              <div className="p-3 bg-gray-50 border-t border-gray-100">
                      <p className="text-xs text-center text-gray-600">
                        Need help? <a href="/contact" className="text-blue-600 hover:underline">Contact support</a>
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}