import { useState, useEffect } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

function AddStudent() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [admission, setAdmission] = useState("");
  const [className, setClassName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // 1. Create student in Authentication
      const cred = await createUserWithEmailAndPassword(
        auth,
        email,
        "student123" // Default password
      );

      const studentUid = cred.user.uid;

      // 2. Add student to Firestore
      // ⚠️ CRITICAL: We're already signed in as the new student!
      // This will work because your Firestore rules allow any authenticated user
      await addDoc(collection(db, "students"), {
        uid: studentUid,
        name,
        email,
        admission,
        className,
        createdAt: serverTimestamp(),
        addedAt: new Date().toISOString(), // Add timestamp
      });

      setMessage("✅ Student added successfully");
      setEmail("");
      setName("");
      setAdmission("");
      setClassName("");
      
    } catch (err) {
      console.error("Full error:", err);
      
      // Detailed error messages
      if (err.code === 'auth/email-already-in-use') {
        setMessage('❌ This email is already registered');
      } else if (err.code === 'auth/invalid-email') {
        setMessage('❌ Invalid email format (e.g., student@school.com)');
      } else if (err.code === 'auth/weak-password') {
        setMessage('❌ Password is too weak');
      } else if (err.code === 'permission-denied') {
        setMessage('❌ Firestore permission denied. Check console for details.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setMessage('❌ Email/password sign-in not enabled. Check Firebase Console → Authentication → Sign-in methods');
      } else {
        setMessage(`❌ Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  }

  // Test Firestore connection
  async function testConnection() {
    try {
      const testDoc = await addDoc(collection(db, "test"), {
        test: "Testing connection",
        timestamp: serverTimestamp()
      });
      console.log("Test successful! Document ID:", testDoc.id);
      setMessage("✅ Firestore connection is working!");
    } catch (err) {
      console.error("Firestore test error:", err);
      setMessage(`❌ Firestore error: ${err.message}`);
    }
  }

  return (
    <div className="bg-white p-6 rounded shadow max-w-md">
      <h2 className="text-xl font-bold mb-4">Add Student</h2>
      
      {/* Test button */}
      <button 
        onClick={testConnection}
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded"
      >
        Test Firestore Connection
      </button>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Student Name (e.g., John Doe)"
          className="w-full border p-2 rounded"
          required
          disabled={loading}
        />

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Student Email (e.g., student@school.com)"
          className="w-full border p-2 rounded"
          required
          disabled={loading}
        />

        <input
          value={admission}
          onChange={(e) => setAdmission(e.target.value)}
          placeholder="Admission Number (e.g., ADM001)"
          className="w-full border p-2 rounded"
          required
          disabled={loading}
        />

        <input
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          placeholder="Class (e.g., Class 10A)"
          className="w-full border p-2 rounded"
          required
          disabled={loading}
        />

        <button
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded w-full disabled:opacity-50"
          type="submit"
        >
          {loading ? "Adding Student..." : "Add Student"}
        </button>
      </form>

      {message && (
        <div className={`mt-4 p-3 rounded text-center ${
          message.includes('✅') 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {message}
        </div>
      )}
      
      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Note:</strong> The student will be created with password: <code>student123</code></p>
        <p className="mt-2"><strong>Example:</strong></p>
        <ul className="list-disc pl-5 mt-1">
          <li>Name: John Smith</li>
          <li>Email: john.smith@school.com</li>
          <li>Admission: ADM2024001</li>
          <li>Class: Grade 10 Science</li>
        </ul>
      </div>
    </div>
  );
}

export default AddStudent;