import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png.png"; 

const LandingPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
         <img
          src={logo}
          alt="Freelancer CRM Logo"
         className="absolute top-0 right-4 w-50 h-40" />


      <h1 className="text-4xl font-bold mb-6">Welcome to Freelancer CRM</h1>
      <p className="text-lg mb-10 text-gray-100">
        Manage your clients, projects, and workflow all in one place.
      </p>

      <div className="flex gap-6">
        <Link
          to="/login"
          className="bg-white text-indigo-700 px-6 py-2 rounded-xl font-semibold shadow-md hover:bg-gray-200 transition"
        >
          Log In
        </Link>

        <Link
          to="/signup"
          className="bg-transparent border border-white px-6 py-2 rounded-xl font-semibold hover:bg-white hover:text-indigo-700 transition"
        >
          Sign Up
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;
