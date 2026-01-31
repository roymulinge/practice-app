// src/components/AdminSetupPage.jsx
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function AdminSetupPage() {
  const [email, setEmail] = useState("admin@desthigh.com");
  const [password, setPassword] = useState("DEST@2024");
  const [name, setName] = useState("System Administrator");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      
      // 2. Create admin document in Firestore
      await setDoc(doc(db, "admins", uid), {
        uid: uid,
        email: email,
        role: "super_admin",
        name: name,
        createdAt: serverTimestamp(),
        isActive: true,
        permissions: ["all", "users", "students", "fees", "reports"],
        lastLogin: serverTimestamp()
      });

      // 3. Also create in users collection for consistency
      await setDoc(doc(db, "users", uid), {
        uid: uid,
        email: email,
        role: "admin",
        firstName: name.split(' ')[0] || name,
        lastName: name.split(' ').slice(1).join(' ') || "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true
      });

      setMessage(`
        ✅ Admin account created successfully!
        
        Login Details:
        • Email: ${email}
        • Password: ${password}
        
        Please save these credentials securely!
      `);

    } catch (error) {
      console.error("Setup error:", error);
      
      if (error.code === "auth/email-already-in-use") {
        setMessage("❌ This email is already registered. Try a different email.");
      } else if (error.code === "auth/invalid-email") {
        setMessage("❌ Invalid email format. Use format: name@domain.com");
      } else if (error.code === "auth/weak-password") {
        setMessage("❌ Password too weak. Use at least 6 characters.");
      } else if (error.code === "permission-denied") {
        setMessage("❌ Firestore permission denied. Please update security rules.");
      } else {
        setMessage(`❌ Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">🔧 Setup First Admin Account</h1>
        <p className="text-gray-600 mb-6">Create your first system administrator</p>
        
        <form onSubmit={handleCreateAdmin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Admin Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="System Administrator"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="admin@desthigh.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Minimum 6 characters"
            />
            <p className="text-xs text-gray-500 mt-1">Use a strong, secure password</p>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Admin Account..." : "Create Super Admin"}
          </button>
        </form>
        
        {message && (
          <div className={`mt-6 p-4 rounded-lg whitespace-pre-line ${message.includes("✅") ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
            {message}
          </div>
        )}
        
        <div className="mt-6 text-sm text-gray-500">
          <p className="font-medium">⚠️ Important Notes:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>This page should be removed after creating the first admin</li>
            <li>Store credentials in a secure password manager</li>
            <li>Use this account to create other admin accounts</li>
          </ul>
        </div>
        
        <button
          onClick={() => navigate("/admin-login")}
          className="mt-6 w-full py-2 text-blue-600 hover:text-blue-800 font-medium"
        >
          Already have an admin account? Login here →
        </button>
      </div>
    </div>
  );
}