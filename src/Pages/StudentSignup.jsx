import {useState} from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
function StudentSignup() {
    const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    studentId: "",
    gradeLevel: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName) {
      setError("Please enter your full name");
      return false;
    }
    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (!formData.studentId) {
      setError("Student ID is required");
      return false;
    }
    if (!formData.gradeLevel) {
      setError("Please select your grade level");
      return false;
    }
    return true;
  };

   async function handleSignup(e) {
    e.preventDefault();
    setError("");
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // 1. Create user in Firebase Authentication
      const credentials = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const uid = credentials.user.uid;

      // 2. Create user document in Firestore
      const userData = {
        uid: uid,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        studentId: formData.studentId,
        gradeLevel: formData.gradeLevel,
        role: "student",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true,
        emailVerified: false,
      };

      await setDoc(doc(db, "users", uid), userData);

      // Optional: Send email verification
      // await sendEmailVerification(credentials.user);

      setSuccess(true);
      
      // Auto login after successful signup
      localStorage.setItem("role", "student");
      localStorage.setItem("studentEmail", formData.email);
      
      // Show success message for 2 seconds then redirect
      setTimeout(() => {
        navigate("/student-portal");
      }, 2000);

    } catch (error) {
      console.error("Signup error:", error);
      
      switch (error.code) {
        case "auth/email-already-in-use":
          setError("This email is already registered. Please login instead.");
          break;
        case "auth/invalid-email":
          setError("Invalid email address format.");
          break;
        case "auth/weak-password":
          setError("Password is too weak. Use at least 6 characters.");
          break;
        case "auth/network-request-failed":
          setError("Network error. Please check your connection.");
          break;
        default:
          setError("Unable to create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }
 return(
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
        <div>
            <div  className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Create Student Account
                </h2>
                <p className="text-gray-600">
                    Join DEST HIGH International School
                </p>
             </div>
             

              {success ? (
                <div className="text-center py-12">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              Account Created Successfully!
            </h3>
            <p className="text-gray-600 mb-6">
              Welcome to DEST HIGH, {formData.firstName}! Redirecting to your portal...
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) :(
            <form onSubmit={handleSignup} className="space-y-6">
                {/* Name Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                         <label className="block text-sm font-medium text-gray-700 mb-2">
                             First Name *
                        </label>
                        <input
                        type="text"
                        name="firstName"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                         Last Name *
                       </label>
                        <input
                 type="text"
                  name="lastName"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                    </div>
                </div>
                 
                 {/* Student Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student ID *
                </label>
                <input
                  type="text"
                  name="studentId"
                  placeholder="DHS20240001"
                  value={formData.studentId}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Enter your school-provided ID</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grade Level *
                </label>
                <select
                  name="gradeLevel"
                  value={formData.gradeLevel}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Grade Level</option>
                  {gradeLevels.map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                School Email *
              </label>
              <input
                type="email"
                name="email"
                placeholder="john.doe@desthigh.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Use your school-provided email address
              </p>
            </div>
            
            {/* Password Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <div className="mt-2 space-y-1">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${formData.password.length >= 6 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="text-xs text-gray-600">At least 6 characters</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <div className="mt-2">
                  {formData.confirmPassword && (
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${formData.password === formData.confirmPassword ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className={`text-xs ${formData.password === formData.confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
                        {formData.password === formData.confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

             {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </span>
              ) : (
                "Create Student Account"
              )}
            </button>
            </form>
        )}

         {/* Error Message */}
        {error && !success && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        )}

        
        {/* Login Link */}
        {!success && (
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/student-login")}
                className="text-blue-600 font-semibold hover:text-blue-800 hover:underline"
              >
                Log in here
              </button>
            </p>
          </div>
        )}
        </div>

    </div>
 );
  
}


export default StudentSignup;