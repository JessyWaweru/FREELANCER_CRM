import { useState } from "react";
import api from "../api";
import { useNavigate ,Link} from "react-router-dom";

export default function Signup() {
  const [form, setForm] = useState({ username: "",  password: "" });
  const [error, setError] = useState("");
  const nav = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post("/register/", form);
      nav("/login");
    } catch {
      setError("Sign up failed. Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <form onSubmit={onSubmit} className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-semibold text-gray-900">Create Account</h2>
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <input
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          className="mt-6 w-full rounded-lg border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="mt-4 w-full rounded-lg border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500"
          required
        />
        <button
          type="submit"
          className="mt-6 w-full rounded-lg bg-indigo-600 text-white py-2.5 font-medium hover:bg-indigo-700"
        >
          Sign Up
        </button>
         {/* New user signup link */}
                <p className="mt-6 text-sm text-gray-500 text-center">
                  Not new here?{" "}
                  <Link to="/login" className="text-indigo-600 hover:underline">
                    Log in
                  </Link>
                </p>
      </form>
    </div>
  );
}
