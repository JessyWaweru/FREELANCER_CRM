import { Outlet, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import logo from "./assets/logo.png.png"; // 👈 place logo in src/assets/
export default function App() {
  const [username, setUsername] = useState<string | null>(null);
const navigate = useNavigate();

  useEffect(() => {
    // Assuming you stored user info in localStorage after login
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      setUsername(user.username || user.email); // fallback if username not available
    }
  }, []);

   const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div>
     <nav className="flex items-center justify-between border-b border-gray-300 bg-gradient-to-br from-indigo-600 to-purple-700 px-6 py-3 relative">
  {/* Left side - links */}
  <div className="flex items-center space-x-6">
    <Link to="/app" className="text-white hover:animate-pulse transition-transform">
      Clients
    </Link>
    <span className="text-white">|</span>
    <Link to="/app/projects" className="text-white hover:animate-pulse transition-transform">
      Projects
    </Link>
  </div>

  {/* Center - logo */}
  <div className="absolute left-1/2 transform -translate-x-1/2">
    <img
      src={logo}
      alt="Freelancer CRM Logo"
      className="w-25 h-25 object-contain"
    />
  </div>

  {/* Right side - logout button */}
  <button
    onClick={handleLogout}
    className="text-white hover:scale-110 transition-transform"
  >
    <LogOut className="w-6 h-6" />
  </button>
</nav>

      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
}
