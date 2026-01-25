import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";


function Register({ switchMode }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);


async function handleRegister(e) {
    e.preventDefault();
    setError("");
    setLoading(true);


try {
    await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
}

    return(
        <div>
            <h2 className="text-3xl font-bold italic underline text-center mb-6">Register</h2>

            <form onSubmit={handleRegister} className="space-y-4">
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
                    {loading ? "Creating..." : "Register"}
                </button>
            </form>


            {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}


            <button
                onClick={switchMode}
                className="mt-6 text-sm text-green-600 underline block w-full text-center"
            >
            Switch to Login
            </button>
        </div>
    )
}

export default Register