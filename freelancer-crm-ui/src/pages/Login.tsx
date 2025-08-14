// src/pages/Login.tsx
import { useState } from "react";
import { login } from "../auth";
import { useNavigate ,Link} from "react-router-dom";

export default function Login() {
  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const [err, setErr] = useState("");
  //username → Stores the value typed in the username input.
  // password → Stores the password input value.
  // err → Stores an error message if login fails.
  const nav = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // e.preventDefault() → Prevents the browser from doing a full page reload on
    //  form submission.
    try {
      await login(username, password);
      nav("/");
    } catch (e) {
      setErr("Invalid credentials");
    }
  }
  //login() → Sends credentials to Django’s JWT endpoint, stores tokens in localStorage.
  // On success → Navigate to home page.
  // On error → Set err state to "Invalid credentials" so it shows in the UI.

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      {/* Centered login container */}
      <form
        onSubmit={onSubmit}
        className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md"
      >
        {/* <form onSubmit={onSubmit}> → Calls onSubmit when you press Enter or
         click the button.*/}
        <h2 className="text-2xl font-semibold text-gray-900">Sign in</h2>
        {err && (
          <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 p-2 rounded">
            {err}
          </p>
        )}
        {/*Conditionally renders an error <p> if err is not empty. */}

        {/* Username input */}
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setU(e.target.value)}
          className="mt-6 w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2"
        />

        {/* Password input */}
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setP(e.target.value)}
          className="mt-4 w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2"
        />

        {/* Submit button */}
        <button
          type="submit"
          className="mt-6 w-full rounded-lg bg-indigo-600 text-white py-2.5 font-medium hover:bg-indigo-700 transition"
        >
          Login
        </button>
        
        {/* New user signup link */}
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
