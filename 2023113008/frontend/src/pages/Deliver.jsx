import { useContext, useState, useEffect } from 'react';
import Header from '../Header';
import { UserContext } from '../UserContext';
import axios from 'axios';

export default function Deliver() {
    const { user } = useContext(UserContext);
    const [pendingDeliveries, setPendingDeliveries] = useState([]);
    const [otpInputs, setOtpInputs] = useState({});
    const [error, setError] = useState('');

    useEffect(() => {
        fetchPendingDeliveries();
    }, [user]);

    const fetchPendingDeliveries = async () => {
        try {
            const { data } = await axios.get('/api/orders/pending-deliveries', {
                params: { sellerId: user._id }
            });
            setPendingDeliveries(data);
        } catch (err) {
            console.error("Failed to fetch deliveries:", err);
            setError('Failed to fetch pending deliveries.');
        }
    };

    const handleOtpChange = (orderId, value) => {
        setOtpInputs(prev => ({
            ...prev,
            [orderId]: value
        }));
    };

    const verifyAndComplete = async (orderId, itemId) => {
        try {
            await axios.post('/api/orders/verify', {
                orderId,
                itemId,
                sellerId: user._id,
                otp: otpInputs[`${orderId}-${itemId}`]
            });
            
            fetchPendingDeliveries(); // Refresh the list
            alert('Delivery completed successfully!');
            
            // Clear OTP input after successful verification
            setOtpInputs(prev => {
                const updated = { ...prev };
                delete updated[`${orderId}-${itemId}`];
                return updated;
            });
        } catch (err) {
            alert(err.response?.data?.message || 'Invalid OTP. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-200">
            <Header />
            <div className="container mx-auto px-4 py-8">
                <div className="bg-gray-800 rounded-2xl p-6 shadow-lg text-white">
                    <h1 className="text-3xl font-serif mb-6">Pending Deliveries</h1>
                    {error && <p className="text-red-400 text-center mb-4">{error}</p>}
                    
                    <div className="grid grid-cols-1 gap-4">
                        {pendingDeliveries.map(order => (
                            <div key={order._id} className="bg-gray-700 p-4 rounded-lg">
                                <h3 className="text-xl mb-2">Order #{order._id}</h3>
                                <p>Buyer: {order.buyer.email}</p>
                                
                                {order.items.map((item, index) => (
                                    <div key={index} className="mt-4 border-t border-gray-600 pt-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold">{item.item.name}</p>
                                                <p className="text-gray-300">Price: ${item.item.price}</p>
                                                <p className="text-gray-300">Description: {item.item.description}</p>
                                            </div>
                                            
                                            <div className="flex flex-col items-end space-y-2">
                                                <input
                                                    type="text"
                                                    placeholder="Enter OTP"
                                                    className="p-2 rounded text-black"
                                                    value={otpInputs[`${order._id}-${item.item._id}`] || ''}
                                                    onChange={(e) => handleOtpChange(`${order._id}-${item.item._id}`, e.target.value)}
                                                />
                                                <button
                                                    onClick={() => verifyAndComplete(order._id, item.item._id)}
                                                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                                >
                                                    Complete Delivery
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                        
                        {pendingDeliveries.length === 0 && (
                            <p className="text-center text-gray-400">No pending deliveries</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
