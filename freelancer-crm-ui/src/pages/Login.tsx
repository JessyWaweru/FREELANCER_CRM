import { useState } from "react";
import { login } from "../auth";
import { useNavigate, Link } from "react-router-dom";
import logo from "../assets/logo.png.png"; // 👈 place logo in src/assets/

export default function Login() {
  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const [err, setErr] = useState("");
  const nav = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await login(username, password);
      nav("/app");
    } catch (e) {
      setErr("Invalid credentials");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center px-4">
      
       {/* ✅ Responsive logo - top right, scales down on small screens */}
      <img
        src={logo}
        alt="Freelancer CRM Logo"
        className="absolute top-4 right-4 w-32 h-20 sm:w-40 sm:h-24 md:w-48 md:h-28 object-contain"
      />

        

      <form
        onSubmit={onSubmit}
        className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md flex flex-col items-center"
      >
        <h2 className="text-2xl font-semibold text-gray-900">Sign in</h2>

        {err && (
          <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 p-2 rounded w-full text-center">
            {err}
          </p>
        )}

        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setU(e.target.value)}
          className="mt-6 w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2"
        />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setP(e.target.value)}
          className="mt-4 w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2"
        />

        <button
          type="submit"
          className="mt-6 w-full rounded-lg bg-indigo-600 text-white py-2.5 font-medium hover:bg-indigo-700 transition"
        >
          Login
        </button>

        <p className="mt-6 text-sm text-gray-500 text-center">
          New user?{" "}
          <Link to="/signup" className="text-indigo-600 hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}
