// src/pages/Dashboard.jsx
import React from "react";
import { Link } from "react-router-dom";
import { 
  FaCouch, 
  FaPlusSquare, 
  FaSignOutAlt, 
  FaChartBar, 
  FaShippingFast,
  FaUserCircle
} from "react-icons/fa";

const Dashboard = () => {
  const handleLogout = () => {
    // Clear all auth data
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    
    // Show alert
    alert("Logged out successfully!");
    
    // Force a hard navigation to login page
    window.location.href = "/login";
  };

  const handleLogin = () => {
    // Force a hard navigation to ensure we reach the login page
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-gray-100 to-gray-300 relative">
      {/* Top Navigation Bar */}
      <div className="flex justify-between items-center mb-10 bg-white p-4 rounded-xl shadow-md">
        <div className="flex items-center">
          <FaCouch className="text-blue-600 text-3xl mr-3" />
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Admin Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600 transition shadow-md hover:scale-105"
          >
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      </div>

      {/* Centered Welcome Message */}
      <div className="bg-blue-600 text-white p-6 rounded-xl shadow-lg mb-10 transform transition-all hover:shadow-2xl">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Welcome, Admin! 👋</h2>
          <p className="mt-2 opacity-90">Use the options below to manage your store.</p>
        </div>
      </div>

      {/* Main Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to="/furniture-view">
          <div className="bg-white shadow-xl p-6 rounded-xl hover:shadow-2xl transition hover:scale-105 transform duration-300 border-l-4 border-blue-500 h-full">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <FaCouch className="text-blue-600 text-2xl" />
              </div>
              <h2 className="text-xl font-bold text-blue-700">Manage Products</h2>
            </div>
            <p className="text-gray-600">View, add, edit or delete furniture items.</p>
          </div>
        </Link>

        <Link to="/add-product">
          <div className="bg-white shadow-xl p-6 rounded-xl hover:shadow-2xl transition hover:scale-105 transform duration-300 border-l-4 border-purple-500 h-full">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <FaPlusSquare className="text-purple-600 text-2xl" />
              </div>
              <h2 className="text-xl font-bold text-purple-700">Add Product</h2>
            </div>
            <p className="text-gray-600">Add a new furniture item to the shop.</p>
          </div>
        </Link>

        {/* Order Status Option */}
        <Link to="/admin/orders">
          <div className="bg-white shadow-xl p-6 rounded-xl hover:shadow-2xl transition hover:scale-105 transform duration-300 border-l-4 border-green-500 h-full">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <FaShippingFast className="text-green-600 text-2xl" />
              </div>
              <h2 className="text-xl font-bold text-green-700">Manage Orders</h2>
            </div>
            <p className="text-gray-600">Manage order statuses from placed to delivered.</p>
            <div className="mt-3 flex gap-2">
              <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">Placed</span>
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Delivered</span>
            </div>
          </div>
        </Link>

        {/* Reports Option */}
        <Link to="/reports">
          <div className="bg-white shadow-xl p-6 rounded-xl hover:shadow-2xl transition hover:scale-105 transform duration-300 border-l-4 border-amber-500 h-full">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-amber-100 p-3 rounded-lg">
                <FaChartBar className="text-amber-600 text-2xl" />
              </div>
              <h2 className="text-xl font-bold text-amber-700">Reports</h2>
            </div>
            <p className="text-gray-600">View sales reports and analytics.</p>
            <div className="flex justify-between mt-3 text-sm">
              <span className="text-gray-500">Daily</span>
              <span className="text-gray-500">Weekly</span>
              <span className="text-gray-500">Monthly</span>
            </div>
          </div>
        </Link>
        
        <Link to="/admin/revenue-chart">
          <div className="bg-white shadow-xl p-6 rounded-xl hover:shadow-2xl transition hover:scale-105 border-l-4 border-indigo-500 h-full">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-indigo-100 p-3 rounded-lg">
                <FaChartBar className="text-indigo-600 text-2xl" />
              </div>
              <h2 className="text-xl font-bold text-indigo-700">Category Revenue</h2>
            </div>
            <p className="text-gray-600">Visualize revenue distribution across product categories.</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;