import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

function AddStudent(onStudentAdded) {

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [admission, setAdmission] = useState("");
  const [className, setClassName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    const userCredential = await createUserWithEmailAndPassword(
     auth,
     email,
     "student123" // force change later
);

    const uid = userCredential.user.uid;


    try {
      await addDoc(collection(db, "students"), {
        uid,
        email,
        name,
        admission,
        className,
        createdAt: serverTimestamp(),
      });

      onStudentAdded();

      // ✅ SUCCESS FEEDBACK
      setMessage("✅ Student added successfully");

      // ✅ CLEAR INPUTS
      setName("");
      setAdmission("");
      setClassName("");
    } catch (error) {
      setMessage("❌ Failed to add student");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white p-6 rounded shadow max-w-md">
      <h2 className="text-xl font-bold mb-4">Add Student</h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Student Name"
          className="w-full border p-2 rounded"
          required
        />

        <input
          value={admission}
          onChange={(e) => setAdmission(e.target.value)}
          placeholder="Admission Number"
          className="w-full border p-2 rounded"
          required
        />

        <input
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          placeholder="Class"
          className="w-full border p-2 rounded"
          required
        />

        <button
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          {loading ? "Adding..." : "Add Student"}
        </button>
      </form>

      {/*✅ ADMIN NOTIFICATION */}
      {message && (
        <p className="mt-4 text-center font-semibold">{message}</p>
      )}
    </div>
  );
}

export default AddStudent;
