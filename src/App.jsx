import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import DashboardAdmin from "./components/DashboardAdmin";
import Contact from "./components/Contact";
import FurnitureGallery from "./components/FurnitureGallery";
import AddProduct from "./components/AddProduct";
import AdminFurniturePage from "./components/AdminFurniturePage";
import WishlistPage from "./components/WishlistPage";
import MyWishlist from "./components/MyWishlist";
import ProductDetails from "./components/ProductDetails"; // ✅ Newly added import

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));
  const [role, setRole] = useState(localStorage.getItem("role"));

  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem("token"));
      setRole(localStorage.getItem("role"));
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLoginSuccess = (token, userRole) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", userRole);
    setIsAuthenticated(true);
    setRole(userRole);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setIsAuthenticated(false);
    setRole(null);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" />
            ) : (
              <Login setIsAuthenticated={handleLoginSuccess} />
            )
          }
        />
        <Route
          path="/signup"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Signup />}
        />
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              role === "admin" ? (
                <DashboardAdmin handleLogout={handleLogout} />
              ) : (
                <Dashboard handleLogout={handleLogout} />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="/contact" element={<Contact />} />
        <Route path="/furniture-gallery" element={<FurnitureGallery />} />
        <Route path="/add-product" element={<AddProduct />} />
        <Route
          path="/furniture-view"
          element={
            isAuthenticated && role === "admin" ? (
              <AdminFurniturePage />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/wishlist"
          element={isAuthenticated ? <WishlistPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/my-wishlist"
          element={isAuthenticated ? <MyWishlist /> : <Navigate to="/login" />}
        />

        {/* ✅ New product detail route */}
        <Route path="/products/:id" element={<ProductDetails />} />

        <Route
          path="/"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
