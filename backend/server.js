import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import bodyParser from "body-parser";
import PDFDocument from 'pdfkit';
import moment from 'moment';
import fs from 'fs';
import path from 'path';




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
  address: { type: String },
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
  const reviewSchema = new mongoose.Schema({
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Product'
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    reviewText: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  });
  
  const Review = mongoose.model('Review', reviewSchema);
  const orderSchema = new mongoose.Schema({
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    items: [
      {
        name: String,
        price: Number,
        quantity: Number,
        total: Number,
        image: String,
        category: String,
      },
    ],
    totalAmount: Number,
    address: String,
    createdAt: { type: Date, default: Date.now },
    // Add status field for tracking Placed/Delivered
    status: {
      type: String,
      enum: ['Placed', 'Delivered'],
      default: 'Placed'
    },
    phoneNumber: { 
      type: String, 
      required: true,  // If you want the phone number to be required
      match: /^[0-9]{10}$/,  // Example regex for 10-digit phone number (adjust as needed)
      trim: true 
    }
    
  });
  
  const Order = mongoose.model('Order', orderSchema);

  const cartSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],
  });
  
  const Cart = mongoose.model("Cart", cartSchema);

// ========================
// Middleware for JWT
// ========================


const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log('Auth header received:', authHeader);

  if (!authHeader) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Invalid token format. Use 'Bearer {token}'." });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Access denied. Token is empty." });
  }

  try {
    const secret = process.env.JWT_SECRET || "your-secret-key";
    console.log('Attempting to verify token with secret (first chars):', secret.substring(0, 3) + '...');

    const decoded = jwt.verify(token, secret);
    console.log('Token verified successfully:', decoded);

    req.user = decoded;

    if (!decoded.id) {
      return res.status(400).json({ error: "Invalid token structure. Missing user ID." });
    }

    console.log('Authentication successful for user ID:', decoded.id);
    next();
  } catch (err) {
    console.error('Token verification failed:', err.name, err.message);
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: "Invalid token. Could not verify signature." });
    } else if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: "Token expired. Please login again." });
    } else {
      return res.status(400).json({ error: "Invalid token: " + err.message });
    }
  }
};


const isAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Not authorized as admin.' });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
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
app.delete("/api/cart/remove/:cartItemId", authenticate, async (req, res) => {
  try {
    const { cartItemId } = req.params;

    // Remove the item by ID (assuming Mongoose)
    await CartItem.findByIdAndDelete(cartItemId);

    res.status(200).json({ message: "Item removed from cart" });
  } catch (error) {
    console.error("Error removing cart item:", error);
    res.status(500).json({ error: "Failed to remove item from cart" });
  }
});

// Add wishlist products
// Add to wishlist
app.post("/api/wishlist/add", authenticate, async (req, res) => {
  const { productId } = req.body;
  const userId = req.user.id;

  try {
    // Ensure product exists
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    // Check if it's already in the wishlist
    const existingItem = await WishlistItem.findOne({ userId, productId });
    if (existingItem) return res.status(400).json({ message: "Product already in wishlist" });

    // Add to wishlist
    const newWishlistItem = new WishlistItem({ userId, productId, name: product.name, image: product.image });
    await newWishlistItem.save();
    res.status(201).json({ message: "Product added to wishlist" });
  } catch (error) {
    console.error("Add to Wishlist Error:", error);
    res.status(500).json({ error: "Failed to add to wishlist" });
  }
});

// Remove from wishlist
app.delete("/api/wishlist/remove", authenticate, async (req, res) => {
  const { productId } = req.body;
  const userId = req.user.id;

  try {
    const item = await WishlistItem.findOneAndDelete({ userId, productId });
    if (!item) return res.status(404).json({ message: "Product not found in wishlist" });

    res.status(200).json({ message: "Product removed from wishlist" });
  } catch (error) {
    console.error("Remove from Wishlist Error:", error);
    res.status(500).json({ error: "Failed to remove from wishlist" });
  }
});


