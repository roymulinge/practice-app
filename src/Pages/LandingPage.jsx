import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white px-4">
      <div className="max-w-4xl text-center">
        <div className="mb-8">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            DEST HIGH INTERNATIONAL
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-6">
            Excellence in Education Management
          </p>
        </div>

        <p className="text-lg text-blue-200 mb-10 max-w-2xl mx-auto">
          Streamline student management, fee tracking, and administrative tasks with our comprehensive school portal system.
        </p>

        <div className="flex flex-col md:flex-row gap-6 justify-center items-center mb-16">
          <button
            onClick={() => navigate("/admin-login")}
            className="group relative bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300"
          >
            <span className="relative z-10">Administrator Login</span>
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300"></div>
          </button>

          <button
            onClick={() => navigate("/student-login")}
            className="group relative bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300"
          >
            <span className="relative z-10">Student Portal Access</span>
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300"></div>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
            <h3 className="text-xl font-bold mb-3">Fee Management</h3>
            <p className="text-blue-100">Track payments, generate receipts, and monitor balances in real-time.</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
            <h3 className="text-xl font-bold mb-3">Student Profiles</h3>
            <p className="text-blue-100">Complete student records with academic and financial information.</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
            <h3 className="text-xl font-bold mb-3">Secure Access</h3>
            <p className="text-blue-100">Role-based authentication ensures data security and privacy.</p>
          </div>
        </div>
      </div>

      <footer className="absolute bottom-0 w-full text-center p-6 text-blue-300 text-sm">
        <p>&copy; {new Date().getFullYear()} DEST HIGH INTERNATIONAL. All rights reserved.</p>
        <p className="mt-2 text-xs opacity-75">Version 2.0 | School Management System</p>
      </footer>
    </div>
  );
}