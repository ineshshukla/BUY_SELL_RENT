import { useContext, useState, useEffect } from 'react';
import Header from '../Header';
import { UserContext } from '../UserContext';
import axios from 'axios';

export default function Orders() {
    const { user } = useContext(UserContext);
    const [activeTab, setActiveTab] = useState('pending');
    const [pendingOrders, setPendingOrders] = useState([]);
    const [boughtItems, setBoughtItems] = useState([]);
    const [soldItems, setSoldItems] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchOrders();
    }, [user]);

    const fetchOrders = async () => {
        try {
            const [pendingRes, boughtRes, soldRes] = await Promise.all([
                axios.get('/api/orders/pending', { params: { userId: user._id }}),
                axios.get('/api/orders/bought', { params: { userId: user._id }}),
                axios.get('/api/orders/sold', { params: { userId: user._id }})
            ]);
            
            setPendingOrders(pendingRes.data);
            console.log('Pending orders:', pendingRes.data);
            setBoughtItems(boughtRes.data);
            setSoldItems(soldRes.data);
        } catch (err) {
            console.error("Failed to fetch orders:", err);
            setError('Failed to fetch orders.');
        }
    };

    const verifyOrder = async (orderId, otp) => {
        try {
            await axios.post('/api/orders/verify', { orderId, otp });
            fetchOrders(); // Refresh orders after verification
            alert('Order verified successfully!');
        } catch (err) {
            alert('Invalid OTP');
        }
    };

    const renderPendingOrders = () => (
        pendingOrders.map(order => (
            <div key={order._id} className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-xl mb-2">Order #{order._id}</h3>
                <div className="space-y-2">
                    {order.items.map((itemData, index) => (
                        <div key={index} className="ml-4 border-l-2 border-gray-600 pl-4">
                            <p className="font-medium">{itemData.item?.name}</p>
                            <p className="text-gray-300">Price: ${itemData.item?.price}</p>
                            <p className="text-gray-300">
                                Seller: {itemData.seller?.firstName} {itemData.seller?.lastName}
                            </p>
                            <p className="text-gray-300">Status: {itemData.status}</p>
                            {itemData.status === 'pending' && (
                                <p className="text-yellow-300">OTP: {itemData.otp}</p>
                            )}
                        </div>
                    ))}
                </div>
                <p className="mt-4">Total: ${order.total}</p>
            </div>
        ))
    );

    const renderBoughtItems = () => {
        // Flatten all items from all orders into a single array
        const allBoughtItems = boughtItems.flatMap(order => 
            order.items.map(item => ({
                ...item.item,
                seller: item.seller,
                date: order.createdAt
            }))
        );

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {allBoughtItems.map((item, index) => (
                    <div key={index} className="bg-gray-700 rounded-lg p-4 shadow-md">
                        <h3 className="text-xl font-serif mb-2">{item.name}</h3>
                        <p className="text-gray-300">Price: ${item.price}</p>
                        <p className="text-gray-300">Description: {item.description}</p>
                        <p className="text-gray-300">Category: {item.category}</p>
                        <p className="text-gray-300">
                            Seller: {item.seller.firstName} {item.seller.lastName}
                        </p>
                        <p className="text-gray-300">
                            Date: {new Date(item.date).toLocaleDateString()}
                        </p>
                    </div>
                ))}
            </div>
        );
    };

    const renderSoldItems = () => {
        // Flatten all items from all orders and only include completed deliveries
        const allSoldItems = soldItems.flatMap(order => 
            order.items
                .filter(item => item.status === 'completed') // Only include completed items
                .map(item => ({
                    ...item.item,
                    buyer: order.buyer,
                    date: order.createdAt
                }))
        );

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {allSoldItems.length > 0 ? (
                    allSoldItems.map((item, index) => (
                        <div key={index} className="bg-gray-700 rounded-lg p-4 shadow-md">
                            <h3 className="text-xl font-serif mb-2">{item.name}</h3>
                            <p className="text-gray-300">Price: ${item.price}</p>
                            <p className="text-gray-300">Description: {item.description}</p>
                            <p className="text-gray-300">Category: {item.category}</p>
                            <p className="text-gray-300">
                                Buyer: {item.buyer.email}
                            </p>
                            <p className="text-gray-300">
                                Date: {new Date(item.date).toLocaleDateString()}
                            </p>
                        </div>
                    ))
                ) : (
                    <p className="col-span-full text-center text-gray-400">No completed sales yet</p>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-200">
            <Header />
            <div className="container mx-auto px-4 py-8">
                <div className="bg-gray-800 rounded-2xl p-6 shadow-lg text-white">
                    <h1 className="text-3xl font-serif mb-6">Orders</h1>
                    {error && <p className="text-red-400 text-center">{error}</p>}
                    
                    <div className="flex space-x-4 mb-6">
                        <button 
                            className={`px-4 py-2 rounded ${activeTab === 'pending' ? 'bg-blue-500' : 'bg-gray-600'}`}
                            onClick={() => setActiveTab('pending')}
                        >
                            Pending Orders
                        </button>
                        <button 
                            className={`px-4 py-2 rounded ${activeTab === 'bought' ? 'bg-blue-500' : 'bg-gray-600'}`}
                            onClick={() => setActiveTab('bought')}
                        >
                            Bought Items
                        </button>
                        <button 
                            className={`px-4 py-2 rounded ${activeTab === 'sold' ? 'bg-blue-500' : 'bg-gray-600'}`}
                            onClick={() => setActiveTab('sold')}
                        >
                            Sold Items
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {activeTab === 'pending' && renderPendingOrders()}
                        {activeTab === 'bought' && renderBoughtItems()}
                        {activeTab === 'sold' && renderSoldItems()}
                    </div>
                </div>
            </div>
        </div>
    );
}