// Get Wishlist Items
app.get("/api/wishlist", authenticate, async (req, res) => {
  const userId = req.user.id; // pulled from the token by the authenticate middleware

  const wishlistItems = await WishlistItem.find({ userId }).populate("productId");
  res.status(200).json(wishlistItems);
});
app.delete("/api/wishlist/remove", authenticate, async (req, res) => {
  const { productId } = req.body;
  const userId = req.user.id;

  try {
    const item = await WishlistItem.findOneAndDelete({ userId, productId });
    if (!item) return res.status(404).json({ message: "Product not found in wishlist" });

    res.status(200).json({ message: "Product removed from wishlist" });
  } catch (error) {
    console.error("Remove from Wishlist Error:", error);
    res.status(500).json({ error: "Failed to remove from wishlist" });
  }
});
app.post('/api/reviews/add', authenticate, async (req, res) => {
  try {
    const { productId, reviewText, rating } = req.body;
    const userId = req.user.id;  // from decoded token

    const newReview = new Review({
      productId,
      userId,
      reviewText,
      rating
    });

    const savedReview = await newReview.save();
    res.status(201).json(savedReview);
  } catch (err) {
    console.error('Error adding review:', err);
    res.status(500).json({ message: 'Failed to add review' });
  }
});

// Get reviews for a product
app.get('/api/reviews/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    console.log('Fetching reviews for productId:', productId); // Log the productId

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid productId' });
    }

    const reviews = await Review.find({ productId: new mongoose.Types.ObjectId(productId) }).sort({ createdAt: -1 });
    console.log('Reviews found:', reviews); // Log fetched reviews
    res.json(reviews);
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
});
app.put('/api/reviews/update', authenticate, async (req, res) => {
  try {
    const { reviewId, reviewText, rating } = req.body;
    
    // Find the review
    const review = await Review.findById(reviewId);
    
    // Check if review exists
    if (!review) {
      return res.status(404).json({ msg: 'Review not found' });
    }
    
    // Check if user owns this review
    if (review.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized to update this review' });
    }
    
    // Update the review
    review.reviewText = reviewText;
    review.rating = rating;
    review.updatedAt = Date.now();
    
    // Save the updated review
    await review.save();
    
    res.status(200).json(review);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
app.delete('/api/reviews/delete', authenticate, async (req, res) => {
  try {
    const { reviewId } = req.body;

    if (!reviewId) {
      return res.status(400).json({ message: 'Review ID is required' });
    }

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Only allow the user who wrote the review to delete it
    if (review.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to delete this review' });
    }

    await Review.findByIdAndDelete(reviewId);

    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
app.post('/api/orders', authenticate, async (req, res) => {
  try {
    const { items, totalAmount, address, phoneNumber } = req.body;
    
    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'No items provided' });
    }
    
    if (!address) {
      return res.status(400).json({ message: 'Delivery address is required' });
    }
    
    if (!phoneNumber) {
      return res.status(400).json({ message: 'Phone number is required' });
    }
    
    // Validate phone number format (10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({ message: 'Invalid phone number format. Please provide a 10-digit number.' });
    }
    
    // Validate and reduce stock
    for (const item of items) {
      const product = await Product.findOne({ name: item.name }); // Use _id if available for better accuracy
      
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.name}` });
      }
      
      if (product.quantity < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${item.name}` });
      }
      
      // Reduce product quantity
      product.quantity -= item.quantity;
      
      // Update availability if quantity is 0
      if (product.quantity === 0) {
        product.availability = 'Out of Stock';
      }
      
      await product.save();
    }
    
    // Prepare validated items with image
    const validatedItems = items.map(item => ({
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      total: item.total,
      image: item.image || "",
    }));
    
    // Create and save order
    const newOrder = new Order({
      userId: req.user.id,
      items: validatedItems,
      totalAmount,
      address,
      phoneNumber,
    });
    
    const savedOrder = await newOrder.save();
    
    res.status(201).json({
      message: 'Order placed successfully',
      orderId: savedOrder._id
    });
  } catch (err) {
    console.error('Error placing order:', err);
    res.status(500).json({ message: 'Failed to place order' });
  }
});



