import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Allowed admin emails
  const ADMIN_EMAILS = ["mutuaroymulinge@gmail.com"]; // replace with your admin email

  async function handleLogin(e) {
    e.preventDefault();
    setError(""); // reset previous error
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // Check if user is admin
      if (!ADMIN_EMAILS.includes(userCredential.user.email)) {
        setError("Access denied. You are not an admin.");
        await auth.signOut();
        setLoading(false);
        return;
      }

      // Success → redirect
      navigate("/dashboard");
    } catch (err) {
      // Friendly error messages
      if (err.code === "auth/user-not-found") setError("User not found. Check your email.");
      else if (err.code === "auth/wrong-password") setError("Incorrect password. Try again.");
      else if (err.code === "auth/invalid-email") setError("Invalid email format.");
      else setError("Login failed. " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-3xl font-bold italic underline text-center mb-6">
          Admin Login
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-md"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-md"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-1/2 mx-auto block bg-green-600 text-white py-2 rounded hover:bg-green-700"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}
      </div>
    </div>
  );
}

export default Login;
