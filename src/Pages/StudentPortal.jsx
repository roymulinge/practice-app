import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function StudentPortal() {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  // 🔐 AUTH LISTENER
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        navigate("/student-login");
      } else {
        setUser(u);
      }
    });

    return unsub;
  }, []);

  // 📦 LOAD STUDENT DATA (THIS IS WHERE YOUR CODE GOES)
  useEffect(() => {
    const loadStudent = async () => {
      if (!user) return;

      try {
        const q = query(
          collection(db, "students"),
          where("uid", "==", user.uid)
        );

        const snap = await getDocs(q);

        if (snap.empty) {
          setError("Student record not found.");
        } else {
          setStudentData(snap.docs[0].data());
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load student data.");
      } finally {
        setLoading(false);
      }
    };

    loadStudent();
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("role");
    navigate("/student-login");
  };

  if (loading) {
    return (
      <p className="min-h-screen flex items-center justify-center">
        Loading student data…
      </p>
    );
  }

  if (error) {
    return (
      <p className="min-h-screen flex items-center justify-center text-red-600">
        {error}
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10">
      <button
        onClick={handleLogout}
        className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
      >
        Logout
      </button>

      <h1 className="text-3xl font-bold text-blue-900 mb-6">
        Student Portal
      </h1>

      {studentData && (
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg border-t-4 border-green-500">
          <h2 className="text-2xl font-bold mb-4 border-b pb-2">
            Student Profile
          </h2>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="font-semibold text-gray-600">Name:</span>
              <span>{studentData.name}</span>
            </div>

            <div className="flex justify-between">
              <span className="font-semibold text-gray-600">Class:</span>
              <span>{studentData.className}</span>
            </div>

            <hr />

            <div className="flex justify-between">
              <span className="font-semibold text-gray-600">Total Fees:</span>
              <span>KES {studentData.expectedFee}</span>
            </div>

            <div className="flex justify-between">
              <span className="font-semibold text-gray-600">Paid:</span>
              <span className="text-green-600">
                KES {studentData.feePaid}
              </span>
            </div>

            <div className="flex justify-between text-lg font-bold bg-gray-100 p-2 rounded">
              <span>Balance:</span>
              <span className="text-red-600">
                KES {studentData.expectedFee - studentData.feePaid}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
