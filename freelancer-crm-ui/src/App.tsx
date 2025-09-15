import { Outlet, Link } from "react-router-dom";
import { useEffect, useState } from "react";

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
      <nav className="flex items-center justify-between border-b border-gray-300 px-4 py-3">
        {/* Left side links */}
        <div className="space-x-4">
          <Link to="/" className="text-blue-600 hover:underline">
            Clients    ||
          </Link>
          <Link to="/projects" className="text-blue-600 hover:underline">
            Projects
          </Link>
        </div>

        {/* Right side - Greeting + Logout */}
        <div className="flex items-center space-x-4">
          {username && (
            <span className="text-red-700 font-medium">
              Hello, {username} 👋
            </span>
          )}
          <Link to="/login" className="text-red-600 hover:underline">
            Logout
          </Link>
        </div>
      </nav>

      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
}
