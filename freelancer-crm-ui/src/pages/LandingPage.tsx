import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png.png";

const LandingPage: React.FC = () => {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 text-white px-4">
      
      {/* ✅ Responsive logo - top right, scales down on small screens */}
      <img
        src={logo}
        alt="Freelancer CRM Logo"
        className="absolute top-4 right-4 w-32 h-20 sm:w-40 sm:h-24 md:w-48 md:h-28 object-contain"
      />

      {/* ✅ Responsive heading */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-center">
        Welcome to Freelancer CRM
      </h1>

      {/* ✅ Responsive paragraph */}
      <p className="text-base sm:text-lg md:text-xl mb-8 text-center text-gray-100 max-w-md">
        Manage your clients, projects, and workflow all in one place.
      </p>

      {/* ✅ Buttons adjust spacing on mobile */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full sm:w-auto justify-center items-center">
        <Link
          to="/login"
          className="bg-white text-indigo-700 px-6 py-2 rounded-xl font-semibold shadow-md hover:bg-gray-200 transition w-40 text-center"
        >
          Log In
        </Link>

        <Link
          to="/signup"
          className="bg-transparent border border-white px-6 py-2 rounded-xl font-semibold hover:bg-white hover:text-indigo-700 transition w-40 text-center"
        >
          Sign Up
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;
