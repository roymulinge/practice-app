import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

function StudentLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

 async function handleLogin(e) {
  e.preventDefault();
  setError("");

  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const uid = cred.user.uid;

    const snap = await getDoc(doc(db, "users", uid));

    if (!snap.exists() || snap.data().role !== "student") {
      await auth.signOut();
      setError("Not a student account");
      return;
    }

    localStorage.setItem("role", "student");
    navigate("/student-portal");
  } catch {
    setError("Invalid credentials");
  }
}


  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <form
            onSubmit={handleLogin}
            className="bg-white p-6 rounded shadow-md w-full max-w-sm space-y-4"
        >
            <h2 className="text-2xl font-bold text-center text-blue-800">
            Student Login
            </h2>

            <input
            type="email"
            placeholder="Student Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full border p-2 rounded"
            required
            />

            <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full border p-2 rounded"
            required
            />

            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold">
            Login
            </button>

            {error && <p className="text-red-500 text-center">{error}</p>}
        </form>
    </div>

  );
}

export default StudentLogin;
