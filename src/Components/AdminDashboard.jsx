import { useState, useEffect } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebase";
import { signOut } from "firebase/auth";
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
  const [adminEmail, setAdminEmail] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedEmail = localStorage.getItem("adminEmail");
    if (storedEmail) {
      setAdminEmail(storedEmail);
    }
    loadStudents();
  }, []);

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
      await addDoc(collection(db, "students"), {
        name,
        email,
        admissionNo: admission,
        className,
        expectedFee: Number(expectedFee),
        feePaid: Number(feePaid) || 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      setMessage(`Student "${name}" added successfully!`);
      setName("");
      setEmail("");
      setAdmission("");
      setClassName("");
      setExpectedFee("");
      setFeePaid("");
      
      setTimeout(() => {
        setMessage("");
        setPage("students");
      }, 2000);
      
      loadStudents();
    } catch (error) {
      console.error("Error adding student:", error);
      setMessage("Failed to add student. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;

    try {
      await deleteDoc(doc(db, "students", id));
      setMessage(`Student "${name}" deleted successfully.`);
      loadStudents();
    } catch (error) {
      console.error("Error deleting student:", error);
      setMessage("Failed to delete student.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.clear();
      navigate("/admin-login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const totalExpected = students.reduce((sum, student) => sum + (student.expectedFee || 0), 0);
  const totalPaid = students.reduce((sum, student) => sum + (student.feePaid || 0), 0);
  const totalBalance = totalExpected - totalPaid;
  const totalStudents = students.length;
  const paidStudents = students.filter(s => (s.feePaid || 0) >= (s.expectedFee || 0)).length;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-gradient-to-b from-blue-900 to-indigo-900 text-white shadow-xl">
        <div className="p-6">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-white to-blue-200 rounded-full flex items-center justify-center mr-3">
              <span className="font-bold text-blue-900 text-xl">A</span>
            </div>
            <div>
              <h2 className="text-lg font-bold">Admin Panel</h2>
              <p className="text-sm text-blue-200 truncate">{adminEmail}</p>
            </div>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => setPage("dashboard")}
              className={`w-full text-left p-3 rounded-lg transition-all ${page === "dashboard" ? "bg-white/20" : "hover:bg-white/10"}`}
            >
              📊 Dashboard Overview
            </button>
            <button
              onClick={() => setPage("add")}
              className={`w-full text-left p-3 rounded-lg transition-all ${page === "add" ? "bg-white/20" : "hover:bg-white/10"}`}
            >
              ➕ Add New Student
            </button>
            <button
              onClick={() => setPage("students")}
              className={`w-full text-left p-3 rounded-lg transition-all ${page === "students" ? "bg-white/20" : "hover:bg-white/10"}`}
            >
              👥 Students List
            </button>
            <button
              onClick={() => setPage("reports")}
              className={`w-full text-left p-3 rounded-lg transition-all ${page === "reports" ? "bg-white/20" : "hover:bg-white/10"}`}
            >
              📈 Financial Reports
            </button>
          </nav>

          <button
            onClick={handleLogout}
            className="mt-8 w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 p-3 rounded-lg font-semibold shadow-lg transition-all duration-300"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-auto">
        {message && (
          <div className="max-w-4xl mx-auto mb-6 bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl">
            {message}
          </div>
        )}

        {page === "dashboard" && (
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>
            
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
                    className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-4 rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all"
                  >
                    Generate Report
                  </button>
                  <button 
                    className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-4 rounded-xl hover:from-orange-600 hover:to-red-700 transition-all"
                  >
                    Send Notifications
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
                      placeholder="DEST/2024/001"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2">Class/Grade *</label>
                    <input
                      type="text"
                      value={className}
                      onChange={e => setClassName(e.target.value)}
                      placeholder="Grade 11A"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 rounded-lg font-semibold text-lg shadow-lg transition-all duration-300 disabled:opacity-50"
                >
                  {loading ? "Adding Student..." : "Add Student to System"}
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
                            <button
                              onClick={() => handleDeleteStudent(student.id, student.name)}
                              className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-red-600 hover:to-pink-700"
                            >
                              Delete
                            </button>
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
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Generate Reports</h2>
                  <div className="space-y-4">
                    <button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all">
                      📄 Generate Fee Statement Report
                    </button>
                    <button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all">
                      💰 Outstanding Payments Report
                    </button>
                    <button className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white p-4 rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all">
                      📊 Student Performance Report
                    </button>
                    <button className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white p-4 rounded-xl hover:from-orange-600 hover:to-red-700 transition-all">
                      📧 Send Mass Notifications
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}