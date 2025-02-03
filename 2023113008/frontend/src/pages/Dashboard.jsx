import { useContext, useState } from 'react';
import Header from '../Header';
import { UserContext } from '../UserContext';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

export default function Dashboard() {
    const { user } = useContext(UserContext);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState('');
    const [editForm, setEditForm] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        age: user?.age || '',
        contactNumber: user?.contactNumber || '',
        password: '', // Keep empty for security reasons, update only if changed
    });

    if (!user) {
        return <Navigate to="/login" />;
    }

    const handleEdit = () => {
        setIsEditing(true);
        setError('');
    };

    // Update the handleSave function
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
            </div>
        </div>
    );
}
