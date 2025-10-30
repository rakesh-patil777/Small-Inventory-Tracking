/*
 * =========================================
 * MERN STACK INVENTORY TRACKER - BACKEND
 * =========================================
 * This file contains the complete server-side code.
 * It uses Node.js, Express.js, Mongoose, and JWT for authentication.
 *
 * To Run:
 * 1. Make sure you have Node.js and MongoDB installed.
 * 2. Run `npm install express mongoose body-parser cors jsonwebtoken bcryptjs`
 * 3. Run `node backend.js` (or `nodemon backend.js`)
 *
 */

// --- Imports ---
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- Configuration ---
const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'your-jwt-secret-key'; // !! REPLACE with a strong secret key
const MONGO_URI = 'mongodb://localhost:27017/inventoryDB'; // Your local MongoDB URI

// --- Middleware ---
app.use(cors()); // Allows cross-origin requests (from React frontend)
app.use(bodyParser.json()); // Parses incoming JSON requests

// --- Database Connection ---
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected successfully.'))
    .catch(err => console.error('MongoDB connection error:', err));

// --- Database Schemas (Models) ---

// 1. User Schema (for login/registration)
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

// 2. Item Schema (for inventory items)
const ItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    quantity: { type: Number, required: true, default: 0 },
    description: { type: String },
    lastUpdated: { type: Date, default: Date.now },
});

const User = mongoose.model('User', UserSchema);
const Item = mongoose.model('Item', ItemSchema);

// --- JWT Authentication Middleware ---
// This function runs before any "protected" route
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (token == null) {
        return res.status(401).json({ message: 'No token provided' }); // Unauthorized
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token is invalid' }); // Forbidden
        }
        req.user = user; // Add user payload to request
        next(); // Move on to the route handler
    });
};

// --- API Routes ---

// == Auth Routes (Public) ==

// 1. POST /api/auth/register - Register a new user
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Check if user already exists
        let user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create and save new user
        user = new User({ username, password: hashedPassword });
        await user.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// 2. POST /api/auth/login - Log in a user
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create JWT token
        const payload = { user: { id: user.id, username: user.username } };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour

        res.json({ token });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});


// == Inventory Routes (Protected) ==
// All routes below this point require a valid JWT token

// 3. GET /api/items - Get all inventory items
app.get('/api/items', authenticateToken, async (req, res) => {
    try {
        const items = await Item.find();
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// 4. POST /api/items - Add a new item
app.post('/api/items', authenticateToken, async (req, res) => {
    try {
        const { name, quantity, description } = req.body;
        
        const newItem = new Item({
            name,
            quantity,
            description,
        });

        const item = await newItem.save();
        res.status(201).json(item);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// 5. PUT /api/items/:id - Update an existing item
app.put('/api/items/:id', authenticateToken, async (req, res) => {
    try {
        const { name, quantity, description } = req.body;
        let item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Update fields
        item.name = name || item.name;
        item.quantity = quantity !== undefined ? quantity : item.quantity;
        item.description = description || item.description;
        item.lastUpdated = Date.now();

        await item.save();
        res.json(item);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// 6. DELETE /api/items/:id - Delete an item
app.delete('/api/items/:id', authenticateToken, async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        await item.deleteOne(); // Use deleteOne() instead of remove()
        res.json({ message: 'Item removed successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});


// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
