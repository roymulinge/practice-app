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
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-gray-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="relative flex items-center justify-center">
              {/* Premium animated badge */}
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-xl">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.5 1.5H5.75A2.25 2.25 0 003.5 3.75v12.5A2.25 2.25 0 005.75 18.5h8.5a2.25 2.25 0 002.25-2.25V8.5M10.5 1.5v5h5M10.5 1.5L15.5 6.5" stroke="currentColor" strokeWidth="0.5" fill="none"/>
                  <path d="M7 11h6M7 14h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                DEST HIGH
              </span>
              <span className="block text-xs text-gray-500 font-semibold tracking-wider">INSTITUTION</span>
            </div>
          </Link>

         {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {role === "student" && (
              <Link 
                to="/student-portal" 
                className="text-gray-700 hover:text-blue-600 transition-colors duration-300 font-medium relative group"
              >
                My Portal
                <span className="absolute -bottom-2 left-0 w-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 group-hover:w-full transition-all duration-300 rounded-full"></span>
              </Link>
            )}
            
            {role === "admin" && (
              <Link 
                to="/admin-dashboard" 
                className="text-gray-700 hover:text-blue-600 transition-colors duration-300 font-medium relative group"
              >
                Dashboard
                <span className="absolute -bottom-2 left-0 w-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 group-hover:w-full transition-all duration-300 rounded-full"></span>
              </Link>
            )}
          </div>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="hidden md:flex items-center space-x-3 pr-4 border-r border-gray-200">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                      {role === "admin" ? "A" : "S"}
                    </div>
                  </div>
                  <div>
                    <span className="block font-semibold text-gray-900 text-sm">
                      {role === "admin" ? "Administrator" : "Student"}
                    </span>
                    <span className="block text-xs text-gray-500">
                      {localStorage.getItem(role === "admin" ? "adminEmail" : "studentEmail")}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 rounded-lg font-semibold text-sm transition-all duration-300 border border-red-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="relative" ref={authDropdownRef}>
                <button
                  ref={authButtonRef}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 group text-sm"
                  onClick={toggleAuthDropdown}
                  aria-expanded={isAuthDropdownOpen}
                  aria-haspopup="true"
                >
                  <span>Get Started</span>
                  <svg 
                    className={`w-4 h-4 transition-transform duration-300 ${isAuthDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              
                
                {/* Dropdown Menu */}
                {isAuthDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl overflow-hidden z-50 border border-gray-200 backdrop-blur-xl">
                    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-gray-200">
                      <h3 className="font-bold text-gray-900 text-lg">Access Your Account</h3>
                      <p className="text-gray-600 mt-1 text-sm">Choose your role to get started</p>
                    </div>
                    
                    <div className="p-4">
                      <button
                        onClick={() => handleAuthAction('student-login')}
                        className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-blue-50 transition-all duration-300 text-left group border border-gray-100 hover:border-blue-200 mb-3"
                      >
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div className="absolute -inset-1 bg-blue-200 rounded-xl blur opacity-20 group-hover:opacity-30"></div>
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">Student Login</div>
                          <div className="text-sm text-gray-500">Access your student portal</div>
                        </div>
                        <div className="text-blue-400 group-hover:text-blue-600 transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                      </button>

                      <button
                        onClick={() => handleAuthAction('admin-login')}
                        className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-purple-50 transition-all duration-300 text-left group border border-gray-100 hover:border-purple-200 mb-3"
                      >
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <div className="absolute -inset-1 bg-purple-200 rounded-xl blur opacity-20 group-hover:opacity-30"></div>
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">Admin Login</div>
                          <div className="text-sm text-gray-500">Access admin dashboard</div>
                        </div>
                        <div className="text-purple-400 group-hover:text-purple-600 transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                      </button>

                      <button
                        onClick={() => handleAuthAction('student-signup')}
                        className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-green-50 transition-all duration-300 text-left group border border-gray-100 hover:border-green-200"
                      >
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                          </div>
                          <div className="absolute -inset-1 bg-green-200 rounded-xl blur opacity-20 group-hover:opacity-30"></div>
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">Student Sign Up</div>
                          <div className="text-sm text-gray-500">Create new student account</div>
                        </div>
                        <div className="text-green-400 group-hover:text-green-600 transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

              {/* Mobile Menu Toggle */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden ml-4 mobile-menu-toggle p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <span className={`block w-5 h-0.5 bg-gray-800 transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                <span className={`block w-5 h-0.5 bg-gray-800 mt-1 transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
                <span className={`block w-5 h-0.5 bg-gray-800 mt-1 transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
              </div>
            </button>
          </div>
        </div>
      </div>

       {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div 
          ref={mobileMenuRef}
          className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-2xl rounded-b-2xl overflow-hidden"
        >
          <div className="p-6 space-y-4">
            {role === "student" && (
              <Link 
                to="/student-portal" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-3 px-4 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-300 font-medium"
              >
                My Portal
              </Link>
            )}
            
            {role === "admin" && (
              <Link 
                to="/admin-dashboard" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-3 px-4 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-300 font-medium"
              >
                Dashboard
              </Link>
            )}

            {!user && (
              <div className="pt-4 space-y-3">
                <button
                  onClick={() => handleAuthAction('student-login')}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-lg font-medium text-left"
                >
                  Student Login
                </button>
                <button
                  onClick={() => handleAuthAction('admin-login')}
                  className="w-full py-3 px-4 bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 rounded-lg font-medium text-left"
                >
                  Admin Login
                </button>
                <button
                  onClick={() => handleAuthAction('student-signup')}
                  className="w-full py-3 px-4 bg-gradient-to-r from-green-50 to-green-100 text-green-700 rounded-lg font-medium text-left"
                >
                  Student Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
            