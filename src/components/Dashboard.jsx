import React, { useState, useEffect } from "react";
import FurnitureGallery from "./FurnitureGallery";
import { useNavigate, Link } from "react-router-dom";
import {
  FaSignInAlt,
  FaUserPlus,
  FaPhoneAlt,
  FaShoppingCart,
  FaSignOutAlt,
  FaHeart,
  FaChevronDown,
  FaHome,
  FaUserCircle,
  FaAward,
  FaTruck,
  FaHandshake,
  FaHistory,
  FaMoneyBillWave
} from "react-icons/fa";

const HomePage = () => {
  const navigate = useNavigate();
  // Use state to track login status instead of directly accessing localStorage each render
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Check login status on component mount
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
    };
    
    checkLoginStatus();
    
    // Add event listener for storage changes (in case another tab logs in/out)
    window.addEventListener('storage', checkLoginStatus);
    
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, []);

  const handleScrollToGallery = () => {
    const section = document.getElementById("furniture-section");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleLogout = () => {
    // Clear all auth data
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    
    // Update local state
    setIsLoggedIn(false);
    
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
    <div className="font-sans bg-gray-50">
      {/* Navbar with new purple color scheme */}
      <nav className="bg-gradient-to-r from-purple-800 to-indigo-600 shadow-md px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <div
          className="text-3xl font-extrabold cursor-pointer tracking-tight flex items-center"
          onClick={() => navigate("/")}
        >
          <span className="text-amber-300">🪑 Furni</span>
          <span className="text-white">Shop</span>
        </div>
        
        <div className="space-x-4 flex items-center text-white font-medium">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 hover:text-amber-300 transition px-3 py-2"
          >
            <FaHome /> Home
          </button>
          
          <button
            onClick={() => navigate("/contact")}
            className="flex items-center gap-2 hover:text-amber-300 transition px-3 py-2"
          >
            <FaPhoneAlt /> Contact
          </button>

          <button
            onClick={() => navigate("/wishlist")}
            className="flex items-center gap-2 hover:text-amber-300 transition px-3 py-2"
          >
            <FaShoppingCart />
            <span>Cart</span>
          </button>

          {isLoggedIn && (
            <>
              <button
                onClick={() => navigate("/my-wishlist")}
                className="flex items-center gap-2 hover:text-amber-300 transition px-3 py-2"
              >
                <FaHeart className="text-red-400" />
                <span>Wishlist</span>
              </button>
              
              <button
                onClick={() => navigate("/my-orders")}
                className="flex items-center gap-2 hover:text-amber-300 transition px-3 py-2"
              >
                <FaShoppingCart /> My Orders
              </button>

              <button
                onClick={() => navigate("/profile")}
                className="flex items-center gap-2 hover:text-amber-300 transition px-3 py-2"
              >
                <FaUserCircle /> Profile
              </button>
            </>
          )}

          {!isLoggedIn ? (
            <>
              {/* Use both direct Link and onClick handler for better reliability */}
              <Link 
                to="/login"
                onClick={handleLogin}
                className="flex items-center gap-2 hover:bg-amber-400 bg-amber-500 text-purple-900 transition rounded-md px-4 py-2"
              >
                <FaSignInAlt /> Login
              </Link>
              
              <Link
                to="/signup"
                className="flex items-center gap-2 bg-indigo-900 text-amber-400 px-4 py-2 rounded-md hover:bg-indigo-950 transition"
              >
                <FaUserPlus /> Signup
              </Link>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
            >
              <FaSignOutAlt /> Logout
            </button>
          )}
        </div>
      </nav>

      {/* Hero Section with new gradient */}
      <section
  className="hero-section relative text-center py-32 px-6 shadow-inner overflow-hidden bg-gray-300"
>
  {/* Optional pattern overlay – remove if not needed */}
  {/* <div className="absolute inset-0 opacity-5 bg-repeat" style={{
    backgroundImage: "url('data:image/svg+xml,...')"
  }}></div> */}

  <div className="relative z-10">
    <h1 className="text-5xl md:text-6xl font-bold mb-6 text-black drop-shadow-lg">
      Welcome to Indian Furniture Store 🛋️
    </h1>

    <p className="text-black text-xl max-w-2xl mx-auto leading-relaxed">
      Discover premium furniture for every room — elegance, comfort, and quality in one place 🏡
    </p>

    <button
      onClick={handleScrollToGallery}
      className="mt-10 px-8 py-3 bg-black text-white rounded-full text-lg hover:bg-gray-900 shadow-lg transform hover:scale-105 transition flex items-center gap-2 mx-auto"
    >
      Explore Collection <FaChevronDown />
    </button>
  </div>
</section>



      {/* About Our Shop Section - New color scheme (Dashboard section) */}
      <section className="py-16 px-8 bg-gradient-to-r from-white to-purple-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
            About Shop
          </h2>
          
          <p className="text-center text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Founded in 2010, FurniShop has become India's most trusted destination for premium handcrafted furniture. 
            Our pieces blend traditional Indian craftsmanship with contemporary design, creating timeless additions to your home.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-12">
            <div className="bg-gradient-to-br from-purple-100 to-indigo-50 p-6 rounded-lg shadow-md text-center hover:shadow-lg transition">
              <div className="text-purple-600 text-4xl mb-4 flex justify-center">
                <FaAward />
              </div>
              <h3 className="font-bold text-xl mb-2 text-indigo-900">Premium Quality</h3>
              <p className="text-indigo-800">Crafted from the finest materials with exquisite attention to detail</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-100 to-indigo-50 p-6 rounded-lg shadow-md text-center hover:shadow-lg transition">
              <div className="text-purple-600 text-4xl mb-4 flex justify-center">
                <FaHistory />
              </div>
              <h3 className="font-bold text-xl mb-2 text-indigo-900">15+ Years</h3>
              <p className="text-indigo-800">Serving customers across India with passion and dedication</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-100 to-indigo-50 p-6 rounded-lg shadow-md text-center hover:shadow-lg transition">
              <div className="text-purple-600 text-4xl mb-4 flex justify-center">
                <FaHandshake />
              </div>
              <h3 className="font-bold text-xl mb-2 text-indigo-900">Customer First</h3>
              <p className="text-indigo-800">5-year warranty and dedicated post-purchase support</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-100 to-indigo-50 p-6 rounded-lg shadow-md text-center hover:shadow-lg transition">
              <div className="text-purple-600 text-4xl mb-4 flex justify-center">
                <FaMoneyBillWave />
              </div>
              <h3 className="font-bold text-xl mb-2 text-indigo-900">Cash on Delivery</h3>
              <p className="text-indigo-800">Pay only when your furniture arrives — safe and hassle-free payments</p>
            </div>
          </div>
          
        </div>
      </section>

      {/* Furniture Gallery Section - UNCHANGED */}
      <section id="furniture-section" className="py-16 px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-2">
            Browse Our Collection
          </h2>
          <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">
            Handcrafted furniture pieces that blend tradition with contemporary design
          </p>
          <FurnitureGallery />
        </div>
      </section>
      
      {/* Footer with new color scheme */}
      <footer className="bg-indigo-900 text-white py-8 px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="text-2xl font-bold mb-4 md:mb-0">
            <span className="text-amber-300">🪑 Furni</span>
            <span className="text-white">Shop</span>
          </div>
          <div className="text-sm text-indigo-100">
            &copy; {new Date().getFullYear()} Indian Furniture Store. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;