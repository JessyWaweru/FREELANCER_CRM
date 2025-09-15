// src/pages/Signup.tsx
// src/pages/Signup.tsx
import { useState } from "react";
import api from "../api";
import { login } from "../auth";
import { useNavigate, Link } from "react-router-dom";

/* final-password validation: min 8 chars, at least one uppercase,
   one lowercase, and at least one digit OR symbol */
function validatePassword(pw: string) {
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\d\W]).{8,}$/;
  return re.test(pw);
}

/** simple strength score 0..4 for visual meter */
function passwordStrengthScore(pw: string) {
  let score = 0;
  if (!pw) return 0;
  if (pw.length >= 8) score += 1;
  if (pw.length >= 12) score += 1;
  if (/[a-z]/.test(pw)) score += 1;
  if (/[A-Z]/.test(pw)) score += 1;
  return Math.min(score, 4);
}

function strengthLabel(score: number) {
  switch (score) {
    case 0:
    case 1:
      return "Weak";
    case 2:
      return "Fair";
    case 3:
      return "Good";
    case 4:
      return "Strong";
    default:
      return "";
  }
}

export default function Signup() {
  const [username, setUsername] = useState("");
  // optional, serializer accepts it
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState(""); // server / generic errors
  const [pwHint, setPwHint] = useState(""); // client-side pw hint
  const [loading, setLoading] = useState(false);

  const nav = useNavigate();

  const strength = passwordStrengthScore(password);
  const strengthText = strengthLabel(strength);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setPwHint("");

    // require username (backend requires it)
    if (!username.trim()) {
      setError("Username is required.");
      return;
    }

    // client-side password validation before sending
    if (!validatePassword(password)) {
      setPwHint("Password must be at least 8 chars and include uppercase, lowercase, and a number or symbol.");
      return;
    }

    setLoading(true);
    try {
      // create user
      await api.post("/register/", { username: username.trim() || null, password });

      // attempt automatic login using your existing helper
      try {
        await login(username.trim(), password);
        // login succeeded, go to protected area
        nav("/");
        return;
      } catch (loginErr) {
        // auto-login failed (401 or other) — show message and redirect to login page
        console.error("Auto-login failed after signup:", loginErr);
        setError("Registered successfully but automatic login failed — please log in.");
        nav("/login");
        return;
      }
    } catch (signupErr: any) {
      console.error("Signup error:", signupErr);

      // Try to give the user a friendly message based on common DRF error shapes
      const resp = signupErr?.response?.data;

      if (!resp) {
        setError("Sign up failed. Please try again.");
      } else if (typeof resp === "string") {
        setError(resp);
      } else if (resp.username) {
        // e.g. ["Username already taken."] or {"username": ["..."]}
        setError(Array.isArray(resp.username) ? String(resp.username[0]) : String(resp.username));
      } else if (resp.password) {
        setError(Array.isArray(resp.password) ? String(resp.password[0]) : String(resp.password));
      } else if (resp.detail) {
        setError(String(resp.detail));
      } else {
        // fallback: stringify the response for debugging-friendly message
        try {
          setError(JSON.stringify(resp));
        } catch {
          setError("Sign up failed. Please try again.");
        }
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <form onSubmit={onSubmit} className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-semibold text-gray-900">Create Account</h2>

        {/* top-level server / generic errors */}
        {error && (
          <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 p-2 rounded">
            {error}
          </div>
        )}

        {/* Username */}
        <label className="block text-sm text-gray-700 mt-6">Username</label>
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mt-1 w-full rounded-lg border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500"
          required
          disabled={loading}
          autoComplete="username"
        />

        
        

        {/* Password + show toggle */}
        <label className="block text-sm text-gray-700 mt-4">Password</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Choose a strong password"
            value={password}
            onChange={(e) => {
              const v = e.target.value;
              setPassword(v);
              // live hint
              if (v.length > 0 && !validatePassword(v)) {
                setPwHint("Password must be at least 8 chars and include uppercase, lowercase, and a number or symbol.");
              } else {
                setPwHint("");
              }
            }}
            className="mt-1 w-full rounded-lg border-gray-300 px-3 py-2 pr-28 focus:ring-2 focus:ring-indigo-500"
            required
            disabled={loading}
            autoComplete="new-password"
            aria-describedby="pw-strength-text"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-2 top-2.5 rounded-md px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
            tabIndex={0}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {/* password hint */}
        {pwHint && <p className="mt-2 text-xs text-red-600">{pwHint}</p>}

        {/* strength meter */}
        <div className="mt-3" aria-hidden={false}>
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-600">Password strength</div>
            <div id="pw-strength-text" className="text-xs font-medium">{password ? strengthText : "—"}</div>
          </div>

          <div className="mt-2 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-2 transition-all duration-200 bg-indigo-600"
              style={{ width: `${(passwordStrengthScore(password) / 4) * 100}%` }}
            />
          </div>

          <div className="mt-2 flex gap-1">
            {[1, 2, 3, 4].map((i) => {
              const active = strength >= i;
              const bg = i <= 1 ? (active ? "bg-red-500" : "bg-red-200")
                : i === 2 ? (active ? "bg-amber-400" : "bg-amber-100")
                : i === 3 ? (active ? "bg-yellow-400" : "bg-yellow-100")
                : (active ? "bg-green-500" : "bg-green-100");
              return <div key={i} className={`h-1 flex-1 rounded ${bg}`} />;
            })}
          </div>

          <div className="mt-2 text-xs text-gray-500">
            Tip: Use at least 8 characters, mix uppercase and lowercase, and include a number or symbol.
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="mt-6 w-full rounded-lg bg-indigo-600 text-white py-2.5 font-medium hover:bg-indigo-700 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Creating account…" : "Sign Up"}
        </button>

        <p className="mt-6 text-sm text-gray-500 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-600 hover:underline">Log in</Link>
        </p>
      </form>
    </div>
  );
}
