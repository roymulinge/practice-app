import { useState, useEffect } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { db, auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [page, setPage] = useState("add");
  const [students, setStudents] = useState([]);
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [expectedFee, setExpectedFee] = useState("");
  const [feePaid, setFeePaid] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // ✅ Ensure user is admin
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(user => {
      if (!user || user.email !== "admin@gmail.com") {
        signOut(auth);
        navigate("/admin-login");
        return;
      }
      loadStudents();
    });
    return unsub;
  }, []);

  const loadStudents = async () => {
    try {
      const q = query(collection(db, "students"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("Error loading students:", err);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!name || !grade || !expectedFee || !feePaid) {
      setMessage("All fields are required");
      return;
    }
    try {
      await addDoc(collection(db, "students"), {
        uid: "TEMP", // admin-added students
        name,
        grade,
        expectedFee: Number(expectedFee),
        feePaid: Number(feePaid),
        createdAt: new Date(),
      });
      setName(""); setGrade(""); setExpectedFee(""); setFeePaid("");
      setMessage(`Student "${name}" added successfully`);
      loadStudents();
      setPage("list");
    } catch (err) {
      console.error(err);
      setMessage("Failed to add student");
    }
    setTimeout(() => setMessage(""), 3000);
  };

  const handleDeleteStudent = async (id) => {
    try {
      await deleteDoc(doc(db, "students", id));
      loadStudents();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("role");
    navigate("/admin-login");
  };

  const totalExpected = students.reduce((acc, s) => acc + s.expectedFee, 0);
  const totalPaid = students.reduce((acc, s) => acc + s.feePaid, 0);
  const totalBalance = totalExpected - totalPaid;

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-blue-700 text-white p-6 flex flex-col shadow-lg">
        <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
        <nav className="flex-1">
          <button className={`mb-2 w-full text-left p-2 rounded ${page==="add"?"bg-blue-900":""}`} onClick={() => setPage("add")}>Add Student</button>
          <button className={`mb-2 w-full text-left p-2 rounded ${page==="list"?"bg-blue-900":""}`} onClick={() => setPage("list")}>Students List</button>
        </nav>
        <button className="mt-auto bg-red-600 hover:bg-red-700 p-2 rounded" onClick={handleLogout}>Logout</button>
      </aside>

      <main className="flex-1 bg-gray-100 p-8">
        {message && <div className="max-w-md mx-auto mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded">{message}</div>}

        {page === "add" && (
          <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
            <h2 className="text-2xl font-bold mb-4">Add Student</h2>
            <form onSubmit={handleAddStudent} className="space-y-2">
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="border p-2 w-full rounded"/>
              <input value={grade} onChange={e => setGrade(e.target.value)} placeholder="Grade" className="border p-2 w-full rounded"/>
              <input value={expectedFee} onChange={e => setExpectedFee(e.target.value)} placeholder="Expected Fee" type="number" className="border p-2 w-full rounded"/>
              <input value={feePaid} onChange={e => setFeePaid(e.target.value)} placeholder="Fee Paid" type="number" className="border p-2 w-full rounded"/>
              <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded mt-2 w-full">Add Student</button>
            </form>
          </div>
        )}

        {page === "list" && (
          <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
            <h2 className="text-2xl font-bold mb-4">Students List</h2>
            {students.length === 0 ? <p>No students yet</p> :
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border px-2 py-1">Name</th>
                    <th className="border px-2 py-1">Grade</th>
                    <th className="border px-2 py-1">Expected</th>
                    <th className="border px-2 py-1">Paid</th>
                    <th className="border px-2 py-1">Balance</th>
                    <th className="border px-2 py-1">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(s => (
                    <tr key={s.id} className="hover:bg-gray-100">
                      <td className="border px-2 py-1">{s.name}</td>
                      <td className="border px-2 py-1">{s.grade}</td>
                      <td className="border px-2 py-1">{s.expectedFee}</td>
                      <td className="border px-2 py-1">{s.feePaid}</td>
                      <td className="border px-2 py-1">{s.expectedFee - s.feePaid}</td>
                      <td className="border px-2 py-1">
                        <button onClick={() => handleDeleteStudent(s.id)} className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            }
            <div className="mt-4">
              <p>Total Expected: <strong>{totalExpected}</strong></p>
              <p>Total Paid: <strong>{totalPaid}</strong></p>
              <p>Total Balance: <strong>{totalBalance}</strong></p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
