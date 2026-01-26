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
      const cred = await createUserWithEmailAndPassword(
        auth,
        email,
        "student123"
      );

      const studentUid = cred.user.uid;

      await addDoc(collection(db, "students"), {
        uid: studentUid,          // 🔑 REQUIRED
        name,
        email,
        admission,
        className,
        createdAt: serverTimestamp(),
      });

      setMessage("✅ Student added successfully");
      setEmail("");
      setName("");
      setAdmission("");
      setClassName("");
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to add student");
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
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Student Email"
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
