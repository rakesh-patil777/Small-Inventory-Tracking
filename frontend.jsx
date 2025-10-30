/*
 * =========================================
 * MERN STACK INVENTORY TRACKER - FRONTEND
 * =========================================
 * This file contains the complete React.js frontend.
 * It assumes you have Tailwind CSS set up in your project.
 *
 * To Run:
 * 1. Create a new React app: `npx create-react-app inventory-client`
 * 2. Install dependencies: `npm install axios`
 * 3. (Optional) Setup Tailwind CSS in your React app.
 * 4. Replace the contents of `src/App.js` with this code.
 * 5. Run `npm start`
 *
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';

// --- API Configuration ---
const API_URL = 'http://localhost:5000/api'; // Base URL for your backend

// --- Main App Component ---
export default function App() {
    // State to hold the authentication token
    const [token, setToken] = useState(localStorage.getItem('token'));

    // Function to set token in state and local storage
    const handleSetToken = (newToken) => {
        setToken(newToken);
        if (newToken) {
            localStorage.setItem('token', newToken);
            // Set auth token for all future axios requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        } else {
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
        }
    };

    // Handle logout
    const handleLogout = () => {
        handleSetToken(null);
    };

    return (
        <div className="min-h-screen bg-gray-100 font-sans">
            <header className="bg-white shadow">
                <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">Inventory Tracker</h1>
                    {token && (
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition duration-200"
                        >
                            Logout
                        </button>
                    )}
                </nav>
            </header>
            
            <main className="container mx-auto px-6 py-8">
                {/* Conditionally render Login page or Inventory Dashboard */}
                {!token ? (
                    <LoginPage onLoginSuccess={handleSetToken} />
                ) : (
                    <InventoryDashboard />
                )}
            </main>
        </div>
    );
}

// --- Login/Register Component ---
function LoginPage({ onLoginSuccess }) {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        const endpoint = isLogin ? '/auth/login' : '/auth/register';
        
        try {
            const res = await axios.post(`${API_URL}${endpoint}`, { username, password });
            
            if (isLogin) {
                // If login, save the token
                onLoginSuccess(res.data.token);
            } else {
                // If register, show success and switch to login
                setMessage('Registration successful! Please log in.');
                setIsLogin(true);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred.');
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
                {isLogin ? 'Login' : 'Register'}
            </h2>
            <form onSubmit={handleSubmit}>
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                {message && <p className="text-green-500 text-sm mb-4">{message}</p>}
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2" htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 mb-2" htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-200"
                >
                    {isLogin ? 'Login' : 'Register'}
                </button>
            </form>
            <p className="text-center mt-6">
                <button
                    onClick={() => {
                        setIsLogin(!isLogin);
                        setError('');
                        setMessage('');
                    }}
                    className="text-blue-600 hover:underline"
                >
                    {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
                </button>
            </p>
        </div>
    );
}

// --- Inventory Dashboard Component ---
function InventoryDashboard() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Form state
    const [name, setName] = useState('');
    const [quantity, setQuantity] = useState('');
    const [description, setDescription] = useState('');

    // Editing state
    const [editingItem, setEditingItem] = useState(null); // Holds the item being edited

    // Fetch all items from the protected route
    const fetchItems = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/items`);
            setItems(res.data);
            setError('');
        } catch (err) {
            setError('Failed to fetch items. Please check your connection or token.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch items on component mount
    useEffect(() => {
        fetchItems();
    }, []);

    // Handle Add/Update Item
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        
        const itemData = { 
            name, 
            quantity: Number(quantity), 
            description 
        };

        try {
            if (editingItem) {
                // Update existing item
                await axios.put(`${API_URL}/items/${editingItem._id}`, itemData);
            } else {
                // Add new item
                await axios.post(`${API_URL}/items`, itemData);
            }
            
            // Reset form and editing state, then refetch
            resetForm();
            await fetchItems();

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save item.');
        }
    };

    // Handle Delete Item
    const handleDelete = async (itemId) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                await axios.delete(`${API_URL}/items/${itemId}`);
                await fetchItems(); // Refetch after delete
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to delete item.');
            }
        }
    };

    // Handle Edit Button Click
    const handleEdit = (item) => {
        setEditingItem(item);
        setName(item.name);
        setQuantity(item.quantity);
        setDescription(item.description);
    };

    // Reset form
    const resetForm = () => {
        setEditingItem(null);
        setName('');
        setQuantity('');
        setDescription('');
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* --- Add/Edit Item Form --- */}
            <div className="md:col-span-1">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold mb-4">{editingItem ? 'Edit Item' : 'Add New Item'}</h3>
                    <form onSubmit={handleFormSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2" htmlFor="itemName">Name</label>
                            <input
                                type="text"
                                id="itemName"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2" htmlFor="itemQuantity">Quantity</label>
                            <input
                                type="number"
                                id="itemQuantity"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2" htmlFor="itemDescription">Description</label>
                            <textarea
                                id="itemDescription"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows="3"
                            ></textarea>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                type="submit"
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-200"
                            >
                                {editingItem ? 'Update Item' : 'Add Item'}
                            </button>
                            {editingItem && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition duration-200"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            {/* --- Inventory List --- */}
            <div className="md:col-span-2">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold mb-4">Current Inventory</h3>
                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                    {loading ? (
                        <p>Loading items...</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-max text-left">
                                <thead>
                                    <tr className="border-b">
                                        <th className="py-2 px-3">Name</th>
                                        <th className="py-2 px-3">Quantity</th>
                                        <th className="py-2 px-3 hidden md:table-cell">Description</th>
                                        <th className="py-2 px-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="py-4 text-center text-gray-500">No items in inventory.</td>
                                        </tr>
                                    ) : (
                                        items.map(item => (
                                            <tr key={item._id} className="border-b hover:bg-gray-50">
                                                <td className="py-3 px-3 font-medium">{item.name}</td>
                                                <td className="py-3 px-3">{item.quantity}</td>
                                                <td className="py-3 px-3 hidden md:table-cell text-sm text-gray-600">{item.description || 'N/A'}</td>
                                                <td className="py-3 px-3">
                                                    <button
                                                        onClick={() => handleEdit(item)}
                                                        className="text-blue-500 hover:text-blue-700 mr-3 text-sm"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item._id)}
                                                        className="text-red-500 hover:text-red-700 text-sm"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
