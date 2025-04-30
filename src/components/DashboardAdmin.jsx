// src/pages/Dashboard.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaCouch, FaPlusSquare, FaSignOutAlt } from "react-icons/fa";

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // Clear token
    navigate("/login"); // Redirect to login
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-gray-100 to-gray-300 relative">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600 transition shadow-lg hover:scale-105"
        >
          <FaSignOutAlt />
          Logout
        </button>
      </div>

      {/* Centered Welcome Message */}
      <div className="flex justify-center items-center mb-10">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-700">Welcome, Admin! 👋</h2>
          <p className="text-gray-600 mt-2">Use the options below to manage your store.</p>
        </div>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Link to="/furniture-view">
          <div className="bg-white shadow-xl p-6 rounded-2xl hover:shadow-2xl transition hover:scale-105 transform duration-300 border-l-4 border-blue-500">
            <div className="flex items-center gap-4 mb-4">
              <FaCouch className="text-blue-600 text-3xl" />
              <h2 className="text-xl font-bold text-blue-700">Manage Products</h2>
            </div>
            <p className="text-gray-600">View, add, edit or delete furniture items.</p>
          </div>
        </Link>

        <Link to="/add-product">
          <div className="bg-white shadow-xl p-6 rounded-2xl hover:shadow-2xl transition hover:scale-105 transform duration-300 border-l-4 border-purple-500">
            <div className="flex items-center gap-4 mb-4">
              <FaPlusSquare className="text-purple-600 text-3xl" />
              <h2 className="text-xl font-bold text-purple-700">Add Product</h2>
            </div>
            <p className="text-gray-600">Add a new furniture item to the shop.</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
