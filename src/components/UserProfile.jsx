import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const UserProfile = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [deliveredCount, setDeliveredCount] = useState(0);
  const [placedCount, setPlacedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  // Get logged-in user from localStorage
  const storedUser = JSON.parse(localStorage.getItem("user")) || { name: "", email: "" };
  const firstLetter = storedUser?.name?.charAt(0).toUpperCase();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const endpoint = userId || storedUser?._id ? `/api/user/${userId || storedUser._id}` : null;

        const res = await axios.get(endpoint);

        setUser(res.data.user); // Set user data
        setDeliveredCount(res.data.deliveredCount); // Set delivered order count
        setPlacedCount(res.data.placedCount); // Set placed order count
      } catch (error) {
        console.error("Error fetching user data:", error);
        setErrorMessage("Error fetching user data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-100 to-purple-100">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-t-indigo-600 border-b-indigo-600 border-l-transparent border-r-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-indigo-800 font-medium">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Error message display */}
        {errorMessage && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{errorMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main profile card */}
        <div className="bg-white bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden transform transition-all hover:shadow-2xl border border-gray-100">
          <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 animate-gradient-x px-8 py-8">
            <h1 className="text-4xl font-bold text-white text-shadow">Welcome, {storedUser?.name}!</h1>
            <p className="text-indigo-100 text-lg mt-2">Manage your account and view your orders</p>
          </div>

          {/* User Info Display */}
          {storedUser && storedUser.name && (
            <div className="py-8 px-8 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200">
              <div className="flex items-center space-x-8">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white flex items-center justify-center text-4xl font-bold shadow-lg ring-4 ring-white">
                    {firstLetter}
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-green-400 w-6 h-6 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                    {storedUser.name}
                  </p>
                  <div className="flex items-center mt-2">
                    <svg className="w-5 h-5 text-gray-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    <p className="text-gray-600">{storedUser.email}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Orders and Wishlist Sections */}
          <div className="px-8 py-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Orders Card */}
            <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <span className="px-3 py-1 text-xs text-indigo-600 bg-indigo-100 rounded-full font-medium">Orders</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">My Orders</h3>
              <p className="text-gray-600 mb-6">You have {placedCount} placed orders and {deliveredCount} delivered orders.</p>
              <button
                onClick={() => navigate("/my-orders")}
                className="w-full py-3 text-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md transition-all flex items-center justify-center"
              >
                <span>View Orders</span>
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>

            {/* Wishlist Card */}
            <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <span className="px-3 py-1 text-xs text-purple-600 bg-purple-100 rounded-full font-medium">Wishlist</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">My Wishlist</h3>
              <p className="text-gray-600 mb-6">Save items for later and never lose track of what you want</p>
              <button
                onClick={() => navigate("/my-wishlist")}
                className="w-full py-3 text-lg font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-md transition-all flex items-center justify-center"
              >
                <span>View Wishlist</span>
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
