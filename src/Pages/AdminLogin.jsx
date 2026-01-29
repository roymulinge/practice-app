import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";

export default function AdminLogin() {
  // Basic UI state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  /*
    Teaching notes (short):
    1) Sign in with Firebase Auth using email/password.
    2) Immediately read the corresponding `users/{uid}` document in Firestore.
    3) Only allow access when that document explicitly has `role: 'admin'`.
    4) Do NOT auto-create admin documents on sign-in (safer).
    5) Store role in localStorage only after verification so the UI can rely on it.
  */

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1) Sign in the user
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      const userEmail = userCredential.user.email;

      // 2) Read the user doc from Firestore to confirm role
      const userDocRef = doc(db, "users", uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // No user doc -> do not grant admin access automatically
        setError("Admin profile not found. Ask the site owner to create your admin record in Firestore.");
        await auth.signOut();
        return;
      }

      const data = userDoc.data();
      if (data.role !== "admin") {
        // Signed-in user is not an admin
        setError("You do not have admin permissions.");
        await auth.signOut();
        return;
      }

      // 3) Verified admin: persist minimal local state and navigate
      localStorage.setItem("role", "admin");
      localStorage.setItem("adminEmail", userEmail || "");
      navigate("/admin-dashboard");

    } catch (err) {
      // Friendly error messages
      if (err.code === "auth/user-not-found") {
        setError("No account found with that email.");
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password.");
      } else {
        setError(err.message || "Login failed.");
      }
    } finally {
      setLoading(false);
    }
  }

  // Rest of your component remains the same...
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded shadow">
        <h2 className="text-3xl font-bold text-center mb-6">Admin Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        {error && <p className="text-red-500 text-center mt-4">{error}</p>}

        <div className="mt-4 text-sm text-gray-600">
          <p>If you expect to be an admin but see "Admin profile not found", ask the site owner to add your UID to Firestore in `users` with `role: 'admin'`.</p>
        </div>
      </div>
    </div>
  );
}