import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function StudentPortal() {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate("/student-login");
      } else {
        setUser(currentUser);
      }
    });

    return unsubscribe;
  }, [navigate]);

  useEffect(() => {
    const loadStudentData = async () => {
      if (!user) return;

      try {
        // Read student document directly by uid 
        const studentDocRef = doc(db, "students", user.uid);
        const studentDoc = await getDoc(studentDocRef);

        if (!studentDoc.exists()) {
          setError("Student record not found in database.");
        } else {
          const student = studentDoc.data();
          setStudentData({
            ...student,
            id: studentDoc.id,
            balance: student.expectedFee - student.feePaid
          });
        }
      } catch (err) {
        console.error("Error loading student data:", err);
        setError("Failed to load student information.");
      } finally {
        setLoading(false);
      }
    };

    loadStudentData();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("role");
      localStorage.removeItem("studentEmail");
      navigate("/student-login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading student information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Unable to Load Data</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleLogout}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Student Portal</h1>
            <p className="text-gray-600">DEST HIGH INTERNATIONAL</p>
          </div>
          
          <button
            onClick={handleLogout}
            className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-6 py-2 rounded-lg font-semibold shadow-lg transition-all duration-300"
          >
            Logout
          </button>
        </div>

        {studentData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="flex items-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-6">
                    {studentData.name?.charAt(0) || "S"}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{studentData.name}</h2>
                    <p className="text-gray-600">{studentData.email || "student@desthigh.com"}</p>
                    <div className="mt-2 flex items-center">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        Class: {studentData.className || "Not specified"}
                      </span>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium ml-3">
                        Admission: {studentData.admissionNo || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Fees</h3>
                    <p className="text-3xl font-bold text-gray-800">KES {studentData.expectedFee?.toLocaleString() || "0"}</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Amount Paid</h3>
                    <p className="text-3xl font-bold text-green-600">KES {studentData.feePaid?.toLocaleString() || "0"}</p>
                  </div>
                  
                  <div className={`bg-gradient-to-br ${studentData.balance > 0 ? 'from-red-50 to-pink-50' : 'from-emerald-50 to-green-50'} border ${studentData.balance > 0 ? 'border-red-100' : 'border-green-100'} rounded-xl p-6`}>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Balance</h3>
                    <p className={`text-3xl font-bold ${studentData.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      KES {studentData.balance?.toLocaleString() || "0"}
                    </p>
                    <p className={`text-sm mt-2 ${studentData.balance > 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {studentData.balance > 0 ? 'Payment pending' : 'Fully paid'}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Activities</h3>
                  <div className="space-y-4">
                    <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-4"></div>
                      <div>
                        <p className="font-medium">Fee payment received</p>
                        <p className="text-sm text-gray-500">Last payment: {studentData.lastPayment || "Not available"}</p>
                      </div>
                    </div>
                    <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-4"></div>
                      <div>
                        <p className="font-medium">Current academic year</p>
                        <p className="text-sm text-gray-500">2023/2024 Session</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Payment Status</h3>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Payment Progress</span>
                    <span>{Math.round((studentData.feePaid / studentData.expectedFee) * 100) || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${Math.min((studentData.feePaid / studentData.expectedFee) * 100, 100) || 0}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Paid</span>
                    <span className="font-semibold text-green-600">KES {studentData.feePaid?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Remaining</span>
                    <span className="font-semibold text-red-600">KES {studentData.balance?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Links</h3>
                <div className="space-y-3">
                  <button className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                    📄 Download Fee Statement
                  </button>
                  <button className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                    📧 Contact Administrator
                  </button>
                  <button className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                    📚 Academic Resources
                  </button>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-xl p-6 text-white">
                <h3 className="text-xl font-bold mb-3">Need Help?</h3>
                <p className="mb-4">Contact the school administration for any queries regarding fees or academic matters.</p>
                <div className="space-y-2">
                  <p>📞 +254 706 019 928</p>
                  <p>✉️ info@desthigh.com</p>
                  <p>🏢 Administration Block, Room 12</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}