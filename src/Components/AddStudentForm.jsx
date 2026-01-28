import { useState } from "react";
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
      console.log("Step 1: Creating student in Authentication...");
      
      // Create the student account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        "student123"
      );

      console.log("Student created with UID:", userCredential.user.uid);
      
      // At this point, we're signed in as the student
      // So we can write to Firestore if rules allow authenticated users
      console.log("Step 2: Adding to Firestore...");
      
      await addDoc(collection(db, "students"), {
        uid: userCredential.user.uid,
        name: name,
        email: email,
        admission: admission,
        className: className,
        createdAt: serverTimestamp(),
      });

      console.log("Step 3: Success!");
      setMessage("✅ Student added successfully!");
      
      // Clear form
      setEmail("");
      setName("");
      setAdmission("");
      setClassName("");

    } catch (error) {
      console.error("Full error details:", error);
      
      // Better error messages
      if (error.code === 'auth/email-already-in-use') {
        setMessage('❌ This email is already registered. Please use a different email.');
      } else if (error.code === 'auth/invalid-email') {
        setMessage('❌ Invalid email address format.');
      } else if (error.code === 'permission-denied') {
        setMessage('❌ Firestore permission denied. Please update your Firestore rules to allow writes.');
      } else if (error.message.includes('permissions')) {
        setMessage('❌ Permission error. Check Firestore rules in Firebase Console.');
      } else {
        setMessage(`❌ Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white p-6 rounded shadow max-w-md mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Add New Student</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., John Doe"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g., student@school.edu"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Admission Number</label>
          <input
            type="text"
            value={admission}
            onChange={(e) => setAdmission(e.target.value)}
            placeholder="e.g., ADM2024001"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Class</label>
          <input
            type="text"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            placeholder="e.g., Class 10A"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Adding Student..." : "Add Student"}
        </button>
      </form>

      {message && (
        <div className={`mt-6 p-4 rounded-lg text-center ${
          message.includes('✅') 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <p className="font-medium">{message}</p>
          {message.includes('permission') && (
            <p className="text-sm mt-2">
              Go to Firebase Console → Firestore → Rules → Update to allow writes
            </p>
          )}
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium mb-2">Test with this data:</h3>
        <div className="text-sm space-y-1">
          <p><span className="font-medium">Name:</span> Test Student</p>
          <p><span className="font-medium">Email:</span> teststudent{Date.now()}@test.com</p>
          <p><span className="font-medium">Admission:</span> TEST{Date.now().toString().slice(-4)}</p>
          <p><span className="font-medium">Class:</span> Test Class</p>
        </div>
      </div>
    </div>
  );
}

export default AddStudent;