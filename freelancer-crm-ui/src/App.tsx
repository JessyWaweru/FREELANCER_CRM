import { Outlet, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import logo from "./assets/logo.png.png"; // 👈 place logo in src/assets/
export default function App() {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    // Assuming you stored user info in localStorage after login
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      setUsername(user.username || user.email); // fallback if username not available
    }
  }, []);

  return (
    <div>
      <nav className="flex items-center justify-between border-b border-gray-300 bg-gradient-to-br from-indigo-600 to-purple-700 px-4 py-3">
        {/* Left side links */}
        <div className="space-x-4">
          <Link to="/" className="text-white hover:animate-pulse transition-transform">
            Clients    |
          </Link>
          <Link to="/projects" className="text-white hover:animate-pulse transition-transform">
            Projects
          </Link>
        </div>

        {/* Right side - Greeting + Logout */}
        <div className="flex items-center space-x-4">
            {/* ✅ Logo */}
        <img
          src={logo}
          alt="Freelancer CRM Logo"
         className="absolute top-0 left-130 w-50 h-40" />
          <Link to="/login" >
            <LogOut className="w-6 h-6 text-white hover:scale-110 transition-transform" />
          </Link>
        </div>
      </nav>

      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
}
