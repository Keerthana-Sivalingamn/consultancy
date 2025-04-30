import React from "react";
import FurnitureGallery from "./FurnitureGallery";
import { useNavigate } from "react-router-dom";
import {
  FaSignInAlt,
  FaUserPlus,
  FaPhoneAlt,
  FaShoppingCart,
  FaSignOutAlt,
} from "react-icons/fa";

const HomePage = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");

  const handleScrollToGallery = () => {
    const section = document.getElementById("furniture-section");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    alert("Logged out successfully!");
    navigate("/login");
  };

  return (
    <div className="font-sans">
      {/* 🔝 Navbar */}
      <nav className="bg-white shadow-lg px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <div
          className="text-3xl font-extrabold text-blue-700 cursor-pointer tracking-tight"
          onClick={() => navigate("/")}
        >
          🪑 Furni<span className="text-gray-800">Shop</span>
        </div>
        <div className="space-x-6 flex items-center text-gray-700 font-medium text-lg">
          <button
            onClick={() => navigate("/contact")}
            className="flex items-center gap-2 hover:text-blue-600 transition"
          >
            <FaPhoneAlt /> Contact
          </button>

          {/* 🛒 Cart Button */}
          <button
            onClick={() => navigate("/wishlist")}
            className="flex items-center gap-2 hover:text-blue-600 transition"
          >
            <FaShoppingCart /> Cart
          </button>

          {!isLoggedIn ? (
            <>
              <button
                onClick={() => navigate("/login")}
                className="flex items-center gap-2 hover:text-blue-600 transition"
              >
                <FaSignInAlt /> Login
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="flex items-center gap-2 hover:text-blue-600 transition"
              >
                <FaUserPlus /> Signup
              </button>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
            >
              <FaSignOutAlt /> Logout
            </button>
          )}
        </div>
      </nav>

      {/* 💫 Hero Section */}
      <section className="hero-section bg-gradient-to-r from-blue-50 to-white text-center py-24 px-6 shadow-inner">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-4">
          Welcome to Indian Furniture Store 🛋️
        </h1>
        <p className="text-gray-600 text-xl max-w-2xl mx-auto">
          Discover premium furniture for every room — elegance, comfort, and quality in one place 🏡
        </p>

        <button
          onClick={handleScrollToGallery}
          className="mt-8 px-8 py-3 bg-blue-600 text-white rounded-full text-lg hover:bg-blue-700 shadow-lg transform hover:scale-105 transition"
        >
          Explore Collection ↓
        </button>
      </section>

      {/* 🪑 Furniture Gallery Section */}
      <section id="furniture-section" className="mt-16 px-4 sm:px-8">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-10">
          Browse Our Collection
        </h2>
        <FurnitureGallery />
      </section>
    </div>
  );
};

export default HomePage;
