import { useContext, useState, useEffect } from 'react';
import Header from '../Header';
import { UserContext } from '../UserContext';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

export default function Dashboard() {
    const { user } = useContext(UserContext);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState('');
    const [items, setItems] = useState([]);
    const [showAddItemForm, setShowAddItemForm] = useState(false);
    const [newItem, setNewItem] = useState({
        name: '',
        price: '',
        description: '',
        category: 'other',
    });

    const [editForm, setEditForm] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        age: user?.age || '',
        contactNumber: user?.contactNumber || '',
        password: '', // Keep empty for security reasons, update only if changed
    });

    useEffect(() => {
        async function fetchItems() {
            try {
                const { data } = await axios.get(`/api/items?seller=${user._id}`);
                setItems(data);
            } catch (err) {
                console.error("Failed to fetch items:", err);
                setError('Failed to fetch items.');
            }
        }

        if (user) {
            fetchItems();
        }
    }, [user]);

    if (!user) {
        return <Navigate to="/login" />;
    }

    const handleEdit = () => {
        setIsEditing(true);
        setError('');
    };

    const handleSave = async () => {
        try {
            // Check uniqueness first
            const response = await axios.post('/api/check-uniqueness', {
                email: editForm.email,
                contactNumber: editForm.contactNumber,
                userId: user._id  // Use _id instead of id
            });

            if (response.data.emailExists) {
                setError('Email is already in use.');
                return;
            }

            if (response.data.contactNumberExists) {
                setError('Contact number is already in use.');
                return;
            }

            // If unique, proceed with update
            await axios.put(`/api/users/${user._id}`, editForm);
            alert('Profile updated successfully!');
            setIsEditing(false);
        } catch (err) {
            console.error("Update Error:", err);
            setError(err.response?.data?.message || 'Failed to update profile.');
        }
    };

    const handleCancel = () => {
        setEditForm({
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            email: user?.email || '',
            age: user?.age || '',
            contactNumber: user?.contactNumber || '',
            password: '',
        });
        setIsEditing(false);
        setError('');
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post('/api/items', { ...newItem, seller: user._id });
            setItems([...items, data]);
            setNewItem({
                name: '',
                price: '',
                description: '',
                category: 'other',
            });
            setShowAddItemForm(false);
            alert('Item added successfully!');
        } catch (err) {
            console.error("Failed to add item:", err);
            setError('Failed to add item.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-200">
            <Header />
            <div className="container mx-auto px-4 py-8">
                <div className="bg-gray-800 rounded-2xl p-6 shadow-lg text-white">
                    <h1 className="text-3xl font-serif mb-6">User Dashboard</h1>
                    {error && <p className="text-red-400 text-center">{error}</p>}
                    <div className="mb-8">
                        <div className="w-32 h-32 bg-gray-400 rounded-full mx-auto mb-4" />
                    </div>
                    {!isEditing ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="font-serif">First Name:</div>
                                <div>{user.firstName}</div>
                                <div className="font-serif">Last Name:</div>
                                <div>{user.lastName}</div>
                                <div className="font-serif">Email:</div>
                                <div>{user.email}</div>
                                <div className="font-serif">Age:</div>
                                <div>{user.age}</div>
                                <div className="font-serif">Contact Number:</div>
                                <div>{user.contactNumber}</div>
                            </div>
                            <button 
                                onClick={handleEdit}
                                className="primary mt-6 bg-cyan-600 hover:bg-cyan-700"
                            >
                                Edit Profile
                            </button>
                        </div>
                    ) : (
                        <form className="space-y-4" onSubmit={(e) => {
                            e.preventDefault();
                            handleSave();
                        }}>
                            <input
                                type="text"
                                placeholder="First Name"
                                value={editForm.firstName}
                                onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                                className="text-gray-800 w-full p-2 border rounded-md"
                            />
                            <input
                                type="text"
                                placeholder="Last Name"
                                value={editForm.lastName}
                                onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                                className="text-gray-800 w-full p-2 border rounded-md"
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                value={editForm.email}
                                onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                                className="text-gray-800 w-full p-2 border rounded-md"
                            />
                            <input
                                type="number"
                                placeholder="Age"
                                value={editForm.age}
                                onChange={(e) => setEditForm({...editForm, age: e.target.value})}
                                className="text-gray-800 w-full p-2 border rounded-md"
                            />
                            <input
                                type="text"
                                placeholder="Contact Number"
                                value={editForm.contactNumber}
                                onChange={(e) => setEditForm({...editForm, contactNumber: e.target.value})}
                                className="text-gray-800 w-full p-2 border rounded-md"
                            />
                            <input
                                type="password"
                                placeholder="New Password (leave blank to keep current)"
                                value={editForm.password}
                                onChange={(e) => setEditForm({...editForm, password: e.target.value})}
                                className="text-gray-800 w-full p-2 border rounded-md"
                            />
                            <div className="flex space-x-4">
                                <button 
                                    type="submit"
                                    className="primary bg-green-600 hover:bg-green-700"
                                >
                                    Save
                                </button>
                                <button 
                                    type="button"
                                    onClick={handleCancel}
                                    className="primary bg-red-600 hover:bg-red-700"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>
                <div className="bg-gray-800 rounded-2xl p-6 shadow-lg text-white mt-8">
                    <h2 className="text-2xl font-serif mb-6">Your Items</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {items.map(item => (
                            <div key={item._id} className="bg-gray-700 rounded-lg p-4 shadow-md">
                                <h3 className="text-xl font-serif mb-2">{item.name}</h3>
                                <p className="text-gray-300">Price: ${item.price}</p>
                                <p className="text-gray-300">Description: {item.description}</p>
                                <p className="text-gray-300">Category: {item.category}</p>
                            </div>
                        ))}
                    </div>
                    <button 
                        onClick={() => setShowAddItemForm(!showAddItemForm)}
                        className="primary mt-6 bg-blue-600 hover:bg-blue-700"
                    >
                        {showAddItemForm ? 'Cancel' : 'Add Item'}
                    </button>
                    {showAddItemForm && (
                        <div className="mt-6 space-y-4 bg-gray-700 p-4 rounded-md">
                            <form onSubmit={handleAddItem}>
                                <input
                                    type="text"
                                    placeholder="Item Name"
                                    value={newItem.name}
                                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                    className="text-gray-800 w-full p-2 border rounded-md"
                                />
                                <input
                                    type="number"
                                    placeholder="Price"
                                    value={newItem.price}
                                    onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                                    className="text-gray-800 w-full p-2 border rounded-md"
                                />
                                <input
                                    type="text"
                                    placeholder="Description"
                                    value={newItem.description}
                                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                                    className="text-gray-800 w-full p-2 border rounded-md"
                                />
                                <select
                                    value={newItem.category}
                                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                                    className="text-gray-800 w-full p-2 border rounded-md"
                                >
                                    <option value="clothing">Clothing</option>
                                    <option value="grocery">Grocery</option>
                                    <option value="electronics">Electronics</option>
                                    <option value="other">Other</option>
                                </select>
                                <button type="submit" className="primary bg-blue-600 hover:bg-blue-700 mt-4">
                                    Add Item
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
