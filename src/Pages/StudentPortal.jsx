import { useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useEffect } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function StudentPortal() {
  const [admissionInput, setAdmissionInput] = useState("");
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  
  useEffect(() => {
  const unsub = onAuthStateChanged(auth, (currentUser) => {
    if (!currentUser) {
      setError("Please login to access the student portal.");
    } else {
      setUser(currentUser);
    }
    });

     return () => unsub();
    }, []);

  if (!user) {
  setError("You must be logged in to view your details.");
  return;
}


  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setStudentData(null);

    try {
     
      const q = query(collection(db, "students"), where("uid", "==", user.uid));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("No student found with that Name. Please check spelling.");
      } else {
        // Just take the first match
        const docData = querySnapshot.docs[0].data();
        setStudentData(docData);
      }
    } catch (err) {
      console.error(err);
      setError("Error fetching details. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10">
      <h1 className="text-3xl font-bold text-blue-900 mb-6">Student Portal</h1>
      
      {/* Search Box */}
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <form onSubmit={handleSearch} className="flex flex-col gap-4">
          <label className="font-semibold text-gray-700">Check Your Details</label>
          <input 
            type="text" 
            placeholder="Enter Student Name (e.g. John Doe)" 
            value={admissionInput}
            onChange={(e) => setAdmissionInput(e.target.value)}
            className="border p-2 rounded focus:outline-blue-500"
            required
          />
          <button 
            type="submit" 
            className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </form>
        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
      </div>

      {/* Results Section */}
      {studentData && (
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg mt-8 border-t-4 border-green-500">
          <h2 className="text-2xl font-bold mb-4 border-b pb-2">Student Profile</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="font-semibold text-gray-600">Name:</span>
              <span>{studentData.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-600">Grade/Class:</span>
              <span>{studentData.grade}</span>
            </div>
            
            <hr className="my-2" />
            
            <div className="flex justify-between">
              <span className="font-semibold text-gray-600">Total Fees:</span>
              <span>KES {studentData.expectedFee}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-600">Amount Paid:</span>
              <span className="text-green-600">KES {studentData.feePaid}</span>
            </div>
            <div className="flex justify-between text-lg font-bold bg-gray-100 p-2 rounded">
              <span className="text-gray-800">Fee Balance:</span>
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