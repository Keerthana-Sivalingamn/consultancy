import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// ========================
// MongoDB Connection
// ========================
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/furniture", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Connection Error:", err));

// ========================
// Schemas & Models
// ========================

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "customer"], default: "customer" },
});
const User = mongoose.model("User", userSchema);

// Product Schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  availability: { type: String, default: "In Stock" },
  quantity: { type: Number, default: 1 },
});
const Product = mongoose.model("Product", productSchema);

// Cart Schema
const cartItemSchema = new mongoose.Schema(
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      quantity: { type: Number, default: 1 },
  
      // Store snapshot of product details
      name: String,
      image: String,
      price: Number,
      category: String,
      availability: String,
    },
    { timestamps: true }
  );
  const CartItem = mongoose.model("CartItem", cartItemSchema);

  const wishlistItemSchema = new mongoose.Schema(
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  
      // Store snapshot of product details
      name: String,
      image: String,
      price: Number,
      category: String,
      availability: String,
    },
    { timestamps: true }
  );
  const WishlistItem = mongoose.model("WishlistItem", wishlistItemSchema);


// ========================
// Middleware for JWT
// ========================


const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  
  // Check if token is provided
  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    // Verify token using the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    
    // Attach the decoded user info to the request
    req.user = decoded;
    
    // Proceed to the next middleware or route handler
    next();
  } catch (err) {
    // If token verification fails (invalid or expired token), send error
    res.status(400).json({ error: "Invalid token." });
  }
};


// ========================
// Authentication Routes
// ========================

// Signup
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const role = email.toLowerCase().includes("admin") ? "admin" : "customer";

    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
    });

    await newUser.save();
    res.status(201).json({ message: `✅ ${role} registered successfully` });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ error: "Signup failed" });
  }
});

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid password" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "✅ Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// ========================
// Product Routes
// ========================

// Add Product
app.post("/api/products", authenticate, async (req, res) => {
  const { name, image, price, category, availability, quantity } = req.body;
  try {
    const newProduct = new Product({
      name,
      image,
      price,
      category,
      availability: availability || "In Stock",
      quantity: quantity || 1,
    });

    await newProduct.save();
    res.status(201).json({ message: "✅ Product added successfully" });
  } catch (error) {
    console.error("Product Add Error:", error);
    res.status(500).json({ error: "Failed to add product" });
  }
});

// Get All Products
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    console.error("Fetch Products Error:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// Update Product by ID
app.put("/api/products/:id", authenticate, async (req, res) => {
  const { name, image, price, category, availability, quantity } = req.body;

  if (!name || !image || !price || !category) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        image,
        price,
        category,
        availability,
        quantity,
      },
      { new: true }
    );

    res.json(updatedProduct);
  } catch (error) {
    console.error("Product Update Error:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
});


// Delete Product by ID
app.delete("/api/products/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const objectId = new mongoose.Types.ObjectId(id);
      const deleted = await Product.findByIdAndDelete(objectId);
      if (!deleted) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting product", error });
    }
  });
// ========================
// Cart Routes
// ========================

// Add to Cart
app.post("/api/cart/add", authenticate, async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.user.id;
  
    try {
      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ error: "Product not found" });
  
      const existingItem = await CartItem.findOne({ userId, productId });
  
      if (existingItem) {
        existingItem.quantity += quantity || 1;
        await existingItem.save();
        return res.status(200).json({ message: "Cart item updated" });
      }
  
      const newCartItem = new CartItem({
        userId,
        productId,
        quantity: quantity || 1,
        name: product.name,
        image: product.image,
        price: product.price,
        category: product.category,
        availability: product.availability,
      });
      console.log("Adding to cart:", { userId, productId, quantity });
  
      await newCartItem.save();
      res.status(201).json({ message: "Product added to cart with full details" });
    } catch (error) {
      console.error("Add to Cart Error:", error);
      res.status(500).json({ error: "Failed to add to cart" });
    }
  });
  

// Get  Cart Items
app.get("/api/cart/:userId", authenticate, async (req, res) => {
  try {
    const cartItems = await CartItem.find({ userId: req.params.userId });
    console.log(cartItems);
    res.status(200).json(cartItems);
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ error: "Failed to fetch cart" });
  }
});
// Add wishlist products
app.post("/api/wishlist/add", authenticate, async (req, res) => {
  const { productId } = req.body;
  const userId = req.user.id;

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const existingItem = await WishlistItem.findOne({ userId, productId });
    if (existingItem) {
      return res.status(400).json({ message: "Product already in wishlist" });
    }

    const newWishlistItem = new WishlistItem({
      userId,
      productId,
      name: product.name,
      image: product.image,
      price: product.price,
      category: product.category,
      availability: product.availability,
    });

    await newWishlistItem.save();
    res.status(201).json({ message: "Product added to wishlist" });
  } catch (error) {
    console.error("Add to Wishlist Error:", error);
    res.status(500).json({ error: "Failed to add to wishlist" });
  }
});

// Get Wishlist Items
app.get("/api/wishlist/:userId", authenticate, async (req, res) => {
  try {
    const wishlistItems = await WishlistItem.find({ userId: req.params.userId });
    res.status(200).json(wishlistItems);
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    res.status(500).json({ error: "Failed to fetch wishlist" });
  }
});




// ========================
// Default Route
// ========================
app.get("/", (req, res) => {
  res.send("🚀 Furniture Shop API Running");
});

// ========================
// Start Server
// ========================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