app.get('/api/orders/my', authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err.message);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// Modified backend route
// Backend route for updating cart item quantity
app.put('/api/cart/update/:userId/:productId', async (req, res) => {
  const { userId, productId } = req.params;
  const { quantity } = req.body;
  console.log(quantity);
  
  // Validate input
  if (!userId || !productId || quantity === undefined) {
    return res.status(400).json({ message: 'Missing required parameters' });
  }
  
  try {
    // Find the cart where productId field stores the user ID
    const existingCart = await Cart.findOne({ 
      user: new mongoose.Types.ObjectId(userId) // Using 'user' field as mentioned in validation error
    });
    
    if (!existingCart) {
      // If cart doesn't exist, create a new one with proper fields
      const newCart = new Cart({
        user: new mongoose.Types.ObjectId(userId), // 'user' field is required per error
        products: [{ 
          productId: new mongoose.Types.ObjectId(productId), // 'productId' field is required per error
          quantity: quantity 
        }]
      });
      
      await newCart.save();
      
      return res.status(201).json({
        message: 'New cart created with product',
        cart: newCart
      });
    }
    
    // Check if product exists in cart
    const productExists = existingCart.products.some(
      product => product.productId.toString() === productId
    );
    
    if (!productExists) {
      // If product not in cart, add it
      existingCart.products.push({
        productId: new mongoose.Types.ObjectId(productId),
        quantity: quantity
      });
      
      const updatedCart = await existingCart.save();
      
      return res.status(200).json({
        message: 'Product added to cart',
        cart: updatedCart
      });
    }
    
    // Update existing product quantity
    // Using findOneAndUpdate directly on the Cart model
    const updatedCart = await Cart.findOneAndUpdate(
      {
        user: new mongoose.Types.ObjectId(userId),
        'products.productId': new mongoose.Types.ObjectId(productId)
      },
      {
        $set: { 'products.$.quantity': quantity }
      },
      { new: true }
    );
    
    // Check if update was successful
    if (!updatedCart) {
      return res.status(404).json({ message: 'Unable to update cart' });
    }
    
    res.status(200).json({
      message: 'Quantity updated successfully',
      cart: updatedCart
    });
  } catch (err) {
    console.error('Cart update error:', err.message, err.stack);
    
    // More specific error handling
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// Express backend
app.get("/api/products/:id", async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  res.json(product);
});
// Get similar products by category (excluding current product)
app.get("/api/products/similar/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const similarProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id }, // exclude the current product
    });

    res.status(200).json(similarProducts);
  } catch (error) {
    console.error("Fetch Similar Products Error:", error);
    res.status(500).json({ error: "Failed to fetch similar products" });
  }
});
app.get('/api/user/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password'); // Exclude the password from the response
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);  // Send user details as response
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
app.put('/api/user/:id', async (req, res) => {
  const { name, email, address } = req.body;

  // Basic validation
  if (!name || !email) {
    return res.status(400).json({ message: 'Name and Email are required' });
  }

  try {
    // Find user by ID and update profile details
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, address },
      { new: true, runValidators: true }
    ).select('-password');  // Exclude password

    if (!updatedUser) return res.status(404).json({ message: 'User not found' });

    res.json(updatedUser);  // Send updated user profile as response
  } catch (err) {
    // 👇 ADD THIS BLOCK HERE
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    console.error('Error updating user:', err);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address (e.g., 'your-email@gmail.com')
    pass: process.env.EMAIL_PASS, // Gmail App Password (not your regular Gmail password)
  },
});
app.post('/api/send-confirmation', async (req, res) => {
  const { email, orderId } = req.body;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Order Confirmation',
    text: `Thank you for your order! Your order ID is ${orderId}.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Confirmation email sent' });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ message: 'Failed to send email', error });
  }
});
// Add these endpoints to your existing Express app

// GET all orders - used by the admin dashboard
// Route to fetch placed orders
app.get('/api/orders/placed', isAdmin, async (req, res) => {
  console.log('Admin access granted');
  try {
    const orders = await Order.find({ status: 'Placed' }).populate('userId', 'name email');
    console.log('Found orders:', orders);
    res.status(200).json({ orders });
  } catch (err) {
    console.error('Error in /api/orders/placed:', err);
    res.status(500).json({ error: 'Server error while fetching orders' });
  }
});


// Route to mark an order as delivered - with API prefix
app.put('/api/orders/:orderId/deliver', isAdmin, async (req, res) => {
  const { orderId } = req.params;
  
  try {
    // Find the order by ID
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Check if the order is already delivered
    if (order.status === 'Delivered') {
      return res.status(400).json({ error: 'Order is already marked as delivered' });
    }
    
    // Check if the order is placed
    if (order.status !== 'Placed') {
      return res.status(400).json({ error: 'Order is not in "Placed" status' });
    }
    
    // Update the order status to "Delivered"
    order.status = 'Delivered';
    await order.save();
    
    res.status(200).json({ message: 'Order marked as Delivered', order });
  } catch (err) {
    console.error('Error in /api/orders/:orderId/deliver:', err);
    res.status(500).json({ error: 'Server error while updating order status' });
  }
});
app.get('/api/orders', authenticate, isAdmin, async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    const filter = {};

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
      };
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});


app.get('/api/orders/report', authenticate, isAdmin, async (req, res) => {
  try {
    // Set up filters based on query parameters
    const { startDate, endDate, status } = req.query;
    const filter = {};
    
    // Add date range filter if provided
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
      };
    }
    
    
    // Add status filter if provided
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Fetch orders based on filters
    const orders = await Order.find(filter)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    
    // Create a PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      info: {
        Title: 'Order Report',
        Author: 'Your Company Name',
        Subject: 'Order Summary Report'
      }
    });
    
    // Set up the response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=orders-report-${moment().format('YYYY-MM-DD')}.pdf`);
    
    // Pipe the PDF directly to the response
    doc.pipe(res);
    
    // Add company logo (optional)
    // doc.image('path/to/logo.png', 50, 45, { width: 150 });
    
    // Add report title
    doc.font('Helvetica-Bold')
      .fontSize(20)
      .text('Orders Report', { align: 'center' });
    
    // Add report date range
    doc.font('Helvetica')
      .fontSize(12)
      .moveDown()
      .text(`Generated on: ${moment().format('MMMM D, YYYY')}`, { align: 'center' })
      .moveDown();
      
    if (startDate && endDate) {
      doc.text(`Date Range: ${moment(startDate).format('MMM D, YYYY')} to ${moment(endDate).format('MMM D, YYYY')}`);
    }
    
    if (status && status !== 'all') {
      doc.text(`Status Filter: ${status}`);
    }
    
    doc.moveDown()
      .text(`Total Orders: ${orders.length}`)
      .moveDown(2);
    
    // Add summary section
    doc.font('Helvetica-Bold')
      .fontSize(16)
      .text('Order Summary')
      .moveDown();
    
    // Calculate summary statistics
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const deliveredOrders = orders.filter(order => order.status === 'Delivered').length;
    const pendingOrders = orders.filter(order => order.status === 'Placed').length;
    
    // Add summary data
    doc.font('Helvetica')
      .fontSize(12)
      .text(`Total Revenue: ₹${totalRevenue.toFixed(2)}`)
      .moveDown()
      .text(`Delivered Orders: ${deliveredOrders}`)
      .moveDown()
      .text(`Pending Orders: ${pendingOrders}`)
      .moveDown(2);
    
    // Add orders table
    doc.font('Helvetica-Bold')
      .fontSize(16)
      .text('Order Details')
      .moveDown();
    
    // Table headers
    const tableTop = doc.y;
    const itemsPerPage = 7; // Adjust based on your design
    let itemsOnCurrentPage = 0;
    
    // Create table headers function
    const createTableHeaders = (doc, y) => {
      doc.font('Helvetica-Bold')
        .fontSize(10)
        .text('Order ID', 50, y, { width: 100 })
        .text('Customer', 150, y, { width: 100 })
        .text('Date', 250, y, { width: 90 })
        .text('Amount', 340, y, { width: 60 })
        .text('Status', 400, y, { width: 90 })
        .moveDown();
      
      // Draw a line below headers
      doc.moveTo(50, y + 15)
        .lineTo(550, y + 15)
        .stroke();
      
      return y + 20; // Return the new y position
    };
    
    let tableY = createTableHeaders(doc, tableTop);
    
    // Add orders to the table
    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      
      // Check if we need a new page
      if (itemsOnCurrentPage === itemsPerPage) {
        doc.addPage();
        tableY = createTableHeaders(doc, 50); // Reset to top of page with headers
        itemsOnCurrentPage = 0;
      }
      
      // Truncate order ID to fit
      const orderId = order._id.toString().substring(0, 8) + '...';
      const customerName = order.userId?.name || 'N/A';
      const orderDate = moment(order.createdAt).format('MMM D, YYYY');
      const amount = `₹${order.totalAmount.toFixed(2)}`;
      const status = order.status || 'Placed';
      
      // Add order row
      doc.font('Helvetica')
        .fontSize(10)
        .text(orderId, 50, tableY, { width: 100 })
        .text(customerName, 150, tableY, { width: 100 })
        .text(orderDate, 250, tableY, { width: 90 })
        .text(amount, 340, tableY, { width: 60 })
        .text(status, 400, tableY, { width: 90 });
      
      // Draw a light line below each row
      tableY += 15;
      doc.strokeColor('#e6e6e6')
        .moveTo(50, tableY)
        .lineTo(550, tableY)
        .stroke()
        .strokeColor('#000');
      
      tableY += 5;
      itemsOnCurrentPage++;
    }
    
    // Finalize the PDF
    doc.end();
    
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ message: 'Failed to generate report' });
  }
});
// GET /api/orders/revenue-by-category
app.get('/api/orders/revenue-by-category', authenticate, async (req, res) => {
  try {
    // This approach uses MongoDB's aggregation pipeline with $lookup
    // First, we need to create a temporary collection with product name to category mapping
    
    // Get all products to create a lookup collection
    const products = await Product.find({}, 'name category');
    
    // Use aggregation pipeline with $facet to do multiple operations
    const result = await Order.aggregate([
      // Match only delivered orders
      { $match: { status: "Delivered" } },
      
      // Unwind the items array to work with individual items
      { $unwind: "$items" },
      
      // Create a synthetic join since we don't have direct productId references
      // We'll use $lookup with pipeline to simulate a join on product name
      {
        $lookup: {
          from: "products",
          // Use let to define variables from the order item
          let: { productName: "$items.name" },
          // Pipeline inside lookup to find matching product
          pipeline: [
            { $match: { $expr: { $eq: ["$name", "$$productName"] } } },
            // Only return fields we need
            { $project: { category: 1, _id: 0 } }
          ],
          as: "productInfo"
        }
      },
      
      // Unwind the productInfo array (will be a single object if lookup successful)
      { $unwind: { path: "$productInfo", preserveNullAndEmptyArrays: true } },
      
      // Group by product category
      {
        $group: {
          _id: { $ifNull: ["$productInfo.category", "Uncategorized"] },
          totalRevenue: {
            $sum: { $multiply: ["$items.price", "$items.quantity"] }
          },
          count: { $sum: "$items.quantity" }
        }
      },
      
      // Format results
      {
        $project: {
          _id: 1,
          totalRevenue: { $round: ["$totalRevenue", 2] },
          count: 1
        }
      },
      
      // Sort by revenue (highest first)
      { $sort: { totalRevenue: -1 } }
    ]);

    console.log("Aggregation result:", JSON.stringify(result, null, 2));
    res.json(result);
    
  } catch (err) {
    console.error("Revenue fetch failed:", err);
    res.status(500).json({ error: "Failed to fetch revenue data: " + err.message });
  }
});
// GET /api/user/current
app.get("/api/user/current", authenticate, async (req, res) => {
  const userId = req.user.id;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

// PUT /api/user/current
app.put("/api/user/current", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, address } = req.body;

    console.log("User ID:", userId);
    console.log("Updated Fields:", { name, email, address });

    const emailExists = await User.findOne({ email, _id: { $ne: userId } });
    if (emailExists) {
      console.log("Email already in use");
      return res.status(400).json({ message: "Email already in use" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, email, address },
      { new: true }
    );
    console.log("Updated user:", updatedUser);

    res.json(updatedUser);
  } catch (error) {
    console.error("Error during update:", error);
    res.status(500).json({ message: "Internal server error" });
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
