import { useState } from "react";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
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
      
      // Use full-page redirect to sync with App's auth state
      window.location.assign("/student-portal");
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Student Portal
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Access your academic and financial information
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-10">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Student Email Address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="student@desthigh.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging in...
                  </span>
                ) : (
                  "Sign in to Student Portal"
                )}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    {error}
                  </p>
                </div>
              </div>
              {showReset && (
                <button
                  onClick={handleResetPassword}
                  className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Click here to reset your password
                </button>
              )}
            </div>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Need help?</span>
              </div>
            </div>

            <div className="mt-6 text-center text-sm text-gray-600">
              <p className="mb-4">
                Don't have an account?{" "}
                <button
                  onClick={() => navigate("/student-signup")}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Sign up here
                </button>
              </p>
              <p className="text-xs">Use your school-provided credentials</p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <a href="/" className="text-sm text-blue-600 hover:text-blue-500">
            ← Return to home page
          </a>
        </div>
      </div>
    </div>
  );
}

export default StudentLogin;