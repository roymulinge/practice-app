import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

export default function Navbar({ user }) {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

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
    <nav className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white shadow-xl">
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
            {/* Only show the logout UI when we have a signed-in user AND we've set a known role in localStorage.
                This avoids the brief UI flicker where auth is present but role hasn't been verified yet. */}
            {user && role ? (
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
              <Link
                to="/admin-login"
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 px-4 py-2 rounded-lg font-semibold shadow-lg transition-all duration-300"
              >
                Admin Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}