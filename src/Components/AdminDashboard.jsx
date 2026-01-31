import { useState, useEffect } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, serverTimestamp, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [page, setPage] = useState("dashboard");
  const [students, setStudents] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [admission, setAdmission] = useState("");
  const [className, setClassName] = useState("");
  const [expectedFee, setExpectedFee] = useState("");
  const [feePaid, setFeePaid] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [adminInfo, setAdminInfo] = useState(null);
  const [isAdminVerified, setIsAdminVerified] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [deletingStudentId, setDeletingStudentId] = useState(null);
  const [deletingStudentName, setDeletingStudentName] = useState(null);
  const navigate = useNavigate();

  const classOptions = [
    "Form 1A", "Form 1B", "Form 1C", "Form 1D",
    "Form 2A", "Form 2B", "Form 2C", "Form 2D",
    "Form 3A", "Form 3B", "Form 3C", "Form 3D",
    "Form 4A", "Form 4B", "Form 4C", "Form 4D",
    "Grade 9A", "Grade 9B", "Grade 9C",
    "Grade 10A", "Grade 10B", "Grade 10C",
    "Grade 11A", "Grade 11B", "Grade 11C",
    "Grade 12A", "Grade 12B", "Grade 12C",
    "Other"
  ];

  // Check if user is admin on component mount
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        setLoading(true);
        const user = auth.currentUser;
        
        if (!user) {
          navigate("/admin-login");
          return;
        }

        // Check in admins collection
        const adminDocRef = doc(db, "admins", user.uid);
        const adminDoc = await getDoc(adminDocRef);

        if (adminDoc.exists()) {
          const adminData = adminDoc.data();
          setAdminInfo(adminData);
          setIsAdminVerified(true);
          return;
        }

        // Check in users collection
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists() && userDoc.data().role === "admin") {
          setAdminInfo(userDoc.data());
          setIsAdminVerified(true);
          return;
        }

        // Not an admin, redirect to login
        setMessage("Access denied. Administrator privileges required.");
        await auth.signOut();
        navigate("/admin-login");
        
      } catch (error) {
        console.error("Error checking admin status:", error);
        setMessage("Failed to verify admin status. Please login again.");
        navigate("/admin-login");
      } finally {
        setLoading(false);
      }
    };

    // Set up auth state listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        checkAdminStatus();
        loadStudents();
      } else {
        navigate("/admin-login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "students"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const studentList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        balance: doc.data().expectedFee - doc.data().feePaid
      }));
      setStudents(studentList);
    } catch (error) {
      console.error("Error loading students:", error);
      setMessage("Failed to load students.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!name || !email || !admission || !className || !expectedFee) {
      setMessage("Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);
      
      // 1. Create user in Firebase Authentication
      const defaultPassword = "DEST@2024";
      const credentials = await createUserWithEmailAndPassword(
        auth,
        email,
        defaultPassword
      );
      const uid = credentials.user.uid;

      // 2. Create user document in "users" collection for login
      await addDoc(collection(db, "users"), {
        uid: uid,
        firstName: name.split(' ')[0] || name,
        lastName: name.split(' ').slice(1).join(' ') || name,
        email: email,
        admissionNo: admission,
        className: className,
        role: "student",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true,
        createdBy: adminInfo?.email || "admin"
      });

      // 3. Create student document in "students" collection for fee management
      await addDoc(collection(db, "students"), {
        uid: uid,
        name,
        email,
        admissionNo: admission,
        className,
        expectedFee: Number(expectedFee),
        feePaid: Number(feePaid) || 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      setMessage(`Student "${name}" added successfully! Default password: ${defaultPassword}`);
      setName("");
      setEmail("");
      setAdmission("");
      setClassName("");
      setExpectedFee("");
      setFeePaid("");
      
      setTimeout(() => {
        setMessage("");
        setPage("students");
      }, 3000);
      
      loadStudents();
    } catch (error) {
      console.error("Error adding student:", error);
      
      if (error.code === "auth/email-already-in-use") {
        setMessage("This email is already registered. Student can use 'Forgot Password' to reset.");
      } else if (error.code === "auth/invalid-email") {
        setMessage("Invalid email address format.");
      } else if (error.code === "auth/weak-password") {
        setMessage("Password is too weak. Please use a stronger password.");
      } else {
        setMessage("Failed to add student. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleEditStudent = (student) => {
    setEditingStudent({
      ...student,
      expectedFee: student.expectedFee || 0,
      feePaid: student.feePaid || 0
    });
    setEditingStudentId(student.id);
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    if (!editingStudent) return;

    try {
      setLoading(true);
      await updateDoc(doc(db, "students", editingStudentId), {
        expectedFee: Number(editingStudent.expectedFee),
        feePaid: Number(editingStudent.feePaid),
        updatedAt: serverTimestamp()
      });

      setMessage(`Student "${editingStudent.name}" fees updated successfully!`);
      setEditingStudent(null);
      setEditingStudentId(null);
      setTimeout(() => setMessage(""), 3000);
      loadStudents();
    } catch (error) {
      console.error("Error updating student:", error);
      setMessage("Failed to update student fees.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingStudent(null);
    setEditingStudentId(null);
  };

  const handleDeleteStudent = async (studentId, studentName) => {
    // Open delete confirmation modal
    setDeletingStudentId(studentId);
    setDeletingStudentName(studentName);
  };

  const confirmDeleteStudent = async () => {
    if (!deletingStudentId) return;

    try {
      setLoading(true);
      await deleteDoc(doc(db, "students", deletingStudentId));
      setMessage(`Student "${deletingStudentName}" deleted successfully.`);
      setDeletingStudentId(null);
      setDeletingStudentName(null);
      setTimeout(() => setMessage(""), 3000);
      loadStudents();
    } catch (error) {
      console.error("Error deleting student:", error);
      setMessage("Failed to delete student. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const cancelDeleteStudent = () => {
    setDeletingStudentId(null);
    setDeletingStudentName(null);
  };

  const totalExpected = students.reduce((sum, student) => sum + (student.expectedFee || 0), 0);
  const totalPaid = students.reduce((sum, student) => sum + (student.feePaid || 0), 0);
  const totalBalance = totalExpected - totalPaid;
  const totalStudents = students.length;
  const paidStudents = students.filter(s => (s.feePaid || 0) >= (s.expectedFee || 0)).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex">
      <aside className="w-72 bg-white shadow-2xl border-r border-gray-200 sticky top-0 h-screen flex flex-col">
        <div className="p-8">
          {/* Logo/Branding */}
          <div className="flex items-center mb-10">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
              <span className="font-bold text-white text-2xl">🏢</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Admin Portal</h2>
              <p className="text-xs text-gray-500 font-semibold tracking-wide">MANAGEMENT</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2 flex-1">
            <button
              onClick={() => setPage("dashboard")}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 font-medium flex items-center gap-3 ${page === "dashboard" ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg" : "text-gray-700 hover:bg-gray-100"}`}
            >
              <span className="text-xl"></span> Dashboard
            </button>
            <button
              onClick={() => setPage("add")}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 font-medium flex items-center gap-3 ${page === "add" ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg" : "text-gray-700 hover:bg-gray-100"}`}
            >
              <span className="text-xl"></span> Add Student
            </button>
            <button
              onClick={() => setPage("students")}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 font-medium flex items-center gap-3 ${page === "students" ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg" : "text-gray-700 hover:bg-gray-100"}`}
            >
              <span className="text-xl"></span> Students List
            </button>
            <button
              onClick={() => setPage("reports")}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 font-medium flex items-center gap-3 ${page === "reports" ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg" : "text-gray-700 hover:bg-gray-100"}`}
            >
              <span className="text-xl"></span> Reports
            </button>
          </nav>

          {/* Admin Info Card */}
          <div className="border-t border-gray-200 pt-6 mt-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 mb-6">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">Logged in as</p>
              <p className="text-sm font-bold text-gray-900 truncate">{adminInfo?.email || "Administrator"}</p>
            </div>
            
            <button
              onClick={handleLogout}
              className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-4 py-3 rounded-lg font-semibold shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              <span></span> Logout
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-auto bg-gradient-to-b from-gray-900 to-gray-800">
        {message && (
          <div className={`max-w-4xl mx-auto mb-6 px-6 py-4 rounded-xl ${
            message.includes("successfully") 
              ? "bg-green-50 border border-green-200 text-green-700" 
              : message.includes("already registered")
              ? "bg-yellow-50 border border-yellow-200 text-yellow-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}>
            {message}
          </div>
        )}

        {page === "dashboard" && (
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold text-white mb-8">Dashboard Overview</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-blue-500">
                <h3 className="text-gray-600 mb-2">Total Students</h3>
                <p className="text-3xl font-bold text-blue-600">{totalStudents}</p>
              </div>
              
              <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-green-500">
                <h3 className="text-gray-600 mb-2">Total Expected Fees</h3>
                <p className="text-3xl font-bold text-green-600">KES {totalExpected.toLocaleString()}</p>
              </div>
              
              <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-emerald-500">
                <h3 className="text-gray-600 mb-2">Total Received</h3>
                <p className="text-3xl font-bold text-emerald-600">KES {totalPaid.toLocaleString()}</p>
              </div>
              
              <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-red-500">
                <h3 className="text-gray-600 mb-2">Total Balance</h3>
                <p className="text-3xl font-bold text-red-600">KES {totalBalance.toLocaleString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Payment Status</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Fully Paid</span>
                    <span className="font-bold text-green-600">{paidStudents} students</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Pending Payments</span>
                    <span className="font-bold text-red-600">{totalStudents - paidStudents} students</span>
                  </div>
                  <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-600"
                      style={{ width: `${(paidStudents / totalStudents) * 100 || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setPage("add")}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all"
                  >
                    Add Student
                  </button>
                  <button 
                    onClick={() => setPage("students")}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all"
                  >
                    View All Students
                  </button>
                 <button 
                    onClick={() => setPage("reports")}
                    className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-4 rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all"
                  >
                    Generate Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {page === "add" && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-6">Add New Student</h1>
              <form onSubmit={handleAddStudent} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2">Email Address *</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="student@desthigh.com"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 mb-2">Admission Number *</label>
                    <input
                      type="text"
                      value={admission}
                      onChange={e => setAdmission(e.target.value)}
                      placeholder="DHS2024001"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2">Class/Form *</label>
                      <select
                          value={className}
                          onChange={e => setClassName(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                      >
                          <option value="">Select Class/Form</option>
                          {classOptions.map((classOption) => (
                              <option key={classOption} value={classOption}>
                                  {classOption}
                              </option>
                          ))}
                      </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 mb-2">Expected Fee (KES) *</label>
                    <input
                      type="number"
                      value={expectedFee}
                      onChange={e => setExpectedFee(e.target.value)}
                      placeholder="50000"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2">Fee Paid (KES)</label>
                    <input
                      type="number"
                      value={feePaid}
                      onChange={e => setFeePaid(e.target.value)}
                      placeholder="25000"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Note:</strong> A default password <code className="bg-white px-2 py-1 rounded border">DEST@2024</code> will be set for this student.
                    They can reset it after first login.
                  </p>
                </div>
               
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 rounded-lg font-semibold text-lg shadow-lg transition-all duration-300 disabled:opacity-50"
                >
                 {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Account...
                    </span>
                  ) : "Add Student to System"}
                </button>
              </form>
            </div>
          </div>
        )}

        {page === "students" && (
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800">Students Management</h1>
              <button
                onClick={() => setPage("add")}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-lg font-semibold"
              >
                + Add Student
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading students...</p>
              </div>
            ) : students.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-2xl font-bold text-gray-700 mb-2">No Students Found</h3>
                <p className="text-gray-600 mb-6">Add your first student to get started</p>
                <button
                  onClick={() => setPage("add")}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold"
                >
                  Add First Student
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                      <tr>
                        <th className="text-left p-4 font-semibold text-gray-700">Student Name</th>
                        <th className="text-left p-4 font-semibold text-gray-700">Admission</th>
                        <th className="text-left p-4 font-semibold text-gray-700">Class</th>
                        <th className="text-left p-4 font-semibold text-gray-700">Expected</th>
                        <th className="text-left p-4 font-semibold text-gray-700">Paid</th>
                        <th className="text-left p-4 font-semibold text-gray-700">Balance</th>
                        <th className="text-left p-4 font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => (
                        <tr key={student.id} className="border-b hover:bg-gray-50">
                          <td className="p-4">
                            <div className="font-medium text-gray-800">{student.name}</div>
                            <div className="text-sm text-gray-500">{student.email}</div>
                          </td>
                          <td className="p-4">{student.admissionNo}</td>
                          <td className="p-4">{student.className}</td>
                          <td className="p-4 font-semibold">KES {student.expectedFee?.toLocaleString()}</td>
                          <td className="p-4 font-semibold text-green-600">KES {student.feePaid?.toLocaleString()}</td>
                          <td className="p-4">
                            <span className={`font-semibold ${student.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              KES {student.balance?.toLocaleString()}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditStudent(student)}
                                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-700"
                              >
                                Edit Fees
                              </button>
                              <button
                                onClick={() => handleDeleteStudent(student.id, student.name)}
                                className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-red-600 hover:to-pink-700"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{totalStudents}</div>
                      <div className="text-gray-600">Total Students</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">KES {totalPaid.toLocaleString()}</div>
                      <div className="text-gray-600">Total Received</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">KES {totalBalance.toLocaleString()}</div>
                      <div className="text-gray-600">Outstanding Balance</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {page === "reports" && (
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Financial Reports</h1>
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Fee Collection Summary</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                      <span>Total Expected Revenue</span>
                      <span className="font-bold text-blue-600">KES {totalExpected.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                      <span>Actual Revenue Collected</span>
                      <span className="font-bold text-green-600">KES {totalPaid.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
                      <span>Outstanding Amount</span>
                      <span className="font-bold text-red-600">KES {totalBalance.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                      <span>Collection Rate</span>
                      <span className="font-bold text-purple-600">{((totalPaid / totalExpected) * 100 || 0).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
                 <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Class Distribution</h2>
                  <div className="space-y-4">
                    {classOptions.map(cls => {
                      const classStudents = students.filter(s => s.className === cls);
                      if (classStudents.length === 0) return null;
                      return (
                        <div key={cls} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium">{cls}</span>
                          <span className="font-bold text-blue-600">{classStudents.length} students</span>
                        </div>
                      );
                    }).filter(Boolean)}
                  </div>
                </div>
                
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deletingStudentId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Delete Student?</h2>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete <strong>{deletingStudentName}</strong>? This action cannot be undone.
              </p>
              
              <div className="flex gap-4">
                <button
                  onClick={cancelDeleteStudent}
                  disabled={loading}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteStudent}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-red-600 hover:to-pink-700 disabled:opacity-50"
                >
                  {loading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Student Modal */}
        {editingStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Student Fees</h2>
              <form onSubmit={handleUpdateStudent} className="space-y-6">
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Student Name</label>
                  <input
                    type="text"
                    value={editingStudent.name}
                    disabled
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Expected Fee (KES) *</label>
                  <input
                    type="number"
                    value={editingStudent.expectedFee}
                    onChange={(e) => setEditingStudent({ ...editingStudent, expectedFee: e.target.value })}
                    placeholder="0"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Fee Paid (KES) *</label>
                  <input
                    type="number"
                    value={editingStudent.feePaid}
                    onChange={(e) => setEditingStudent({ ...editingStudent, feePaid: e.target.value })}
                    placeholder="0"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Balance:</strong> KES {(Number(editingStudent.expectedFee) - Number(editingStudent.feePaid)).toLocaleString()}
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 disabled:opacity-50"
                  >
                    {loading ? "Updating..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={loading}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}