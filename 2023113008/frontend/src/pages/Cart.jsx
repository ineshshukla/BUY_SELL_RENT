import { useContext, useState, useEffect } from 'react';
import Header from '../Header';
import { UserContext } from '../UserContext';
import axios from 'axios';

export default function Cart() {
    const { user } = useContext(UserContext);
    const [items, setItems] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        async function fetchCartItems() {
            try {
                const { data } = await axios.get('/api/cart/items', {
                    params: { 
                        userId: user._id,
                        status: 'available' // Only fetch available items
                    }
                });
                setItems(data);
            } catch (err) {
                console.error("Failed to fetch cart items:", err);
                setError('Failed to fetch cart items.');
            }
        }

        if (user) {
            fetchCartItems();
        }
    }, [user]);

    const removeFromCart = async (itemId) => {
        try {
            await axios.post('/api/cart/remove', { userId: user._id, itemId });
            setItems(items.filter(item => item._id !== itemId));
            alert('Item removed from cart successfully');
        } catch (err) {
            console.error("Failed to remove item from cart:", err);
            setError('Failed to remove item from cart.');
        }
    };

    const placeOrder = async () => {
        try {
            // First check if all items are still available
            const availableItems = items.filter(item => item.status === 'available');
            if (availableItems.length !== items.length) {
                setError('Some items in your cart are no longer available');
                return;
            }

            const { data } = await axios.post('/api/orders/create', { 
                userId: user._id,
                items: items.map(item => ({
                    _id: item._id,
                    price: item.price,
                    seller: item.seller._id
                }))
            });

            // Clear cart after successful order
            setItems([]); 
            alert(`Order placed successfully! Your OTP is: ${data.otp}`);
        } catch (err) {
            console.error("Failed to place order:", err);
            setError('Failed to place order.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-200">
            <Header />
            <div className="container mx-auto px-4 py-8">
                <div className="bg-gray-800 rounded-2xl p-6 shadow-lg text-white">
                    <h1 className="text-3xl font-serif mb-6">Your Cart</h1>
                    {error && <p className="text-red-400 text-center">{error}</p>}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {items.map(item => (
                            <div key={item._id} className="bg-gray-700 rounded-lg p-4 shadow-md">
                                <h3 className="text-xl font-serif mb-2">{item.name}</h3>
                                <p className="text-gray-300">Price: ${item.price}</p>
                                <p className="text-gray-300">Description: {item.description}</p>
                                <p className="text-gray-300">Category: {item.category}</p>
                                <button 
                                    onClick={() => removeFromCart(item._id)} 
                                    className="mt-4 bg-red-500 text-white py-2 px-4 rounded"
                                >
                                    Remove from Cart
                                </button>
                            </div>
                        ))}
                    </div>
                    {items.length > 0 && (
                        <button 
                            onClick={placeOrder} 
                            className="mt-8 bg-green-500 text-white py-2 px-6 rounded-lg text-lg"
                        >
                            Place Order
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
