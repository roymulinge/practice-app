import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-center bg-blue-50 text-center px-4">
      
      <h2 className="text-5xl font-bold mb-4 text-blue-900">Welcome To DEST HIGH INTERNATIONAL Portal</h2>
      <p className="text-xl mb-8 text-gray-700">Manage students, fees, and summaries easily</p>
      
      <div className="space-x-4">
        <button
          onClick={() => navigate("/login")}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg text-lg shadow-lg"
        >
          Admin Login
        </button>
        <button
          onClick={() => navigate("/student-login")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg shadow-lg"
        >
          Check Student Details
        </button>
      </div>

        
      <footer className="absolute bottom-0 w-full text-center p-4 text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} DEST HIGH INTERNATIONAL. All rights reserved.
      </footer>
    </div>
  );
}