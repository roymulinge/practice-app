import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

export default function Navbar({ user }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <nav className="bg-blue-800 text-white p-4 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold hover:text-gray-200">
          DEST HIGH INTL
        </Link>

        <Link to="/student-login" className="hover:text-gray-300" >
          Student Login
        </Link>

        <div className="space-x-4">
          <Link to="/" className="hover:text-gray-300">Home</Link>
          <Link to="/student-portal" className="hover:text-gray-300">Student Portal</Link>
          
          {user ? (
            <>
                {user && localStorage.getItem("role") === "admin" && (
                <Link to="/dashboard">Dashboard</Link>
                )}
              <button 
                onClick={handleLogout} 
                className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm ml-4"
              >
                Logout
              </button>
            </>
          ) : (
            <Link 
              to="/login" 
              className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm"
            >
              Admin Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}