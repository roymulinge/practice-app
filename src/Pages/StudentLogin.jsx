import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";

function StudentLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

     try {
      const credentials = await signInWithEmailAndPassword(auth, email, password);
      const uid = credentials.user.uid;

      // Check BOTH collections for student data
      const [userDoc, studentDoc] = await Promise.all([
        getDoc(doc(db, "users", uid)),
        getDoc(doc(db, "students", uid))
      ]);

      // Either document should exist with student role
      const isStudentInUsers = userDoc.exists() && userDoc.data().role === "student";
      const isStudentInStudents = studentDoc.exists();

      if (!isStudentInUsers && !isStudentInStudents) {
        await auth.signOut();
        setError("Student account not found or not properly configured.");
        return;
      }

      // Store data from whichever document exists
      const studentData = isStudentInUsers ? userDoc.data() : studentDoc.data();
      
      localStorage.setItem("role", "student");
      localStorage.setItem("studentEmail", email);
      localStorage.setItem("studentName", studentData.name || `${studentData.firstName} ${studentData.lastName}`);
      localStorage.setItem("admissionNo", studentData.admissionNo || "");
      localStorage.setItem("className", studentData.className || "");
      
      navigate("/student-portal");
    } catch (error) {
      console.error("Login error:", error);
      
      switch (error.code) {
        case "auth/user-not-found":
          setError("No account found with this email.");
          break;
        case "auth/wrong-password":
          setError("Incorrect password. Click 'Forgot Password?' to reset.");
          setShowReset(true);
          break;
        case "auth/too-many-requests":
          setError("Too many failed attempts. Account temporarily disabled.");
          break;
        default:
          setError("Unable to login. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  const handleResetPassword = async () => {
    if (!email) {
      setError("Please enter your email first.");
      return;
    }
    
    try {
      await sendPasswordResetEmail(auth, email);
      setError("Password reset email sent! Check your inbox.");
    } catch (error) {
      setError("Failed to send reset email. Please try again.");
    }
  };

   return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-blue-800 mb-2">
          Student Login
        </h2>
        <p className="text-gray-600 text-center mb-6">Access your portal</p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-gray-700 mb-2">Student Email</label>
            <input
              type="email"
              placeholder="student@desthigh.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login to Student Portal"}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-center">{error}</p>
            {showReset && (
              <button
                onClick={handleResetPassword}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Forgot Password? Reset it here
              </button>
            )}
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/student-signup")}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Don't have an account? Sign up here
          </button>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Use your school-provided credentials</p>
          <p className="mt-1 text-xs">Admin-created accounts use default password: DEST@2024</p>
        </div>
      </div>
    </div>
  );
}

export default StudentLogin;